import { createClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import InviteLink from "@/components/InviteLink";

export default async function SquadPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: squad } = await supabase
    .from("squads")
    .select("id, name, emoji, invite_code, created_by")
    .eq("id", params.id)
    .single();

  if (!squad) notFound();

  // Check membership (RLS should also enforce, this is defence in depth)
  const { data: membership } = await supabase
    .from("squad_members")
    .select("role")
    .eq("squad_id", squad.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/app");
  }

  const { data: members } = await supabase
    .from("squad_members")
    .select("role, users(id, name, emoji)")
    .eq("squad_id", squad.id);

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-ink/85 border-b border-[#1F1D1B] px-5 py-4">
        <Link href="/app" className="inline-flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone">
          <ArrowLeft size={12} /> All squads
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="text-5xl">{squad.emoji}</div>
          <div>
            <h1 className="display text-3xl font-bold leading-tight">{squad.name}</h1>
            <p className="text-sm text-[#8B7355] mt-1">{members?.length || 0} members</p>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-terracotta" />
            <h2 className="display text-sm font-bold tracking-wide uppercase text-[#8B7355]">Squad</h2>
          </div>
          <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl overflow-hidden">
            {members?.map((m: any, i: number) => (
              <div key={m.users.id} className={`px-5 py-3 flex items-center gap-3 ${i < (members.length - 1) ? 'border-b border-[#2A2826]' : ''}`}>
                <div className="text-2xl">{m.users.emoji}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{m.users.name}{m.users.id === user.id && <span className="text-[#8B7355] font-normal"> · you</span>}</div>
                </div>
                {m.role === "organiser" && (
                  <div className="text-[9px] font-bold text-terracotta px-2 py-0.5 bg-terracotta/10 rounded">ORGANISER</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <InviteLink code={squad.invite_code} squadName={squad.name} />
        </section>

        <section>
          <div className="p-8 bg-[#1A1A18] border border-[#2A2826] rounded-2xl text-center">
            <div className="text-3xl mb-2">🚧</div>
            <div className="display text-lg font-bold mb-1">Hangouts coming next week</div>
            <div className="text-sm text-[#8B7355]">For now, get your squad in and we'll be ready to plan.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
