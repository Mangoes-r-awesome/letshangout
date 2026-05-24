import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Invite code required" }, { status: 400 });

    const admin = createAdminClient();
    const { data: squad } = await admin
      .from("squads")
      .select("id")
      .eq("invite_code", code.toUpperCase())
      .maybeSingle();

    if (!squad) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

    // Idempotent — upsert handles "already in"
    const { error } = await admin
      .from("squad_members")
      .upsert(
        { squad_id: squad.id, user_id: user.id, role: "member" },
        { onConflict: "squad_id,user_id", ignoreDuplicates: true }
      );

    if (error) {
      console.error("[squads/join] error:", error);
      return NextResponse.json({ error: "Couldn't join" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, squad_id: squad.id });
  } catch (err: any) {
    console.error("[squads/join] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
