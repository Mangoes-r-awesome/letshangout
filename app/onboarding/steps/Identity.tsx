"use client";
import { ArrowRight } from "lucide-react";

const ANIMAL_EMOJIS = ["🦁", "🦊", "🐻", "🦉", "🦝", "🐺", "🐯", "🐨", "🐼", "🐸", "🦄", "🦋", "🐙", "🦀", "🦖"];

export default function Identity({
  name,
  setName,
  emoji,
  setEmoji,
  onNext,
  saving,
  error,
}: {
  name: string;
  setName: (n: string) => void;
  emoji: string;
  setEmoji: (e: string) => void;
  onNext: () => void;
  saving: boolean;
  error: string;
}) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-6xl mb-4">{emoji}</div>
      <h2 className="display text-3xl font-bold leading-[1.1] mb-1">Who are you?</h2>
      <p className="text-sm text-fg-muted mb-5">Your squad will see this name and animal.</p>

      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name"
        maxLength={30}
        className="w-full px-4 py-4 bg-card border border-line rounded-2xl text-fg text-lg placeholder:text-fg-faint focus:outline-none focus:border-terracotta transition mb-5"
      />

      <div className="text-xs font-bold text-fg-muted tracking-widest uppercase mb-2.5">Pick your animal</div>
      <div className="grid grid-cols-5 gap-2 mb-auto">
        {ANIMAL_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            className={`aspect-square text-2xl rounded-xl border-2 transition flex items-center justify-center ${
              emoji === e ? "border-terracotta bg-terracotta/10" : "border-line bg-card hover:border-fg-faint"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-terracotta mt-3">{error}</p>}

      <button
        onClick={onNext}
        disabled={saving || !name.trim()}
        className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 mt-5"
      >
        {saving ? "..." : <>That's me <ArrowRight size={16} /></>}
      </button>
    </div>
  );
}
