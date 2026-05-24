"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Hand } from "lucide-react";

type Status = "in" | "maybe" | "out" | "pending";
type Decided = Exclude<Status, "pending">;

const CONFIRMATIONS: Record<Decided, { msg: string; color: string }> = {
  in:    { msg: "Locked in 🍻",          color: "#7BA77B" },
  maybe: { msg: "Saved as a maybe 🤝",   color: "#F2A623" },
  out:   { msg: "Noted — next one 💔",   color: "#E8593C" },
};

export default function RsvpButtons({ hangoutId, currentStatus }: { hangoutId: string; currentStatus: Status }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(currentStatus);
  const [pending, setPending] = useState(false);
  const [reveal, setReveal] = useState<{ key: number; status: Decided } | null>(null);

  useEffect(() => {
    if (!reveal) return;
    const t = setTimeout(() => setReveal(null), 2600);
    return () => clearTimeout(t);
  }, [reveal]);

  async function update(newStatus: Decided) {
    if (status === newStatus && reveal) return;
    const prev = status;
    setStatus(newStatus);
    setPending(true);
    setReveal({ key: Date.now(), status: newStatus });
    try {
      const res = await fetch("/api/rsvps/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hangout_id: hangoutId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } catch {
      setStatus(prev);
      setReveal(null);
    } finally {
      setPending(false);
    }
  }

  const opts: { value: Decided; label: string; icon: typeof Check; color: string; bg: string }[] = [
    { value: "in",    label: "I'm in",        icon: Check, color: "#7BA77B", bg: "rgba(123, 167, 123, 0.14)" },
    { value: "maybe", label: "Maybe",         icon: Hand,  color: "#F2A623", bg: "rgba(242, 166, 35, 0.14)" },
    { value: "out",   label: "Can't make it", icon: X,     color: "#E8593C", bg: "rgba(232, 89, 60, 0.14)" },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {opts.map((o) => {
          const active = status === o.value;
          const recentlyChosen = reveal?.status === o.value;
          return (
            <button
              key={o.value}
              onClick={() => update(o.value)}
              disabled={pending}
              aria-pressed={active}
              className="relative p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-[transform,border-color,background] duration-200 active:scale-[0.96] disabled:cursor-wait"
              style={{
                borderColor: active ? o.color : "#2A2826",
                background: active ? o.bg : "#1A1A18",
                animation: recentlyChosen ? "stamp 0.4s ease-out" : undefined,
                transform: active ? "scale(1.015)" : undefined,
              }}
            >
              <o.icon size={16} color={active ? o.color : "#8B7355"} strokeWidth={2.5} />
              <div className="text-[11px] font-bold tracking-tight" style={{ color: active ? o.color : "#FAF8F5" }}>
                {o.label}
              </div>
            </button>
          );
        })}
      </div>
      <div className="h-5 relative">
        {reveal && (
          <div
            key={reveal.key}
            className="absolute inset-0 text-xs font-bold text-center pointer-events-none"
            style={{ color: CONFIRMATIONS[reveal.status].color, animation: "confirm-rise 2.6s ease-out forwards" }}
          >
            {CONFIRMATIONS[reveal.status].msg}
          </div>
        )}
      </div>
    </div>
  );
}
