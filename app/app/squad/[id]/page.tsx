import { createClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Plus, Flame, Tag, ChevronRight } from "lucide-react";
import InviteLink from "@/components/InviteLink";
import DealsTeaser from "@/components/DealsTeaser";

export const dynamic = "force-dynamic";

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

  const { data: membership } = await supabase
    .from("squad_members")
    .select("role")
    .eq("squad_id", squad.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) redirect("/app");

  const [
    { data: members },
    { data: hangouts },
    { data: stats },
  ] = await Promise.all([
    supabase.from("squad_members").select("role, users(id, name, emoji)").eq("squad_id", squad.id),
    supabase.from("hangouts").select("id, title, cover_emoji, starts_at, status").eq("squad_id", squad.id).order("starts_at", { ascending: true, nullsFirst: false }).limit(5),
    supabase.from("squad_stats").select("user_id, reply_rate, name, emoji").eq("squad_id", squad.id).order("reply_rate", { ascending: false }).limit(3),
  ]);

  const upcomingHangouts = hangouts?.filter((h) => h.status === "proposed" || h.status === "confirmed") || [];

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-ink/85 border-b border-[#1F1D1B] px-5 py-4">
        <Link href="/app" className="inline-flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone">
          <ArrowLeft size={12} /> All squads
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl">{squad.emoji}</div>
          <div className="flex-1">
            <h1 className="display text-3xl font-bold leading-tight">{squad.name}</h1>
            <p className="text-sm text-[#8B7355] mt-0.5">{members?.length || 0} members</p>
          </div>
          <Link href={`/app/squad/${squad.id}/hangout/new`} className="p-3 bg-terracotta text-ink rounded-full hover:opacity-90 transition" aria-label="New hangout">
            <Plus size={20} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Upcoming hangouts */}
        <section className="mb-6">
          <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase mb-3">Upcoming</div>
          {upcomingHangouts.length > 0 ? (
            <div className="space-y-2">
              {upcomingHangouts.map((h: any) => (
                <Link
                  key={h.id}
                  href={`/app/squad/${squad.id}/hangout/${h.id}`}
                  className="block p-4 bg-[#1A1A18] border border-[#2A2826] rounded-2xl hover:border-terracotta/40 transition flex items-center gap-3"
                >
                  <div className="text-3xl">{h.cover_emoji || "🍻"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{h.title}</div>
                    <div className="text-xs text-[#8B7355] mt-0.5">
                      {h.starts_at ? new Date(h.starts_at).toLocaleString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "Date TBD"}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#3A3835]" />
                </Link>
              ))}
            </div>
          ) : (
            <Link href={`/app/squad/${squad.id}/hangout/new`} className="block p-6 bg-[#1A1A18] border border-dashed border-[#2A2826] rounded-2xl text-center hover:border-terracotta/40 transition">
              <div className="text-3xl mb-2">🍻</div>
              <div className="display text-sm font-bold mb-1">Plan your first hangout</div>
              <div className="text-xs text-[#8B7355]">The agent waits for instructions.</div>
            </Link>
          )}
        </section>

        {/* Stats teaser */}
        {stats && stats.length > 0 && (
          <section className="mb-6">
            <Link href={`/app/squad/${squad.id}/stats`} className="block">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Flame size={12} className="text-terracotta" />
                  <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase">Squad Stats</div>
                </div>
                <div className="text-xs text-terracotta font-semibold">View all →</div>
              </div>
              <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl overflow-hidden hover:border-terracotta/40 transition">
                {stats.map((s: any, i: number) => (
                  <div key={s.user_id} className={`px-4 py-3 flex items-center gap-3 ${i < stats.length - 1 ? "border-b border-[#2A2826]" : ""}`}>
                    <div className="display text-base font-bold w-4" style={{ color: i === 0 ? "#F2A623" : "#3A3835" }}>{i + 1}</div>
                    <div className="text-xl">{s.emoji}</div>
                    <div className="flex-1 text-sm font-bold">{s.name} {i === 0 && "👑"}</div>
                    <div className="text-xs font-bold" style={{ color: s.reply_rate > 80 ? "#7BA77B" : s.reply_rate > 50 ? "#F2A623" : "#E8593C" }}>{s.reply_rate}%</div>
                  </div>
                ))}
              </div>
            </Link>
          </section>
        )}

        {/* Deals — partnership coming-soon tile */}
        <section className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Tag size={12} className="text-sun" />
            <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase">Tonight's deals</div>
          </div>
          <DealsTeaser />
        </section>

        {/* Squad members + invite */}
        <section className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={12} className="text-terracotta" />
            <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase">Squad</div>
          </div>
          <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl overflow-hidden">
            {members?.map((m: any, i: number) => (
              <div key={m.users.id} className={`px-4 py-3 flex items-center gap-3 ${i < (members.length - 1) ? "border-b border-[#2A2826]" : ""}`}>
                <div className="text-2xl">{m.users.emoji}</div>
                <div className="flex-1 text-sm font-bold">{m.users.name}{m.users.id === user.id && <span className="text-[#8B7355] font-normal"> · you</span>}</div>
                {m.role === "organiser" && <div className="text-[9px] font-bold text-terracotta px-2 py-0.5 bg-terracotta/10 rounded">ORGANISER</div>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <InviteLink code={squad.invite_code} squadName={squad.name} />
        </section>
      </div>
    </main>
  );
}
