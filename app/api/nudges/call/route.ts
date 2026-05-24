import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { placeCall } from "@/lib/integrations/twilio";
import { generateVoiceScript } from "@/lib/integrations/claude";
import { parseBody } from "@/lib/utils/validate";
import { rateLimit, clientIp } from "@/lib/utils/rate-limit";
import { log } from "@/lib/utils/logger";

const Schema = z.object({
  hangout_id: z.string().uuid(),
  target_user_id: z.string().uuid(),
});

// Best-effort fallback script if Claude is unavailable.
function fallbackScript(name: string, title: string, organiserName: string) {
  return `Hey ${name}, it's the Hangouts agent. ${organiserName} is sorting out ${title} and we still need a yes or no from you. We've texted a few times. Quick reply to the text — even just yes or no — and we're sorted. If now's not a good time, just reply to the text we sent earlier.`;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // Calls cost real money. Hard cap: 3 calls / hour per IP, plus 1 / hour per recipient
  // (enforced per (hangout, target) below).
  const ipLimit = rateLimit(`nudge-call:ip:${ip}`, 3, 60 * 60_000);
  if (!ipLimit.ok) {
    return NextResponse.json({ error: "Too many calls. Try again later." }, { status: 429 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = await parseBody(req, Schema);
  if (parsed instanceof NextResponse) return parsed;

  // Caller must be in the squad
  const admin = createAdminClient();
  const { data: hangout } = await admin
    .from("hangouts")
    .select("id, title, starts_at, squad_id, organiser_id, organisers:users!hangouts_organiser_id_fkey(name)")
    .eq("id", parsed.hangout_id)
    .single();
  if (!hangout) return NextResponse.json({ error: "Hangout not found" }, { status: 404 });

  const { data: callerMembership } = await admin
    .from("squad_members")
    .select("role")
    .eq("squad_id", hangout.squad_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!callerMembership) return NextResponse.json({ error: "Not a squad member" }, { status: 403 });

  // Target must also be a squad member, must have a phone, and must not have RSVP'd yet
  const { data: target } = await admin
    .from("users")
    .select("id, name, phone")
    .eq("id", parsed.target_user_id)
    .maybeSingle();
  if (!target) return NextResponse.json({ error: "Target not found" }, { status: 404 });
  if (!target.phone) return NextResponse.json({ error: "Target has no phone on file" }, { status: 400 });

  const { data: targetMembership } = await admin
    .from("squad_members")
    .select("role")
    .eq("squad_id", hangout.squad_id)
    .eq("user_id", parsed.target_user_id)
    .maybeSingle();
  if (!targetMembership) return NextResponse.json({ error: "Target not in squad" }, { status: 400 });

  const { data: rsvp } = await admin
    .from("rsvps")
    .select("status")
    .eq("hangout_id", parsed.hangout_id)
    .eq("user_id", parsed.target_user_id)
    .maybeSingle();
  if (rsvp && rsvp.status !== "pending") {
    return NextResponse.json({ error: "They've already RSVP'd" }, { status: 400 });
  }

  // Per-recipient cap: 1 call / hour per (hangout, target). Don't let a squad
  // chat-bomb someone.
  const recipientLimit = rateLimit(`nudge-call:target:${parsed.hangout_id}:${parsed.target_user_id}`, 1, 60 * 60_000);
  if (!recipientLimit.ok) {
    return NextResponse.json({ error: "Already called them recently. Give them a minute." }, { status: 429 });
  }

  // Days until + confirmed count + previous nudge count for the script
  const daysUntil = hangout.starts_at
    ? Math.max(0, Math.ceil((new Date(hangout.starts_at).getTime() - Date.now()) / 86400000))
    : 0;

  const [{ data: confirmedRows }, { data: previousNudges }] = await Promise.all([
    admin.from("rsvps").select("id").eq("hangout_id", parsed.hangout_id).eq("status", "in"),
    admin.from("nudges").select("id").eq("hangout_id", parsed.hangout_id).eq("user_id", parsed.target_user_id),
  ]);

  const organiserName = ((hangout as any).organisers?.name as string | undefined) || "your mate";

  // Generate the script via Claude, fall back to template if it fails
  let script: string;
  try {
    script = await generateVoiceScript({
      recipientName: target.name || "mate",
      hangoutTitle: hangout.title,
      daysUntil,
      organiserName,
      confirmedCount: confirmedRows?.length ?? 0,
      smsNudgesSent: previousNudges?.length ?? 0,
    });
  } catch (err: any) {
    log.warn("nudges/call", "claude failed, using fallback", { message: err?.message });
    script = fallbackScript(target.name || "mate", hangout.title, organiserName);
  }

  // Insert the nudge row first so the TwiML URL can reference it
  const { data: nudge, error: insErr } = await admin
    .from("nudges")
    .insert({
      hangout_id: parsed.hangout_id,
      user_id: parsed.target_user_id,
      channel: "call",
      tone_level: 5, // calling = max escalation
      message: script,
      triggered_by: "manual",
      triggered_by_user: user.id,
    })
    .select("id")
    .single();

  if (insErr || !nudge) {
    log.error("nudges/call", "couldn't insert nudge row", { message: insErr?.message });
    return NextResponse.json({ error: "Couldn't place call" }, { status: 500 });
  }

  // Build the TwiML URL Twilio will fetch when the call connects
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://letshangout.au";
  const twimlUrl = `${appUrl}/api/calls/twiml/${nudge.id}`;

  try {
    const result = await placeCall({ to: target.phone, twimlUrl });
    log.info("nudges/call", "call placed", { nudge_id: nudge.id, twilio_sid: result.sid });

    // Update last_nudge_at on the hangout for cron tracking
    await admin.from("hangouts").update({ last_nudge_at: new Date().toISOString() }).eq("id", parsed.hangout_id);

    return NextResponse.json({ ok: true, nudge_id: nudge.id, twilio_sid: result.sid });
  } catch (err: any) {
    // Roll back the nudge row so the agent feed doesn't show a phantom call
    await admin.from("nudges").delete().eq("id", nudge.id);
    log.error("nudges/call", "twilio call failed", { message: err?.message });
    return NextResponse.json({ error: err?.message || "Call failed" }, { status: 500 });
  }
}
