import { createAdminClient, createClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import JoinButton from "@/components/JoinButton";

export default async function JoinPage({ params }: { params: { code: string } }) {
  const admin = createAdminClient();
  const code = params.code.toUpperCase();

  const { data: squad } = await admin
    .from("squads")
    .select("id, name, emoji, invite_code, squad_members(user_id)")
    .eq("invite_code", code)
    .maybeSingle();

  if (!squad) notFound();

  // If already logged in and already a member, fast-forward to squad
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const alreadyIn = squad.squad_members?.some((m: any) => m.user_id === user.id);
    if (alreadyIn) redirect(`/app/squad/${squad.id}`);
  }

  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="text-xs font-semibold text-terracotta tracking-widest uppercase mb-3">You're invited to join</div>
        <div className="text-7xl mb-4">{squad.emoji}</div>
        <h1 className="display text-4xl font-bold mb-2 leading-tight">{squad.name}</h1>
        <p className="text-sm text-[#8B7355] mb-8">{squad.squad_members?.length || 0} members already in</p>

        <JoinButton squadId={squad.id} code={code} loggedIn={!!user} />

        <p className="text-xs text-[#8B7355] mt-6 leading-relaxed">
          Hangouts is the AI agent that pesters your mates until they actually reply. Less group chat chaos, more real plans.
        </p>
      </div>
    </main>
  );
}
