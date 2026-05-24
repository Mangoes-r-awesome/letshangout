import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Invalid code" },
        { status: 401 }
      );
    }

    // Create profile row if first-time. Use admin client to bypass RLS.
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
    console.error("[verify-otp] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
