"use client";
import { useState } from "react";
import { Users, Sun, Clock, MapPin, DollarSign, Calendar, Flame, Radar, Zap } from "lucide-react";

export default function PhonePreview() {
  const [tab, setTab] = useState("home");

  const squad = [
    { name: "Alex", emoji: "🦁", status: "organiser" },
    { name: "Marcus", emoji: "🦊", status: "in" },
    { name: "Liam", emoji: "🐻", status: "in" },
    { name: "Dee", emoji: "🦉", status: "maybe" },
    { name: "Sam", emoji: "🦝", status: "ghosting" },
    { name: "Jay", emoji: "🐺", status: "pending" },
  ];

  const stats = [
    { name: "Alex", emoji: "🦁", rate: 98, streak: 12, crown: true },
    { name: "Liam", emoji: "🐻", rate: 92, streak: 5 },
    { name: "Marcus", emoji: "🦊", rate: 89, streak: 8 },
    { name: "Dee", emoji: "🦉", rate: 76, streak: 0 },
    { name: "Jay", emoji: "🐺", rate: 67, streak: 2 },
    { name: "Sam", emoji: "🦝", rate: 34, streak: 0, ghoster: true },
  ];

  const getBadge = (status: string) => ({
    in: { bg: "rgba(74, 107, 74, 0.15)", color: "#7BA77B", label: "IN" },
    maybe: { bg: "rgba(242, 166, 35, 0.15)", color: "#F2A623", label: "MAYBE" },
    ghosting: { bg: "rgba(232, 89, 60, 0.15)", color: "#E8593C", label: "👻" },
    pending: { bg: "rgba(196, 185, 154, 0.15)", color: "#C4B99A", label: "..." },
    organiser: { bg: "rgba(232, 89, 60, 0.2)", color: "#E8593C", label: "YOU" },
  }[status] || { bg: "#1A1A18", color: "#8B7355", label: "—" });

  return (
    <div className="relative" style={{ width: "320px", height: "660px" }}>
      <div className="absolute inset-0 rounded-[42px] border-[10px] border-[#1A1A18] bg-ink overflow-hidden shadow-2xl" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50" />

        <div className="h-full overflow-y-auto pb-20" style={{ scrollbarWidth: "none" }}>
          {/* Header */}
          <div className="sticky top-0 z-10 px-4 pt-10 pb-3 bg-ink/90 backdrop-blur-xl border-b border-[#1F1D1B] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-terracotta rounded-md flex items-center justify-center">
                <Users size={14} className="text-ink" strokeWidth={2.5} />
              </div>
              <div>
                <div className="display text-sm font-bold leading-tight">Hangouts</div>
                <div className="text-[8px] text-[#8B7355] tracking-wider uppercase">The Cousins · 6</div>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#1A1A18] border border-[#2A2826] flex items-center justify-center text-base">🦁</div>
          </div>

          {/* Agent banner */}
          <div className="mx-3 mt-3 px-3 py-2 bg-sage/10 border border-sage/20 rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-sage rounded-full pulse" />
            <div className="text-[10px] text-sage font-bold flex-1">Agent chasing Sam 🦝</div>
          </div>

          {/* Hero hangout */}
          <div className="mx-3 mt-3 rounded-2xl p-4 border border-[#2A2826] relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A1A18 0%, #1F1D1B 100%)" }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,89,60,0.18) 0%, transparent 70%)" }} />
            <div className="relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-[9px] text-terracotta tracking-widest uppercase font-bold mb-1">22 days out</div>
                  <div className="display text-xl font-bold leading-tight">Hunter Valley 🍷</div>
                  <div className="text-[10px] text-[#8B7355] mt-0.5">Cousins Trip</div>
                </div>
                <div className="text-right">
                  <div className="display text-2xl font-bold text-terracotta leading-none">3<span className="text-[#3A3835] text-base">/6</span></div>
                  <div className="text-[8px] text-[#8B7355] tracking-wider uppercase mt-0.5">Confirmed</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {[
                  { icon: Clock, label: "When", value: "Sat 14 Jun" },
                  { icon: MapPin, label: "Where", value: "Pokolbin" },
                  { icon: DollarSign, label: "Cost", value: "$285pp" },
                  { icon: Calendar, label: "Time", value: "Full day" },
                ].map((item, i) => (
                  <div key={i} className="bg-ink/50 p-2 rounded-md border border-[#2A2826]">
                    <item.icon size={9} className="text-[#8B7355] mb-0.5" />
                    <div className="text-[8px] text-[#8B7355] uppercase tracking-wider">{item.label}</div>
                    <div className="text-[10px] font-bold">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {squad.map((p, i) => {
                  const badge = getBadge(p.status);
                  return (
                    <div key={i} className="flex-1 p-1.5 bg-ink/50 rounded-md border border-[#2A2826] text-center">
                      <div className="text-base leading-none mb-0.5">{p.emoji}</div>
                      <div className="text-[7px] font-bold mb-0.5">{p.name}</div>
                      <div className="text-[6px] px-1 py-0.5 rounded font-bold tracking-wider" style={{ background: badge.bg, color: badge.color }}>{badge.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Squad Stats teaser */}
          <div className="px-3 mt-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame size={12} className="text-terracotta" />
              <div className="display text-sm font-bold">Squad Stats</div>
              <div className="text-[7px] text-[#8B7355] px-1.5 py-0.5 bg-[#1A1A18] rounded border border-[#2A2826] tracking-wider">VISIBLE TO ALL</div>
            </div>
            <div className="bg-[#1A1A18] rounded-xl border border-[#2A2826] overflow-hidden">
              {stats.map((p, i) => (
                <div key={i} className="px-3 py-2 flex items-center gap-2 border-b border-[#2A2826] last:border-b-0">
                  <div className="display text-xs font-bold w-3" style={{ color: p.crown ? "#F2A623" : p.ghoster ? "#E8593C" : "#3A3835" }}>{i + 1}</div>
                  <div className="text-lg">{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold flex items-center gap-1">
                      {p.name}
                      {p.crown && <span>👑</span>}
                      {p.ghoster && <span className="text-[8px] text-terracotta font-bold">🚩</span>}
                    </div>
                    <div className="flex gap-1.5 items-center mt-0.5">
                      <div className="flex-1 h-0.5 bg-[#2A2826] rounded overflow-hidden">
                        <div className="h-full rounded" style={{ width: `${p.rate}%`, background: p.rate > 80 ? "#7BA77B" : p.rate > 50 ? "#F2A623" : "#E8593C" }} />
                      </div>
                      <div className="text-[8px] text-[#8B7355]">{p.rate}%</div>
                    </div>
                  </div>
                  {p.streak > 0 && (
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-sun/10 rounded-full">
                      <Flame size={8} className="text-sun" />
                      <span className="text-[8px] font-bold text-sun">{p.streak}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Agent feed */}
          <div className="px-3 mt-4 mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={12} className="text-sun" />
              <div className="display text-sm font-bold">Agent feed</div>
            </div>
            <div className="bg-[#1A1A18] rounded-xl border border-[#2A2826] p-3 space-y-2.5">
              <div className="pl-2 border-l-2 border-terracotta">
                <div className="text-[10px] font-bold flex items-center gap-1">
                  <span>🦝</span> Sam · <span className="text-[#8B7355] font-medium">nudge sent</span>
                </div>
                <div className="text-[9px] text-[#8B7355] mt-0.5 italic">"Third time asking 🙃 yes or no?"</div>
              </div>
              <div className="pl-2 border-l-2 border-sage">
                <div className="text-[10px] font-bold flex items-center gap-1">
                  <span>🦊</span> Marcus · <span className="text-[#8B7355] font-medium">confirmed</span>
                </div>
                <div className="text-[9px] text-[#8B7355] mt-0.5">Auto-added to his calendar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-ink/95 backdrop-blur-xl border-t border-[#1F1D1B] py-2 pb-5 flex justify-around items-center">
          {["🏠", "📡", "+", "🔥", "👤"].map((icon, i) => (
            <div key={i} className={i === 2 ? "w-10 h-10 rounded-full bg-terracotta flex items-center justify-center text-ink font-bold text-lg -mt-2" : "text-base opacity-60"}>
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
