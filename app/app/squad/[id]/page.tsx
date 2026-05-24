import { createClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Plus, Flame, Tag, ChevronRight } from "lucide-react";
import InviteLink from "@/components/InviteLink";
import DealsTeaser from "@/components/DealsTeaser";

export const dynamic = "force-dynamic";

type Hangout = {
  id: string;
  title: string;
  cover_emoji: string | null;
  starts_at: string | null;
  status: string;
};

function relativeMeta(startsAt: string | null) {
  if (!startsAt) return null;
  const start = new Date(startsAt);
  if (isNaN(start.getTime())) return null;
  const now = new Date();
  const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((startMid.getTime() - nowMid.getTime()) / 86400000);

  let line: string;
  if (days < 0) line = `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} ago`;
  else if (days === 0) line = "Tonight";
  else if (days === 1) line = "Tomorrow";
  else if (days <= 6) line = `This ${start.toLocaleDateString("en-AU", { weekday: "long" })}`;
  else if (days <= 13) line = "Next week";
  else line = `In ${days} days`;

  return {
    line,
    dateNumeral: String(start.getDate()),
    month: start.toLocaleDateString("en-AU", { month: "short" }).toUpperCase(),
    weekday: start.toLocaleDateString("en-AU", { weekday: "short" }).toUpperCase(),
    time: start.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" }).toLowerCase().replace(" ", ""),
    fullDate: start.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }),
    isSoon: days >= 0 && days <= 1,
  };
}

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
    supabase.from("hangouts").select("id, title, cover_emoji, starts_at, status").eq("squad_id", squad.id).order("starts_at", { ascending: true, nullsFirst: false }).limit(8),
    supabase.from("squad_stats").select("user_id, reply_rate, name, emoji").eq("squad_id", squad.id).order("reply_rate", { ascending: false }).limit(3),
  ]);

  const upcoming: Hangout[] = (hangouts ?? []).filter((h: Hangout) => h.status === "proposed" || h.status === "confirmed");
  const [hero, ...rest] = upcoming;
  const heroMeta = hero ? relativeMeta(hero.starts_at) : null;

  return (
    <main className="min-h-screen bg-page text-fg">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-page/85 border-b border-line-soft px-5 py-4">
        <Link href="/app" className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg transition">
          <ArrowLeft size={12} /> All squads
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-4 mb-7">
          <div className="text-5xl leading-none">{squad.emoji}</div>
          <div className="flex-1 min-w-0">
            <h1 className="display text-3xl font-bold leading-tight truncate">{squad.name}</h1>
            <p className="text-sm text-fg-muted mt-0.5">{members?.length || 0} {members?.length === 1 ? "member" : "members"}</p>
          </div>
          <Link href={`/app/squad/${squad.id}/hangout/new`} className="p-3 bg-terracotta text-ink rounded-full hover:opacity-90 active:scale-95 transition" aria-label="New hangout">
            <Plus size={20} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Upcoming — hero + rest */}
        <section className="mb-8">
          <div className="text-[10px] font-bold text-fg-muted tracking-[0.25em] uppercase mb-3">Upcoming</div>

          {hero ? (
            <>
              {/* HERO CARD */}
              <Link
                href={`/app/squad/${squad.id}/hangout/${hero.id}`}
                className="relative block overflow-hidden rounded-3xl border border-terracotta/30 hover:border-terracotta/60 transition-all hover:shadow-[0_20px_60px_-20px_rgba(232,89,60,0.35)] grain"
                style={{
                  background:
                    "radial-gradient(140% 100% at 100% 0%, rgba(232,89,60,0.22) 0%, rgba(232,89,60,0.08) 40%, rgba(20,17,15,0) 75%), linear-gradient(180deg, #1A1614 0%, #15110F 100%)",
                }}
              >
                <div className="relative p-6 pb-7">
                  {/* Editorial italic pull-quote line */}
                  <div className="display italic text-[15px] text-terracotta tracking-wide mb-5 flex items-center gap-2">
                    <span className="inline-block w-6 h-px bg-terracotta/60" />
                    {heroMeta?.line ?? "Date TBD"}
                  </div>

                  <div className="flex gap-5 items-start">
                    {/* Date stamp */}
                    <div className="shrink-0 -rotate-[3deg] origin-top-left pt-0.5">
                      <div className="display italic font-bold text-terracotta leading-none" style={{ fontSize: "68px", letterSpacing: "-0.04em" }}>
                        {heroMeta?.dateNumeral ?? "—"}
                      </div>
                      <div className="text-[10px] font-bold text-terracotta/80 tracking-[0.35em] mt-1.5">
                        {heroMeta?.month ?? "TBD"}
                      </div>
                    </div>

                    {/* Title block */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="display text-[26px] font-bold leading-[1.1] text-bone mb-2 break-words">
                        {hero.title}
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-bone/75">
                        <span className="text-xl leading-none">{hero.cover_emoji || "🍻"}</span>
                        {heroMeta?.time && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-bone/40" />
                            <span className="font-medium">{heroMeta.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-terracotta/15">
                    <div className="text-[11px] text-bone/65 font-medium tracking-wide">
                      Tap to see who's in
                    </div>
                    <div className="flex items-center gap-1 text-terracotta font-bold text-xs">
                      Open <ChevronRight size={12} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Rest of upcoming as compact rows */}
              {rest.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-[10px] font-bold text-fg-muted/80 tracking-[0.25em] uppercase mb-1.5 pl-1">
                    Then…
                  </div>
                  {rest.map((h: Hangout) => {
                    const m = relativeMeta(h.starts_at);
                    return (
                      <Link
                        key={h.id}
                        href={`/app/squad/${squad.id}/hangout/${h.id}`}
                        className="block p-3.5 bg-card border border-line rounded-xl hover:border-terracotta/30 transition flex items-center gap-3"
                      >
                        <div className="text-2xl leading-none">{h.cover_emoji || "🍻"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{h.title}</div>
                          <div className="text-[11px] text-fg-muted mt-0.5 truncate">
                            {m ? m.line : "Date TBD"}{m?.time ? ` · ${m.time}` : ""}
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-fg-faint" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <Link
              href={`/app/squad/${squad.id}/hangout/new`}
              className="relative block overflow-hidden p-7 bg-card-soft border border-dashed border-line rounded-3xl text-center hover:border-terracotta/50 transition group grain"
            >
              <div className="relative">
                <div className="text-4xl mb-3 transition-transform group-hover:-rotate-6">🍻</div>
                <div className="display italic text-base text-terracotta tracking-wide mb-1">Nothing on the cards</div>
                <div className="display text-2xl font-bold mb-2 leading-tight">Plan something.</div>
                <div className="text-xs text-fg-muted">The agent waits for instructions.</div>
              </div>
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
                  <div className="text-[10px] font-bold text-fg-muted tracking-[0.25em] uppercase">Squad Stats</div>
                </div>
                <div className="text-xs text-terracotta font-semibold">View all →</div>
              </div>
              <div className="bg-card border border-line rounded-2xl overflow-hidden hover:border-terracotta/40 transition">
                {stats.map((s: any, i: number) => (
                  <div key={s.user_id} className={`px-4 py-3 flex items-center gap-3 ${i < stats.length - 1 ? "border-b border-line" : ""}`}>
                    <div className={`display text-base font-bold w-4 ${i === 0 ? "text-sun" : "text-fg-faint"}`}>{i + 1}</div>
                    <div className="text-xl">{s.emoji}</div>
                    <div className="flex-1 text-sm font-bold">{s.name} {i === 0 && "👑"}</div>
                    <div className="text-xs font-bold" style={{ color: s.reply_rate > 80 ? "#7BA77B" : s.reply_rate > 50 ? "#F2A623" : "#E8593C" }}>{s.reply_rate}%</div>
                  </div>
                ))}
              </div>
            </Link>
          </section>
        )}

        {/* Deals */}
        <section className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Tag size={12} className="text-sun" />
            <div className="text-[10px] font-bold text-fg-muted tracking-[0.25em] uppercase">Tonight's deals</div>
          </div>
          <DealsTeaser />
        </section>

        {/* Members */}
        <section className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={12} className="text-terracotta" />
            <div className="text-[10px] font-bold text-fg-muted tracking-[0.25em] uppercase">Squad</div>
          </div>
          <div className="bg-card border border-line rounded-2xl overflow-hidden">
            {members?.map((m: any, i: number) => (
              <div key={m.users.id} className={`px-4 py-3 flex items-center gap-3 ${i < (members.length - 1) ? "border-b border-line" : ""}`}>
                <div className="text-2xl">{m.users.emoji}</div>
                <div className="flex-1 text-sm font-bold">{m.users.name}{m.users.id === user.id && <span className="text-fg-muted font-normal"> · you</span>}</div>
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
