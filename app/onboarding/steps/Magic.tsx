"use client";
import { ArrowRight, Check } from "lucide-react";

export default function Magic({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-3" style={{ animation: "fade-in 0.4s ease-out" }}>Meet your agent</div>
      <h2 className="display text-3xl font-bold leading-[1.1] mb-2" style={{ animation: "fade-in 0.6s ease-out 0.1s both" }}>
        It does the pestering<br />so you don't have to.
      </h2>
      <p className="text-xs text-fg-muted mb-6" style={{ animation: "fade-in 0.6s ease-out 0.3s both" }}>Watch ↓</p>

      <div className="flex-1 bg-card border border-line rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-line mb-1">
          <div className="w-1.5 h-1.5 bg-sage rounded-full animate-pulse" />
          <div className="text-[10px] text-sage font-bold tracking-widest">AGENT WORKING</div>
        </div>

        <div className="flex items-start gap-2" style={{ animation: "fade-in 0.6s ease-out 0.2s both" }}>
          <div className="text-xl">🦝</div>
          <div className="flex-1 p-3 bg-page rounded-xl rounded-tl-sm">
            <div className="text-[10px] text-fg-muted mb-1">Sam · 3 days ago</div>
            <div className="text-sm">didn't reply 🦗</div>
          </div>
        </div>

        <div className="flex items-start justify-end gap-2" style={{ animation: "fade-in 0.6s ease-out 0.6s both" }}>
          <div className="flex-1 max-w-[85%] p-3 bg-terracotta/10 border border-terracotta/30 rounded-xl rounded-tr-sm">
            <div className="text-[10px] text-terracotta font-bold tracking-wider mb-1">AGENT · SMS SENT</div>
            <div className="text-sm italic">"Mate, third time asking 🙃 yes or no for Hunter Valley?"</div>
          </div>
        </div>

        <div className="flex items-start gap-2" style={{ animation: "fade-in 0.6s ease-out 1.1s both" }}>
          <div className="text-xl">🦝</div>
          <div className="flex-1 p-3 bg-page rounded-xl rounded-tl-sm">
            <div className="text-[10px] text-fg-muted mb-1">Sam · 4 min ago</div>
            <div className="text-sm">fk it, yeah i'm in 🍷</div>
          </div>
        </div>

        <div className="p-2.5 bg-sage/10 border border-sage/30 rounded-lg text-sm text-sage font-semibold flex items-center gap-2" style={{ animation: "fade-in 0.6s ease-out 1.6s both" }}>
          <Check size={14} /> Confirmed · auto-added to his calendar
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-5"
        style={{ animation: "fade-in 0.6s ease-out 2s both" }}
      >
        Sick. What else? <ArrowRight size={16} />
      </button>
    </div>
  );
}
