import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { parseBody } from "@/lib/utils/validate";
import { log } from "@/lib/utils/logger";

const Schema = z.object({
  code: z.string().trim().min(4).max(12),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = await parseBody(req, Schema);
  if (parsed instanceof NextResponse) return parsed;

  const admin = createAdminClient();
  const { data: squad } = await admin
    .from("squads")
    .select("id")
    .eq("invite_code", parsed.code.toUpperCase())
    .maybeSingle();

  if (!squad) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

  const { error } = await admin
    .from("squad_members")
    .upsert(
      { squad_id: squad.id, user_id: user.id, role: "member" },
      { onConflict: "squad_id,user_id", ignoreDuplicates: true }
    );

  if (error) {
    log.error("squads/join", "upsert failed", { message: error.message });
    return NextResponse.json({ error: "Couldn't join" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, squad_id: squad.id });
}
