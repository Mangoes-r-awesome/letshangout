import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { parseBody } from "@/lib/utils/validate";
import { rateLimit, clientIp } from "@/lib/utils/rate-limit";
import { log } from "@/lib/utils/logger";

const Schema = z.object({
  business_name: z.string().max(120).optional().nullable(),
  contact_name: z.string().max(80).optional().nullable(),
  email: z.string().email().max(254),
  phone: z.string().max(20).optional().nullable(),
  vendor_type: z.enum(["restaurant", "experience", "venue", "other"]).optional(),
  message: z.string().max(2000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = rateLimit(`partnerships:ip:${ip}`, 5, 60 * 60_000);
  if (!limit.ok) {
    log.warn("partnerships/signup", "rate limit hit", { ip });
    return NextResponse.json({ error: "Too many submissions" }, { status: 429 });
  }

  const parsed = await parseBody(req, Schema);
  if (parsed instanceof NextResponse) return parsed;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { error } = await admin.from("partnership_signups").insert({
    business_name: parsed.business_name?.trim() || null,
    contact_name: parsed.contact_name?.trim() || null,
    email: parsed.email.toLowerCase().trim(),
    phone: parsed.phone?.trim() || null,
    vendor_type: parsed.vendor_type || "other",
    message: parsed.message?.trim() || null,
    user_id: user?.id || null,
  });

  if (error) {
    log.error("partnerships/signup", "insert failed", { message: error.message });
    return NextResponse.json({ error: "Couldn't save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
