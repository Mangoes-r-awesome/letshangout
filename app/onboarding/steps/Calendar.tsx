"use client";
import { Calendar as CalendarIcon, Check } from "lucide-react";

const FEATURES = [
  "Auto-detect conflicts before nudging",
  "Suggest dates that work for everyone",
  "Auto-add confirmed hangouts to your calendar",
];

export default function CalendarStep({
  onConnect,
  onSkip,
}: {
  onConnect: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="flex justify-center gap-3 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-card border border-line flex items-center justify-center text-2xl">📅</div>
        <div className="flex items-center text-fg-faint text-xl">↔</div>
        <div className="w-14 h-14 rounded-2xl bg-terracotta flex items-center justify-center text-ink font-bold text-xl">H</div>
      </div>

      <h2 className="display text-3xl font-bold leading-[1.1] mb-2 text-center">Sync your calendar?</h2>
      <p className="text-sm text-fg/85 mb-6 text-center leading-relaxed">
        Optional — but this is where the magic compounds. We find when you're actually free instead of asking.
      </p>

      <div className="space-y-2 mb-auto">
        {FEATURES.map((t, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-card border border-line rounded-xl">
            <Check size={14} className="text-sage flex-shrink-0" />
            <div className="text-sm text-fg/85">{t}</div>
          </div>
        ))}
      </div>

      <button onClick={onConnect} className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-6">
        <CalendarIcon size={16} /> Connect Google Calendar
      </button>
      <button onClick={onSkip} className="text-xs text-fg-muted font-semibold mt-3 py-2 hover:text-fg transition">
        Maybe later
      </button>
    </div>
  );
}
