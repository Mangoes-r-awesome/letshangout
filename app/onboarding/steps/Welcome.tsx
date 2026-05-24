"use client";
import { ArrowRight } from "lucide-react";

export default function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full">
      <div className="text-7xl mb-6" style={{ animation: "fade-in 1.2s ease-out" }}>👋</div>
      <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05] mb-5" style={{ animation: "fade-in 0.6s ease-out 0.2s both" }}>
        Your friendships<br />deserve better.
      </h1>
      <p className="text-base text-fg/85 leading-relaxed mb-auto" style={{ animation: "fade-in 0.6s ease-out 0.5s both" }}>
        We built Hangouts because group chats are where good plans go to die. Let's fix that. ↓
      </p>
      <button
        onClick={onNext}
        className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-10"
        style={{ animation: "fade-in 0.6s ease-out 0.9s both" }}
      >
        Show me <ArrowRight size={16} />
      </button>
    </div>
  );
}
