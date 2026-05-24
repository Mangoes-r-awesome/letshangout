import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { parseBody } from "@/lib/utils/validate";
import { rateLimit, clientIp } from "@/lib/utils/rate-limit";
import { log } from "@/lib/utils/logger";

const Schema = z.object({
  phone: z.string().regex(/^\+\d{8,15}$/, "must be E.164"),
  code: z.string().regex(/^\d{4,8}$/, "must be a 4-8 digit code"),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // 8 attempts / 10 min per IP to slow brute-force.
  const limit = rateLimit(`verify-otp:ip:${ip}`, 8, 10 * 60_000);
  if (!limit.ok) {
    log.warn("auth/verify-otp", "rate limit hit", { ip });
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const parsed = await parseBody(req, Schema);
  if (parsed instanceof NextResponse) return parsed;

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone: parsed.phone,
      token: parsed.code,
      type: "sms",
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Invalid code" },
        { status: 401 }
      );
    }

    // Create profile row if first-time. Admin client bypasses RLS.
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("users")
      .select("id, name")
      .eq("id", data.user.id)
      .maybeSingle();

    let needsOnboarding = false;

    if (!existing) {
      await admin.from("users").insert({
        id: data.user.id,
        phone: data.user.phone,
        emoji: "🦊",
      });
      needsOnboarding = true;
    } else if (!existing.name) {
      needsOnboarding = true;
    }

    return NextResponse.json({ ok: true, needsOnboarding });
  } catch (err: any) {
    log.error("auth/verify-otp", "unhandled error", { message: err?.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
