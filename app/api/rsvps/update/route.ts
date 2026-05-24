import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/integrations/twilio";

const VALID_STATUSES = ["in", "maybe", "out", "pending"] as const;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { hangout_id, status } = await req.json();
    if (!hangout_id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Update the RSVP first
    const { error } = await admin
      .from("rsvps")
      .update({
        status,
        responded_at: status !== "pending" ? new Date().toISOString() : null,
        response_method: "app",
      })
      .eq("hangout_id", hangout_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[rsvps/update] error:", error);
      return NextResponse.json({ error: "Couldn't update" }, { status: 500 });
    }

    // CROSS-CHANNEL POLISH:
    // If the user just answered in-app AND there's a recent un-responded nudge SMS
    // sitting in their texts, close the loop by sending them a confirmation SMS.
    // This prevents the awkward "reply to old text two days later" situation.
    if (status !== "pending") {
      try {
        const { data: openNudge } = await admin
          .from("nudges")
          .select("id, sent_at, channel, hangouts(title)")
          .eq("hangout_id", hangout_id)
          .eq("user_id", user.id)
          .eq("channel", "sms")
          .is("responded_at", null)
          .order("sent_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (openNudge?.id) {
          // Mark the nudge as responded (via app) so future cron doesn't re-fire
          await admin
            .from("nudges")
            .update({ responded_at: new Date().toISOString() })
            .eq("id", openNudge.id);

          // Get user's phone + name for the confirmation SMS
          const { data: profile } = await admin
            .from("users")
            .select("phone, name")
            .eq("id", user.id)
            .single();

          const hangoutTitle = (openNudge.hangouts as any)?.title || "the hangout";
          const name = profile?.name || "mate";

          if (profile?.phone) {
            const confirmations: Record<string, string> = {
              in: `nice — locked you in for ${hangoutTitle} via the app. no need to reply to my earlier text 🎉`,
              maybe: `got it ${name} — you're a maybe for ${hangoutTitle}. we'll check in closer to the date.`,
              out: `all good ${name} — marked you as a no for ${hangoutTitle}. catch ya next one.`,
            };
            const body = confirmations[status];
            if (body) {
              // Fire and forget — don't fail the RSVP update if SMS fails
              sendSms({ to: profile.phone, body }).catch((err) => {
                console.error("[rsvps/update] confirmation SMS failed:", err);
              });
            }
          }
        }
      } catch (crossChannelErr) {
        // Never block the RSVP itself on the cross-channel side effect
        console.error("[rsvps/update] cross-channel error:", crossChannelErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
