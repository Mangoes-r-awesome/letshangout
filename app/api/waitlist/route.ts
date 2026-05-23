import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, phone } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      // Graceful fallback for first deploy before Supabase is wired up
      console.log("[waitlist] (no supabase configured) signup:", { email, phone });
      return NextResponse.json({ ok: true, queued: true });
    }

    const supabase = createClient(url, key);

    const { error } = await supabase
      .from("waitlist")
      .insert({
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        source: "landing",
      });

    if (error) {
      if (error.code === "23505") {
        // Already signed up — friendly response
        return NextResponse.json({ ok: true, alreadyOnList: true });
      }
      console.error("[waitlist] supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[waitlist] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
