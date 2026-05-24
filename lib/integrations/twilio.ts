// Minimal Twilio REST client using fetch. No SDK = lighter bundle.

const TWILIO_BASE = "https://api.twilio.com/2010-04-01";

function authHeader() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required");
  return "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
}

export async function sendSms({ to, body }: { to: string; body: string }): Promise<{ sid: string; status: string }> {
  const from = process.env.TWILIO_NUMBER;
  if (!from) throw new Error("TWILIO_NUMBER required");

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const url = `${TWILIO_BASE}/Accounts/${sid}/Messages.json`;

  const params = new URLSearchParams({ To: to, From: from, Body: body });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[twilio] send failed:", res.status, text);
    throw new Error(`Twilio error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return { sid: data.sid, status: data.status };
}

// Places an outbound voice call. Twilio fetches `twimlUrl` when the call is
// answered and reads back the TwiML response (typically <Say>script</Say>).
// The Twilio number must have Voice capability enabled (SMS-only numbers fail).
export async function placeCall({ to, twimlUrl }: { to: string; twimlUrl: string }): Promise<{ sid: string; status: string }> {
  const from = process.env.TWILIO_NUMBER;
  if (!from) throw new Error("TWILIO_NUMBER required");

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const url = `${TWILIO_BASE}/Accounts/${sid}/Calls.json`;

  const params = new URLSearchParams({ To: to, From: from, Url: twimlUrl });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[twilio] call failed:", res.status, text);
    throw new Error(`Twilio call error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return { sid: data.sid, status: data.status };
}

/**
 * Validates that a request actually came from Twilio (signed webhook).
 * Important for the inbound SMS endpoint — otherwise anyone could spoof replies.
 * Docs: https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
export async function validateTwilioSignature(
  signature: string | null,
  url: string,
  params: Record<string, string>
): Promise<boolean> {
  if (!signature) return false;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return false;

  // Sort params and concatenate with URL
  const sorted = Object.keys(params).sort();
  let data = url;
  for (const key of sorted) data += key + params[key];

  // HMAC-SHA1 with auth token as key, base64-encoded
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(token);
  const dataBuffer = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, dataBuffer);
  const computed = Buffer.from(sigBuffer).toString("base64");

  return computed === signature;
}
