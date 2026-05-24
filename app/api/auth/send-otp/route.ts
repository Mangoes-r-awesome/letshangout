import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalisePhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-()]/g, "");
  // Already E.164
  if (/^\+\d{8,15}$/.test(cleaned)) return cleaned;
  // Australian mobile starting with 0 → +61
  if (/^0\d{9}$/.test(cleaned)) return "+61" + cleaned.slice(1);
  // Australian mobile without 0
  if (/^\d{9}$/.test(cleaned) && cleaned.startsWith("4")) return "+61" + cleaned;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const normalised = normalisePhone(phone);
    if (!normalised) {
      return NextResponse.json(
        { error: "Enter a valid Australian mobile (e.g. 0412 345 678)" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalised,
      options: { channel: "sms" },
    });

    if (error) {
      console.error("[send-otp] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, phone: normalised });
  } catch (err: any) {
    console.error("[send-otp] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
