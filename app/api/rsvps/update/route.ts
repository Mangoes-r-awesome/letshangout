import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase-server";

const VALID_STATUSES = ["in", "maybe", "out", "pending"] as const;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { hangout_id, status } = await req.json();
    if (!hangout_id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("rsvps")
      .update({
        status,
        responded_at: status !== "pending" ? new Date().toISOString() : null,
        response_method: "app",
      })
      .eq("hangout_id", hangout_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[rsvps/update] error:", error);
      return NextResponse.json({ error: "Couldn't update" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
