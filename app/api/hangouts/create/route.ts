import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateShortCode } from "@/lib/utils/short-code";
import { parseBody } from "@/lib/utils/validate";
import { log } from "@/lib/utils/logger";

const Schema = z.object({
  squad_id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  emoji: z.string().max(8).optional(),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().max(300).optional().nullable(),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
  cost_per_person: z.union([z.string(), z.number()]).optional().nullable(),
  bring: z.string().max(300).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = await parseBody(req, Schema);
  if (parsed instanceof NextResponse) return parsed;

  const { data: membership } = await supabase
    .from("squad_members")
    .select("role")
    .eq("squad_id", parsed.squad_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "Not a squad member" }, { status: 403 });

  const admin = createAdminClient();

  let shortCode = generateShortCode();
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await admin
      .from("hangouts")
      .select("id")
      .eq("short_code", shortCode)
      .maybeSingle();
    if (!existing) break;
    shortCode = generateShortCode();
  }

  const costNum = parsed.cost_per_person == null || parsed.cost_per_person === ""
    ? null
    : typeof parsed.cost_per_person === "number"
      ? parsed.cost_per_person
      : parseFloat(parsed.cost_per_person);

  const { data: hangout, error: hErr } = await admin
    .from("hangouts")
    .insert({
      squad_id: parsed.squad_id,
      organiser_id: user.id,
      title: parsed.title,
      cover_emoji: parsed.emoji || "🍻",
      description: parsed.description?.trim() || null,
      location: parsed.location?.trim() || null,
      starts_at: parsed.starts_at || null,
      ends_at: parsed.ends_at || null,
      cost_per_person: costNum != null && !isNaN(costNum) ? costNum : null,
      bring: parsed.bring?.trim() || null,
      status: "proposed",
      short_code: shortCode,
    })
    .select()
    .single();

  if (hErr || !hangout) {
    log.error("hangouts/create", "insert failed", { message: hErr?.message });
    return NextResponse.json({ error: "Couldn't create" }, { status: 500 });
  }

  const { data: members } = await admin
    .from("squad_members")
    .select("user_id")
    .eq("squad_id", parsed.squad_id);

  if (members && members.length > 0) {
    const rsvps = members.map((m) => ({
      hangout_id: hangout.id,
      user_id: m.user_id,
      status: m.user_id === user.id ? "in" : "pending",
      response_method: m.user_id === user.id ? "app" : null,
      responded_at: m.user_id === user.id ? new Date().toISOString() : null,
    }));
    await admin.from("rsvps").insert(rsvps);
  }

  return NextResponse.json({ ok: true, hangout });
}
