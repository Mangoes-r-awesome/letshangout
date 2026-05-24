import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseBody } from "@/lib/utils/validate";
import { rateLimit, clientIp } from "@/lib/utils/rate-limit";
import { log } from "@/lib/utils/logger";

const Schema = z.object({
  phone: z.string().min(1).max(20),
});

function normalisePhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-()]/g, "");
  if (/^\+\d{8,15}$/.test(cleaned)) return cleaned;
  if (/^0\d{9}$/.test(cleaned)) return "+61" + cleaned.slice(1);
  if (/^\d{9}$/.test(cleaned) && cleaned.startsWith("4")) return "+61" + cleaned;
  return null;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // Rate limit by IP: 5 OTP sends / 10 min. SMS costs money — be tight.
  const ipLimit = rateLimit(`send-otp:ip:${ip}`, 5, 10 * 60_000);
  if (!ipLimit.ok) {
    log.warn("auth/send-otp", "ip rate limit hit", { ip });
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const parsed = await parseBody(req, Schema);
  if (parsed instanceof NextResponse) return parsed;

  const normalised = normalisePhone(parsed.phone);
  if (!normalised) {
    return NextResponse.json(
      { error: "Enter a valid Australian mobile (e.g. 0412 345 678)" },
      { status: 400 }
    );
  }

  // Tighter limit per-number: 3 sends / 10 min. Stops the form being a free SMS gun.
  const phoneLimit = rateLimit(`send-otp:phone:${normalised}`, 3, 10 * 60_000);
  if (!phoneLimit.ok) {
    log.warn("auth/send-otp", "phone rate limit hit", { phone: normalised });
    return NextResponse.json(
      { error: "We already sent you a code recently. Check your texts." },
      { status: 429 }
    );
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalised,
      options: { channel: "sms" },
    });

    if (error) {
      log.error("auth/send-otp", "supabase error", { message: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, phone: normalised });
  } catch (err: any) {
    log.error("auth/send-otp", "unhandled error", { message: err?.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
