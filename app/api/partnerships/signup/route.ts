import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { business_name, contact_name, email, phone, vendor_type, message } = await req.json();
    if (!email?.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Capture current user if logged in
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = createAdminClient();
    const { error } = await admin.from("partnership_signups").insert({
      business_name: business_name?.trim() || null,
      contact_name: contact_name?.trim() || null,
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      vendor_type: vendor_type || "other",
      message: message?.trim() || null,
      user_id: user?.id || null,
    });

    if (error) {
      console.error("[partnerships/signup] error:", error);
      return NextResponse.json({ error: "Couldn't save" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
