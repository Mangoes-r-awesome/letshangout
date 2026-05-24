"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader, Phone } from "lucide-react";

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
  const [calling, setCalling] = useState(false);
  const [sent, setSent] = useState<"nudge" | "call" | null>(null);
  const [error, setError] = useState("");
  const [confirmCall, setConfirmCall] = useState(false);

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
      setSent("nudge");
      router.refresh();
      setTimeout(() => setSent(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setNudging(false);
    }
  }

  async function callThem() {
    if (calling) return;
    setCalling(true);
    setError("");
    setConfirmCall(false);
    try {
      const res = await fetch("/api/nudges/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hangout_id: hangoutId, target_user_id: member.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't place call");
      setSent("call");
      router.refresh();
      setTimeout(() => setSent(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCalling(false);
    }
  }

  const badge = {
    in:      { color: "#7BA77B", bg: "rgba(74, 107, 74, 0.15)",  label: "IN" },
    maybe:   { color: "#F2A623", bg: "rgba(242, 166, 35, 0.15)", label: "MAYBE" },
    out:     { color: "#E8593C", bg: "rgba(232, 89, 60, 0.15)",  label: "OUT" },
    pending: { color: "#C4B99A", bg: "rgba(196, 185, 154, 0.15)", label: "PENDING" },
  }[rsvpStatus] || { color: "#8B7355", bg: "transparent", label: "—" };

  const canEscalate = rsvpStatus === "pending" && member.id !== currentUserId && member.phone;

  return (
    <div className={`px-4 py-3 flex items-center gap-3 ${!isLast ? "border-b border-line" : ""}`}>
      <div className="text-2xl">{member.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold flex items-center gap-2">
          {member.name}
          {member.id === organiserId && <span className="text-[9px] font-bold text-terracotta px-1.5 py-0.5 bg-terracotta/10 rounded">ORGANISER</span>}
        </div>
        {respondedAt && (
          <div className="text-[10px] text-fg-muted mt-0.5">
            {responseMethod === "sms" ? "📱 SMS" : responseMethod === "call" ? "📞 Call" : "✓ App"} · {new Date(respondedAt).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          </div>
        )}
        {error && <div className="text-[10px] text-terracotta mt-1 leading-tight">{error}</div>}
      </div>

      <div className="text-[9px] font-bold px-2 py-1 rounded tracking-wider" style={{ color: badge.color, background: badge.bg }}>{badge.label}</div>

      {canEscalate && !confirmCall && (
        <div className="flex items-center gap-1">
          <button
            onClick={nudge}
            disabled={nudging || calling}
            className="p-2 rounded-lg bg-terracotta/10 border border-terracotta/30 hover:bg-terracotta/20 transition disabled:opacity-50"
            title="Send a nudge SMS"
            aria-label="Nudge by SMS"
          >
            {nudging
              ? <Loader size={12} className="text-terracotta animate-spin" />
              : sent === "nudge"
                ? <span className="text-[10px] text-sage font-bold">SENT</span>
                : <Zap size={12} className="text-terracotta" />
            }
          </button>
          <button
            onClick={() => setConfirmCall(true)}
            disabled={nudging || calling}
            className="p-2 rounded-lg bg-sun/10 border border-sun/30 hover:bg-sun/20 transition disabled:opacity-50"
            title="Escalate to phone call"
            aria-label="Call them"
          >
            {calling
              ? <Loader size={12} className="text-sun animate-spin" />
              : sent === "call"
                ? <span className="text-[10px] text-sage font-bold">CALLING</span>
                : <Phone size={12} className="text-sun" />
            }
          </button>
        </div>
      )}

      {canEscalate && confirmCall && (
        <div className="flex items-center gap-2 bg-sun/10 border border-sun/30 rounded-lg pl-2.5 pr-1 py-1">
          <span className="text-[10px] text-fg leading-tight">Call {member.name.split(" ")[0]}?</span>
          <button
            onClick={callThem}
            className="px-2 py-1 bg-sun text-ink rounded-md text-[10px] font-bold"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmCall(false)}
            className="px-1.5 py-1 text-[10px] text-fg-muted hover:text-fg font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
