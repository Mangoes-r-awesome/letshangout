"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader } from "lucide-react";

export default function MemberRow({
  member,
  rsvpStatus,
  responseMethod,
  respondedAt,
  hangoutId,
  isLast,
  organiserId,
  currentUserId,
}: {
  member: { id: string; name: string; emoji: string; phone?: string };
  rsvpStatus: string;
  responseMethod: string | null;
  respondedAt: string | null;
  hangoutId: string;
  isLast: boolean;
  organiserId: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [nudging, setNudging] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function nudge() {
    if (nudging) return;
    setNudging(true);
    setError("");
    try {
      const res = await fetch("/api/nudges/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hangout_id: hangoutId, target_user_id: member.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't send");
      setSent(true);
      router.refresh();
      setTimeout(() => setSent(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setNudging(false);
    }
  }

  const badge = {
    in: { color: "#7BA77B", bg: "rgba(74, 107, 74, 0.15)", label: "IN" },
    maybe: { color: "#F2A623", bg: "rgba(242, 166, 35, 0.15)", label: "MAYBE" },
    out: { color: "#E8593C", bg: "rgba(232, 89, 60, 0.15)", label: "OUT" },
    pending: { color: "#C4B99A", bg: "rgba(196, 185, 154, 0.15)", label: "PENDING" },
  }[rsvpStatus] || { color: "#8B7355", bg: "transparent", label: "—" };

  const canNudge = rsvpStatus === "pending" && member.id !== currentUserId && member.phone;

  return (
    <div className={`px-4 py-3 flex items-center gap-3 ${!isLast ? "border-b border-[#2A2826]" : ""}`}>
      <div className="text-2xl">{member.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold flex items-center gap-2">
          {member.name}
          {member.id === organiserId && <span className="text-[9px] font-bold text-terracotta px-1.5 py-0.5 bg-terracotta/10 rounded">ORGANISER</span>}
        </div>
        {respondedAt && (
          <div className="text-[10px] text-[#8B7355] mt-0.5">
            {responseMethod === "sms" ? "📱 SMS" : "✓ App"} · {new Date(respondedAt).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          </div>
        )}
      </div>
      <div className="text-[9px] font-bold px-2 py-1 rounded tracking-wider" style={{ color: badge.color, background: badge.bg }}>{badge.label}</div>
      {canNudge && (
        <button
          onClick={nudge}
          disabled={nudging}
          className="p-2 rounded-lg bg-terracotta/10 border border-terracotta/30 hover:bg-terracotta/20 transition disabled:opacity-50"
          title="Send a nudge SMS"
        >
          {nudging ? <Loader size={12} className="text-terracotta animate-spin" /> : sent ? <span className="text-[10px] text-sage font-bold">SENT</span> : <Zap size={12} className="text-terracotta" />}
        </button>
      )}
      {error && <div className="text-[9px] text-terracotta">{error}</div>}
    </div>
  );
}
