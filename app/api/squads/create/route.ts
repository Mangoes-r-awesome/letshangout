import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { parseBody } from "@/lib/utils/validate";
import { log } from "@/lib/utils/logger";

const Schema = z.object({
  name: z.string().trim().min(1).max(60),
  emoji: z.string().max(8).optional(),
});

function generateCode(length = 6): string {
  // Avoid lookalike chars (0/O, 1/I/l)
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = await parseBody(req, Schema);
  if (parsed instanceof NextResponse) return parsed;

  const admin = createAdminClient();

  let inviteCode = generateCode();
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await admin
      .from("squads")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();
    if (!existing) break;
    inviteCode = generateCode();
  }

  const { data: squad, error } = await admin
    .from("squads")
    .insert({
      name: parsed.name,
      emoji: parsed.emoji || "👥",
      created_by: user.id,
      invite_code: inviteCode,
    })
    .select()
    .single();

  if (error || !squad) {
    log.error("squads/create", "insert failed", { message: error?.message });
    return NextResponse.json({ error: "Couldn't create squad" }, { status: 500 });
  }

  await admin.from("squad_members").insert({
    squad_id: squad.id,
    user_id: user.id,
    role: "organiser",
  });

  return NextResponse.json({ ok: true, squad });
}
