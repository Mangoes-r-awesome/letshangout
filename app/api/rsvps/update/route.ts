import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/integrations/twilio";
import { parseBody } from "@/lib/utils/validate";
import { log } from "@/lib/utils/logger";

const Schema = z.object({
  hangout_id: z.string().uuid(),
  status: z.enum(["in", "maybe", "out", "pending"]),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = await parseBody(req, Schema);
  if (parsed instanceof NextResponse) return parsed;

  const admin = createAdminClient();

  const { error } = await admin
    .from("rsvps")
    .update({
      status: parsed.status,
      responded_at: parsed.status !== "pending" ? new Date().toISOString() : null,
      response_method: "app",
    })
    .eq("hangout_id", parsed.hangout_id)
    .eq("user_id", user.id);

  if (error) {
    log.error("rsvps/update", "update failed", { message: error.message });
    return NextResponse.json({ error: "Couldn't update" }, { status: 500 });
  }

  // CROSS-CHANNEL POLISH: if user just answered in-app AND a recent un-responded
  // SMS nudge exists, send a confirmation SMS so they don't reply to the stale
  // text two days later.
  if (parsed.status === "in" || parsed.status === "maybe" || parsed.status === "out") {
    const decided = parsed.status;
    try {
      const { data: openNudge } = await admin
        .from("nudges")
        .select("id, sent_at, channel, hangouts(title)")
        .eq("hangout_id", parsed.hangout_id)
        .eq("user_id", user.id)
        .eq("channel", "sms")
        .is("responded_at", null)
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (openNudge?.id) {
        await admin
          .from("nudges")
          .update({ responded_at: new Date().toISOString() })
          .eq("id", openNudge.id);

        const { data: profile } = await admin
          .from("users")
          .select("phone, name")
          .eq("id", user.id)
          .single();

        const hangoutTitle = (openNudge.hangouts as any)?.title || "the hangout";
        const name = profile?.name || "mate";

        if (profile?.phone) {
          const confirmations: Record<"in" | "maybe" | "out", string> = {
            in: `nice — locked you in for ${hangoutTitle} via the app. no need to reply to my earlier text 🎉`,
            maybe: `got it ${name} — you're a maybe for ${hangoutTitle}. we'll check in closer to the date.`,
            out: `all good ${name} — marked you as a no for ${hangoutTitle}. catch ya next one.`,
          };
          const body = confirmations[decided];
          sendSms({ to: profile.phone, body }).catch((err) => {
            log.error("rsvps/update", "confirmation SMS failed", { message: err?.message });
          });
        }
      }
    } catch (crossChannelErr: any) {
      log.error("rsvps/update", "cross-channel error", { message: crossChannelErr?.message });
    }
  }

  return NextResponse.json({ ok: true });
}
