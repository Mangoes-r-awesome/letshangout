import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/integrations/twilio";
import { generateNudge } from "@/lib/integrations/claude";
import { hangoutDeepLink } from "@/lib/utils/short-code";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { hangout_id, target_user_id, custom_message } = await req.json();
    if (!hangout_id || !target_user_id) {
      return NextResponse.json({ error: "hangout_id and target_user_id required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: hangout } = await admin
      .from("hangouts")
      .select("id, squad_id, title, starts_at, short_code")
      .eq("id", hangout_id)
      .single();
    if (!hangout) return NextResponse.json({ error: "Hangout not found" }, { status: 404 });

    const { data: target } = await admin
      .from("users")
      .select("id, name, phone")
      .eq("id", target_user_id)
      .single();
    if (!target?.phone) return NextResponse.json({ error: "Target has no phone" }, { status: 400 });

    const { data: senderMembership } = await admin
      .from("squad_members")
      .select("role")
      .eq("squad_id", hangout.squad_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!senderMembership) return NextResponse.json({ error: "Not authorised" }, { status: 403 });

    const { data: stats } = await admin
      .from("squad_stats")
      .select("reply_rate")
      .eq("squad_id", hangout.squad_id)
      .eq("user_id", target_user_id)
      .maybeSingle();

    const { count: priorNudges } = await admin
      .from("nudges")
      .select("*", { count: "exact", head: true })
      .eq("hangout_id", hangout_id)
      .eq("user_id", target_user_id);

    let daysUntil = 14;
    if (hangout.starts_at) {
      const diffMs = new Date(hangout.starts_at).getTime() - Date.now();
      daysUntil = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Generate the body
    let body = custom_message;
    if (!body) {
      try {
        body = await generateNudge({
          recipientName: target.name || "mate",
          hangoutTitle: hangout.title,
          daysUntil,
          recipientReplyRate: stats?.reply_rate ?? 75,
          nudgeAttemptNumber: (priorNudges || 0) + 1,
        });
      } catch (err) {
        console.error("[nudges/send] claude failed, falling back:", err);
        body = `Hey ${target.name || "mate"} — you in or out for ${hangout.title}? 🙃`;
      }
    }

    // Append the deep link. Two doors into the same RSVP record — tap or text reply.
    const link = hangoutDeepLink(hangout.short_code);
    const fullMessage = `${body} ${link}`;

    let twilioResult = null;
    try {
      twilioResult = await sendSms({ to: target.phone, body: fullMessage });
    } catch (err: any) {
      console.error("[nudges/send] twilio failed:", err);
      return NextResponse.json({ error: `SMS failed: ${err.message}` }, { status: 502 });
    }

    const toneLevel = Math.min(5, 1 + (priorNudges || 0) + ((stats?.reply_rate ?? 75) < 50 ? 1 : 0));
    await admin.from("nudges").insert({
      hangout_id,
      user_id: target_user_id,
      channel: "sms",
      tone_level: toneLevel,
      message: fullMessage,
      triggered_by: "manual",
      triggered_by_user: user.id,
    });

    await admin
      .from("hangouts")
      .update({ last_nudge_at: new Date().toISOString() })
      .eq("id", hangout_id);

    return NextResponse.json({ ok: true, message: fullMessage, twilio_sid: twilioResult?.sid });
  } catch (err: any) {
    console.error("[nudges/send] error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
