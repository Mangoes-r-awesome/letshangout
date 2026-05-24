"use client";
import { ArrowRight } from "lucide-react";

export default function Mission({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-5xl mb-5" style={{ animation: "fade-in 1s ease-out" }}>💛</div>
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-3" style={{ animation: "fade-in 0.6s ease-out 0.2s both" }}>Why we built this</div>
      <h2 className="display text-3xl font-bold leading-[1.15] mb-5" style={{ animation: "fade-in 0.6s ease-out 0.3s both" }}>
        Friendships don't die from big fights.
      </h2>
      <p className="text-base text-fg/85 leading-relaxed mb-4" style={{ animation: "fade-in 0.6s ease-out 0.6s both" }}>
        They die from small moments we never get back. A coffee that didn't happen. A trip that fell through. A birthday someone meant to call about.
      </p>
      <p className="text-sm text-fg-muted leading-relaxed mb-auto" style={{ animation: "fade-in 0.6s ease-out 0.9s both" }}>
        1 in 4 Australians feel lonely. We give <span className="text-terracotta font-bold">1% of revenue to R U OK?</span> because we want to be on the right side of that.
      </p>
      <button onClick={onNext} className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-6" style={{ animation: "fade-in 0.6s ease-out 1.3s both" }}>
        Let's go <ArrowRight size={16} />
      </button>
    </div>
  );
}
