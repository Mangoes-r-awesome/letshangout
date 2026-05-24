import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateShortCode } from "@/lib/utils/short-code";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { squad_id, title, emoji, description, location, starts_at, ends_at, cost_per_person, bring } = await req.json();

    if (!squad_id || !title?.trim()) {
      return NextResponse.json({ error: "Squad and title required" }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from("squad_members")
      .select("role")
      .eq("squad_id", squad_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership) return NextResponse.json({ error: "Not a squad member" }, { status: 403 });

    const admin = createAdminClient();

    // Generate a unique short code (retry on collision — extremely rare with 31^4 = 923K combos)
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

    const { data: hangout, error: hErr } = await admin
      .from("hangouts")
      .insert({
        squad_id,
        organiser_id: user.id,
        title: title.trim(),
        cover_emoji: emoji || "🍻",
        description: description?.trim() || null,
        location: location?.trim() || null,
        starts_at: starts_at || null,
        ends_at: ends_at || null,
        cost_per_person: cost_per_person ? parseFloat(cost_per_person) : null,
        bring: bring?.trim() || null,
        status: "proposed",
        short_code: shortCode,
      })
      .select()
      .single();

    if (hErr || !hangout) {
      console.error("[hangouts/create] error:", hErr);
      return NextResponse.json({ error: "Couldn't create" }, { status: 500 });
    }

    const { data: members } = await admin
      .from("squad_members")
      .select("user_id")
      .eq("squad_id", squad_id);

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
  } catch (err: any) {
    console.error("[hangouts/create] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
