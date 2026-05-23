"use client";
import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export default function InviteLink({ code, squadName }: { code: string; squadName: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/join/${code}` : `/join/${code}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    const text = `Join "${squadName}" on Hangouts 👥`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Join my squad on Hangouts", text, url });
      } catch {}
    } else {
      await copy();
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Share2 size={14} className="text-sun" />
        <h2 className="display text-sm font-bold tracking-wide uppercase text-[#8B7355]">Invite the crew</h2>
      </div>
      <div className="p-5 bg-[#1A1A18] border border-[#2A2826] rounded-2xl">
        <div className="text-xs text-[#8B7355] mb-2">Share this link in your group chat:</div>
        <div className="flex items-center gap-2 p-3 bg-ink/50 border border-[#2A2826] rounded-lg mb-3">
          <div className="flex-1 text-sm font-mono truncate text-bone">{url}</div>
          <button onClick={copy} className="text-[#8B7355] hover:text-terracotta transition">
            {copied ? <Check size={14} className="text-sage" /> : <Copy size={14} />}
          </button>
        </div>
        <button
          onClick={share}
          className="w-full px-5 py-3 bg-terracotta text-ink rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-terracotta/90 transition"
        >
          <Share2 size={14} /> Share invite
        </button>
        <div className="text-xs text-[#8B7355] mt-3">
          Or share the code: <span className="font-mono font-bold text-bone">{code}</span>
        </div>
      </div>
    </div>
  );
}
