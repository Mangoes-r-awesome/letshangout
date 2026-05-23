import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, Calendar as CalIcon, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = createAdminClient();

  const [waitlistRes, usersRes, squadsRes, recentRes] = await Promise.all([
    admin.from("waitlist").select("id, email, phone, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(50),
    admin.from("users").select("id", { count: "exact", head: true }),
    admin.from("squads").select("id", { count: "exact", head: true }),
    admin.from("waitlist").select("created_at"),
  ]);

  const waitlistCount = waitlistRes.count || 0;
  const userCount = usersRes.count || 0;
  const squadCount = squadsRes.count || 0;
  const recentSignups = waitlistRes.data || [];

  // Group signups by day for sparkline
  const byDay: Record<string, number> = {};
  (recentRes.data || []).forEach((r: any) => {
    const day = new Date(r.created_at).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  });
  const days = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  const maxDay = Math.max(...days.map(([, c]) => c), 1);

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-ink/85 border-b border-[#1F1D1B] px-5 py-4 flex justify-between items-center">
        <Link href="/app" className="inline-flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone">
          <ArrowLeft size={12} /> App
        </Link>
        <div className="text-xs font-semibold text-terracotta">ADMIN</div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-8">
        <h1 className="display text-3xl font-bold mb-8">Hangouts ops</h1>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: TrendingUp, label: "Waitlist", value: waitlistCount, color: "terracotta" },
            { icon: Users, label: "Users", value: userCount, color: "sun" },
            { icon: CalIcon, label: "Squads", value: squadCount, color: "sage" },
            { icon: MessageSquare, label: "Nudges", value: "—", color: "sand" },
          ].map((s, i) => (
            <div key={i} className="p-5 bg-[#1A1A18] border border-[#2A2826] rounded-2xl">
              <s.icon size={14} className="text-[#8B7355] mb-3" />
              <div className="display text-3xl font-bold mb-1">{s.value}</div>
              <div className="text-xs text-[#8B7355] uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Signups sparkline */}
        <section className="mb-8">
          <div className="display text-sm font-bold tracking-wide uppercase text-[#8B7355] mb-3">Signups · last 14 days</div>
          <div className="p-5 bg-[#1A1A18] border border-[#2A2826] rounded-2xl">
            {days.length === 0 ? (
              <div className="text-sm text-[#8B7355] text-center py-8">No signups yet — share the link!</div>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {days.map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[9px] text-[#8B7355] font-bold">{count}</div>
                    <div
                      className="w-full bg-terracotta rounded-t"
                      style={{ height: `${(count / maxDay) * 100}%`, minHeight: "2px" }}
                      title={`${day}: ${count}`}
                    />
                    <div className="text-[8px] text-[#8B7355]">{day.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent signups */}
        <section className="mb-8">
          <div className="display text-sm font-bold tracking-wide uppercase text-[#8B7355] mb-3">Recent signups</div>
          <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl overflow-hidden">
            {recentSignups.length === 0 ? (
              <div className="p-8 text-sm text-[#8B7355] text-center">No signups yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2A2826] text-[10px] uppercase tracking-wider text-[#8B7355]">
                      <th className="px-4 py-3 text-left font-semibold">Email</th>
                      <th className="px-4 py-3 text-left font-semibold">Phone</th>
                      <th className="px-4 py-3 text-right font-semibold">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSignups.map((s: any) => (
                      <tr key={s.id} className="border-b border-[#2A2826] last:border-b-0">
                        <td className="px-4 py-3 font-mono text-xs">{s.email}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#8B7355]">{s.phone || "—"}</td>
                        <td className="px-4 py-3 text-xs text-[#8B7355] text-right">{new Date(s.created_at).toLocaleString("en-AU")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <div className="text-xs text-[#8B7355] leading-relaxed">
          Need more depth? Open the <a href="https://supabase.com/dashboard" className="text-terracotta underline">Supabase dashboard</a> for raw table access, SQL editor, and auth logs.
        </div>
      </div>
    </main>
  );
}
