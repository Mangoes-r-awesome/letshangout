"use client";
import { ArrowRight } from "lucide-react";

const PAINS = [
  { emoji: "📅", text: "Three people thumbs-up your date. The other four never reply." },
  { emoji: "💸", text: "You front $2k for the boys' trip. Six months later you've collected $400." },
  { emoji: "📵", text: "Eight months pass. Nobody saw it happen." },
];

export default function Pain({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-5" style={{ animation: "fade-in 0.4s ease-out" }}>You know the feeling</div>
      <h2 className="display text-3xl sm:text-4xl font-bold leading-[1.1] mb-8" style={{ animation: "fade-in 0.6s ease-out 0.1s both" }}>
        "We <span className="text-terracotta italic">really</span> need to catch up soon"
      </h2>
      <div className="space-y-3 mb-auto">
        {PAINS.map((p, i) => (
          <div
            key={i}
            className="p-4 bg-card border border-line rounded-2xl text-fg/85"
            style={{ animation: `fade-in 0.6s ease-out ${0.3 + i * 0.25}s both` }}
          >
            <div className="text-xl mb-1">{p.emoji}</div>
            <div className="text-sm leading-relaxed">{p.text}</div>
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-6"
        style={{ animation: "fade-in 0.6s ease-out 1.4s both" }}
      >
        Yep, that's me <ArrowRight size={16} />
      </button>
    </div>
  );
}
