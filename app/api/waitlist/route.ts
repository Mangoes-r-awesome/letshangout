import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { parseBody } from "@/lib/utils/validate";
import { rateLimit, clientIp } from "@/lib/utils/rate-limit";
import { log } from "@/lib/utils/logger";

const Schema = z.object({
  email: z.string().email().max(254),
  phone: z.string().max(20).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  // 10 signups / hour per IP — generous for genuine users, throttles spammers.
  const limit = rateLimit(`waitlist:ip:${ip}`, 10, 60 * 60_000);
  if (!limit.ok) {
    log.warn("waitlist", "rate limit hit", { ip });
    return NextResponse.json({ error: "Too many signups from this address" }, { status: 429 });
  }

  const parsed = await parseBody(req, Schema);
  if (parsed instanceof NextResponse) return parsed;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    log.info("waitlist", "supabase not configured, swallowing", { email: parsed.email });
    return NextResponse.json({ ok: true, queued: true });
  }

  try {
    const supabase = createClient(url, key);
    const { error } = await supabase
      .from("waitlist")
      .insert({
        email: parsed.email.toLowerCase().trim(),
        phone: parsed.phone?.trim() || null,
        source: "landing",
      });

    if (error) {
      if (error.code === "23505") return NextResponse.json({ ok: true, alreadyOnList: true });
      log.error("waitlist", "supabase insert", { code: error.code, message: error.message });
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    log.error("waitlist", "unhandled", { message: err?.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
