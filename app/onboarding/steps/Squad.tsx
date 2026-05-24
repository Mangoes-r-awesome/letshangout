"use client";
import { ArrowRight, Plus, Share2 } from "lucide-react";

export default function Squad({
  onCreate,
  onJoin,
  onSkip,
}: {
  onCreate: () => void;
  onJoin: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-3">The only step that matters</div>
      <h2 className="display text-3xl font-bold leading-[1.1] mb-2">Who's your first squad?</h2>
      <p className="text-sm text-fg-muted mb-6 leading-relaxed">
        The magic only works when 2+ mates are in. Get your group chat off WhatsApp and into Hangouts.
      </p>

      <div className="space-y-3 flex-1">
        <button onClick={onCreate} className="w-full p-4 bg-terracotta text-ink rounded-2xl font-bold text-sm flex items-center gap-3 text-left hover:opacity-90 transition">
          <Plus size={18} />
          <div className="flex-1">
            <div className="text-base">Create a squad</div>
            <div className="text-xs opacity-70 mt-0.5 font-medium">Name it, invite the crew</div>
          </div>
          <ArrowRight size={16} />
        </button>
        <button onClick={onJoin} className="w-full p-4 bg-card border border-line text-fg rounded-2xl font-semibold text-sm flex items-center gap-3 text-left hover:border-terracotta/40 transition">
          <Share2 size={18} className="text-sun" />
          <div className="flex-1">
            <div className="text-base">Got an invite link?</div>
            <div className="text-xs text-fg-muted mt-0.5 font-medium">Paste it or enter a code</div>
          </div>
          <ArrowRight size={16} className="text-fg-muted" />
        </button>
      </div>

      <div className="p-3.5 bg-card-soft border border-dashed border-line rounded-xl mt-4 flex items-start gap-2.5">
        <div className="text-lg">💡</div>
        <div className="text-xs text-fg-muted leading-relaxed">
          <span className="text-fg font-semibold">Pro move:</span> create the squad, drop the invite into your group chat. Half your mates will be in within 10 min.
        </div>
      </div>

      <button onClick={onSkip} className="text-xs text-fg-muted font-semibold mt-4 py-2 hover:text-fg transition">
        I'll do this later
      </button>
    </div>
  );
}
