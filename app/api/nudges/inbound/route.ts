import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validateTwilioSignature, sendSms } from "@/lib/integrations/twilio";
import { parseRsvpReply } from "@/lib/integrations/claude";

// Twilio posts as application/x-www-form-urlencoded with these fields:
// From, To, Body, MessageSid, AccountSid, ...

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((v, k) => { params[k] = String(v); });

    // Validate signature for security
    const signature = req.headers.get("x-twilio-signature");
    const url = req.url; // Twilio signs against the full URL
    const valid = await validateTwilioSignature(signature, url, params);

    if (!valid && process.env.NODE_ENV === "production") {
      console.warn("[nudges/inbound] invalid signature");
      return new NextResponse("Forbidden", { status: 403 });
    }

    const from = params.From;
    const body = params.Body?.trim();
    if (!from || !body) {
      return new NextResponse("", { status: 200 }); // ignore but ack
    }

    const admin = createAdminClient();

    // Find user by phone
    const { data: user } = await admin
      .from("users")
      .select("id, name")
      .eq("phone", from)
      .maybeSingle();

    if (!user) {
      // Unknown number — reply with onboarding nudge
      await sendSms({
        to: from,
        body: "Hey! Looks like you're texting Hangouts but you're not signed up yet. Get the app: hangouts.app",
      });
      return new NextResponse("", { status: 200 });
    }

    // Find the most recent nudged hangout for this user
    const { data: lastNudge } = await admin
      .from("nudges")
      .select("hangout_id, hangouts(id, title, status)")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastNudge?.hangout_id) {
      await sendSms({ to: from, body: `Hey ${user.name || "mate"} — no active hangouts to reply to. Open the app to see what's on.` });
      return new NextResponse("", { status: 200 });
    }

    const hangout: any = Array.isArray(lastNudge.hangouts) ? lastNudge.hangouts[0] : lastNudge.hangouts;
    if (!hangout || hangout.status !== "proposed") {
      return new NextResponse("", { status: 200 });
    }

    // Parse the reply
    let parsed: { status: "in" | "maybe" | "out" | "unclear"; reason?: string };
    try {
      parsed = await parseRsvpReply({ hangoutTitle: hangout.title, replyText: body });
    } catch {
      parsed = { status: "unclear" };
    }

    if (parsed.status === "unclear") {
      await sendSms({
        to: from,
        body: `couldn't tell if that was a yes or no haha — reply "yes", "no", or "maybe" for ${hangout.title}?`,
      });
      return new NextResponse("", { status: 200 });
    }

    // Update RSVP
    await admin
      .from("rsvps")
      .update({
        status: parsed.status,
        responded_at: new Date().toISOString(),
        response_method: "sms",
      })
      .eq("hangout_id", hangout.id)
      .eq("user_id", user.id);

    // Mark the nudge as responded
    await admin
      .from("nudges")
      .update({
        responded_at: new Date().toISOString(),
      })
      .eq("hangout_id", hangout.id)
      .eq("user_id", user.id)
      .is("responded_at", null);

    // Confirmation SMS
    const confirmations = {
      in: `locked in for ${hangout.title} 🎉 see ya there`,
      maybe: `noted — you're a maybe for ${hangout.title}. we'll check in closer to the date`,
      out: `all good ${user.name || "mate"} — marked you as a no for ${hangout.title}`,
    };
    await sendSms({ to: from, body: confirmations[parsed.status] });

    return new NextResponse("", { status: 200 });
  } catch (err: any) {
    console.error("[nudges/inbound] error:", err);
    return new NextResponse("", { status: 200 }); // Always ack to Twilio
  }
}
