import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SquadStatsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: squad } = await supabase
    .from("squads")
    .select("id, name, emoji")
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

  const { data: stats } = await supabase
    .from("squad_stats")
    .select("*")
    .eq("squad_id", squad.id)
    .order("reply_rate", { ascending: false });

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-ink/85 border-b border-[#1F1D1B] px-5 py-4">
        <Link href={`/app/squad/${squad.id}`} className="inline-flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone">
          <ArrowLeft size={12} /> {squad.name}
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-2 mb-2">
          <Flame size={16} className="text-terracotta" />
          <h1 className="display text-3xl font-bold leading-tight">Squad Stats</h1>
        </div>
        <p className="text-sm text-[#8B7355] mb-6">Everyone sees this — that's the point.</p>

        {stats && stats.length > 0 ? (
          <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[40px_1fr_80px_80px] px-4 py-3 border-b border-[#2A2826] text-[10px] text-[#8B7355] tracking-widest uppercase font-bold">
              <div>#</div>
              <div>Member</div>
              <div className="text-right">Reply</div>
              <div className="text-right">Confirms</div>
            </div>
            {stats.map((s: any, i: number) => {
              const isBest = i === 0 && s.reply_rate >= 80;
              const isWorst = s.reply_rate < 50 && s.total_rsvps > 2;
              return (
                <div key={s.user_id} className={`grid grid-cols-[40px_1fr_80px_80px] px-4 py-3.5 items-center ${i < stats.length - 1 ? "border-b border-[#2A2826]" : ""}`}>
                  <div className="display text-lg font-bold" style={{ color: isBest ? "#F2A623" : isWorst ? "#E8593C" : "#3A3835" }}>{i + 1}</div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="text-2xl">{s.emoji}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold flex items-center gap-1.5">{s.name} {isBest && "👑"}</div>
                      {isWorst && <div className="text-[9px] text-terracotta font-bold">🚩 chronic ghoster</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: s.reply_rate > 80 ? "#7BA77B" : s.reply_rate > 50 ? "#F2A623" : "#E8593C" }}>{s.reply_rate}%</div>
                    <div className="h-1 bg-[#2A2826] rounded mt-1 overflow-hidden">
                      <div className="h-full" style={{ width: `${s.reply_rate}%`, background: s.reply_rate > 80 ? "#7BA77B" : s.reply_rate > 50 ? "#F2A623" : "#E8593C" }} />
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#8B7355]">{s.confirms || 0}/{s.total_rsvps || 0}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-[#1A1A18] border border-dashed border-[#2A2826] rounded-2xl text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="display text-sm font-bold mb-1">No stats yet</div>
            <div className="text-xs text-[#8B7355]">Plan a hangout and watch the leaderboard fill up.</div>
          </div>
        )}

        <div className="mt-6 p-4 bg-[#1A1A18] border border-[#2A2826] rounded-2xl">
          <div className="text-xs font-bold mb-2">How stats work</div>
          <div className="text-xs text-[#8B7355] leading-relaxed">
            <span className="text-bone">Reply rate</span> = RSVPs answered ÷ RSVPs received. <span className="text-bone">Confirms</span> = how many you said yes to. Lower than 50% over 3+ hangouts and you get the 🚩 flag. The whole squad sees this. Friendly competition is the point.
          </div>
        </div>
      </div>
    </main>
  );
}
