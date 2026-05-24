import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Twilio fetches this URL when an outbound voice call connects, and reads
// back the returned TwiML <Say> aloud via Polly TTS.
//
// Auth model: the nudge ID acts as an unguessable token (UUID). We also
// reject any nudge older than 10 minutes — beyond that the call should
// already have happened or timed out, so requests later are abusive.

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function twimlResponse(script: string): NextResponse {
  const safe = xmlEscape(script);
  // Polly.Olivia-Neural = Australian female neural voice. Sounds natural.
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="1"/>
  <Say voice="Polly.Olivia-Neural" language="en-AU">${safe}</Say>
  <Pause length="1"/>
</Response>`;
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

async function handle(_req: NextRequest, params: { nudgeId: string }) {
  const admin = createAdminClient();

  const { data: nudge } = await admin
    .from("nudges")
    .select("id, channel, message, sent_at")
    .eq("id", params.nudgeId)
    .maybeSingle();

  // Always return a polite TwiML — never reveal whether the nudge exists.
  // Twilio expects valid TwiML or the call drops awkwardly mid-ring.
  if (!nudge || nudge.channel !== "call" || !nudge.message) {
    return twimlResponse("Sorry — this hangout has already wrapped up. Catch you on the next one.");
  }

  // Reject stale nudges (>10 min) to bound the abuse window if someone
  // discovers a nudge ID later.
  const ageMs = Date.now() - new Date(nudge.sent_at).getTime();
  if (ageMs > 10 * 60_000) {
    return twimlResponse("This nudge has expired. Open the app to see the latest plans.");
  }

  return twimlResponse(nudge.message);
}

// Twilio defaults to POST for voice TwiML URLs but configurable to GET.
// Support both so users don't have to change Twilio settings.
export async function GET(req: NextRequest, { params }: { params: { nudgeId: string } }) {
  return handle(req, params);
}

export async function POST(req: NextRequest, { params }: { params: { nudgeId: string } }) {
  return handle(req, params);
}
