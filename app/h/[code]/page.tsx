import { createAdminClient, createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function HangoutDeepLink({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();

  // Use admin client to look up — short codes are public-by-link, not gated
  const admin = createAdminClient();
  const { data: hangout } = await admin
    .from("hangouts")
    .select("id, squad_id")
    .eq("short_code", code)
    .maybeSingle();

  if (!hangout) notFound();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const destination = `/app/squad/${hangout.squad_id}/hangout/${hangout.id}`;

  if (!user) {
    // Send to login, return here after
    redirect(`/login?next=${encodeURIComponent(destination)}`);
  }

  redirect(destination);
}
