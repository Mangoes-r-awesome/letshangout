import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, DollarSign, Package } from "lucide-react";
import RsvpButtons from "@/components/RsvpButtons";
import MemberRow from "@/components/MemberRow";
import AgentFeed from "@/components/AgentFeed";

export const dynamic = "force-dynamic";

export default async function HangoutPage({ params }: { params: { id: string; hangoutId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: hangout } = await supabase
    .from("hangouts")
    .select("*, squads(id, name, emoji)")
    .eq("id", params.hangoutId)
    .single();
  if (!hangout) notFound();

  // Membership check
  const { data: membership } = await supabase
    .from("squad_members")
    .select("role")
    .eq("squad_id", hangout.squad_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) redirect("/app");

  // All RSVPs with user info
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("id, status, response_method, responded_at, users(id, name, emoji, phone)")
    .eq("hangout_id", hangout.id);

  const myRsvp = rsvps?.find((r: any) => r.users?.id === user.id);
  const others = rsvps?.filter((r: any) => r.users?.id !== user.id) || [];

  const confirmed = rsvps?.filter((r: any) => r.status === "in").length || 0;
  const total = rsvps?.length || 0;

  // Recent nudges for the agent feed
  const { data: recentNudges } = await supabase
    .from("nudges")
    .select("id, message, sent_at, responded_at, channel, tone_level, users(name, emoji)")
    .eq("hangout_id", hangout.id)
    .order("sent_at", { ascending: false })
    .limit(10);

  // Days out
  let daysOut: number | null = null;
  if (hangout.starts_at) {
    const diff = new Date(hangout.starts_at).getTime() - Date.now();
    daysOut = Math.round(diff / (1000 * 60 * 60 * 24));
  }

  const whenStr = hangout.starts_at
    ? new Date(hangout.starts_at).toLocaleString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "TBD";

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-ink/85 border-b border-[#1F1D1B] px-5 py-4">
        <Link href={`/app/squad/${hangout.squad_id}`} className="inline-flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone">
          <ArrowLeft size={12} /> {(hangout.squads as any)?.name || "Squad"}
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">

        {/* Hero card */}
        <div className="relative rounded-3xl p-6 border border-[#2A2826] overflow-hidden" style={{ background: "linear-gradient(135deg, #1A1A18 0%, #1F1D1B 100%)" }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,89,60,0.15) 0%, transparent 70%)" }} />

          <div className="relative">
            <div className="flex justify-between items-start mb-5">
              <div>
                {daysOut !== null && (
                  <div className="text-[10px] font-bold text-terracotta tracking-widest uppercase mb-2">
                    {daysOut > 0 ? `${daysOut} days out` : daysOut === 0 ? "today" : "past"}
                  </div>
                )}
                <div className="text-4xl mb-2">{hangout.cover_emoji}</div>
                <h1 className="display text-3xl font-bold leading-tight mb-1">{hangout.title}</h1>
              </div>
              <div className="text-right">
                <div className="display text-4xl font-bold leading-none text-terracotta">
                  {confirmed}<span className="text-[#3A3835] text-2xl">/{total}</span>
                </div>
                <div className="text-[9px] text-[#8B7355] tracking-widest uppercase mt-1">Confirmed</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <Detail icon={Clock} label="When" value={whenStr} />
              <Detail icon={MapPin} label="Where" value={hangout.location || "TBD"} />
              <Detail icon={DollarSign} label="Cost" value={hangout.cost_per_person ? `$${hangout.cost_per_person}pp` : "Free"} />
              <Detail icon={Package} label="Bring" value={hangout.bring || "Yourself"} />
            </div>

            {hangout.description && (
              <div className="p-3.5 bg-[#0F0E0C]/50 rounded-xl border border-[#2A2826] text-sm leading-relaxed text-[#D4CFC7]">
                {hangout.description}
              </div>
            )}
          </div>
        </div>

        {/* Your RSVP */}
        <section>
          <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase mb-3">You're in?</div>
          <RsvpButtons hangoutId={hangout.id} currentStatus={myRsvp?.status || "pending"} />
        </section>

        {/* Squad statuses */}
        <section>
          <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase mb-3">The squad</div>
          <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl overflow-hidden">
            {others.map((r: any, i: number) => (
              <MemberRow
                key={r.id}
                rsvpStatus={r.status}
                responseMethod={r.response_method}
                respondedAt={r.responded_at}
                member={r.users}
                hangoutId={hangout.id}
                isLast={i === others.length - 1}
                organiserId={hangout.organiser_id}
                currentUserId={user.id}
              />
            ))}
          </div>
        </section>

        {/* Agent feed */}
        {recentNudges && recentNudges.length > 0 && (
          <section>
            <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase mb-3">Agent feed</div>
            <AgentFeed nudges={recentNudges} />
          </section>
        )}
      </div>
    </main>
  );
}

function Detail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 bg-[#0F0E0C]/50 rounded-xl border border-[#2A2826]">
      <Icon size={11} className="text-[#8B7355] mb-1" />
      <div className="text-[9px] text-[#8B7355] tracking-widest uppercase mb-0.5">{label}</div>
      <div className="text-xs font-bold truncate">{value}</div>
    </div>
  );
}
