"use client";
import { ArrowRight } from "lucide-react";

const PEOPLE = [
  { rank: 1, name: "Marcus", emoji: "🦊", rate: 98, crown: true },
  { rank: 2, name: "Liam",   emoji: "🐻", rate: 92 },
  { rank: 3, name: "Dee",    emoji: "🦉", rate: 76 },
  { rank: 4, name: "Sam",    emoji: "🦝", rate: 34, ghoster: true },
];

export default function Stats({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-3" style={{ animation: "fade-in 0.4s ease-out" }}>Squad Stats</div>
      <h2 className="display text-3xl font-bold leading-[1.1] mb-2" style={{ animation: "fade-in 0.6s ease-out 0.1s both" }}>
        Nothing fixes a flake<br />like a leaderboard.
      </h2>
      <p className="text-sm text-fg-muted mb-5 leading-relaxed" style={{ animation: "fade-in 0.6s ease-out 0.3s both" }}>
        Everyone sees who replies, who pays, who ghosts. Friends don't get mad — they get competitive 👀
      </p>

      <div className="bg-card border border-line rounded-2xl overflow-hidden flex-1" style={{ animation: "fade-in 0.6s ease-out 0.5s both" }}>
        {PEOPLE.map((p, i) => (
          <div key={i} className={`px-4 py-3 flex items-center gap-3 ${i < 3 ? "border-b border-line" : ""}`}>
            <div className={`display text-lg font-bold w-5 ${p.crown ? "text-sun" : p.ghoster ? "text-terracotta" : "text-fg-faint"}`}>{p.rank}</div>
            <div className="text-2xl">{p.emoji}</div>
            <div className="flex-1">
              <div className="text-sm font-bold flex items-center gap-1.5">
                {p.name}
                {p.crown && <span>👑</span>}
                {p.ghoster && <span className="text-[10px] text-terracotta font-bold">🚩 GHOSTER</span>}
              </div>
              <div className="h-1 bg-line rounded mt-1.5 overflow-hidden">
                <div className="h-full rounded transition-all" style={{ width: `${p.rate}%`, background: p.rate > 80 ? "#7BA77B" : p.rate > 50 ? "#F2A623" : "#E8593C" }} />
              </div>
            </div>
            <div className="text-xs text-fg-muted min-w-[30px] text-right">{p.rate}%</div>
          </div>
        ))}
      </div>

      <button onClick={onNext} className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-5" style={{ animation: "fade-in 0.6s ease-out 0.8s both" }}>
        Public shaming, finally <ArrowRight size={16} />
      </button>
    </div>
  );
}
