import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase-server";

function generateCode(length = 6): string {
  // Avoid lookalike chars (0/O, 1/I/l)
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { name, emoji } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Squad name required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Generate a unique invite code (retry on collision, very unlikely)
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
        name: name.trim(),
        emoji: emoji || "👥",
        created_by: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error || !squad) {
      console.error("[squads/create] insert error:", error);
      return NextResponse.json({ error: "Couldn't create squad" }, { status: 500 });
    }

    // Add creator as organiser
    await admin.from("squad_members").insert({
      squad_id: squad.id,
      user_id: user.id,
      role: "organiser",
    });

    return NextResponse.json({ ok: true, squad });
  } catch (err: any) {
    console.error("[squads/create] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
