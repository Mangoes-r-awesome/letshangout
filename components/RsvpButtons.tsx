"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Hand } from "lucide-react";

type Status = "in" | "maybe" | "out" | "pending";

export default function RsvpButtons({ hangoutId, currentStatus }: { hangoutId: string; currentStatus: Status }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(currentStatus);
  const [pending, setPending] = useState(false);

  async function update(newStatus: "in" | "maybe" | "out") {
    if (status === newStatus) return;
    const prev = status;
    setStatus(newStatus); // optimistic
    setPending(true);
    try {
      const res = await fetch("/api/rsvps/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hangout_id: hangoutId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } catch {
      setStatus(prev); // rollback
    } finally {
      setPending(false);
    }
  }

  const opts = [
    { value: "in" as const, label: "I'm in", icon: Check, activeColor: "#7BA77B", bg: "rgba(74, 107, 74, 0.15)" },
    { value: "maybe" as const, label: "Maybe", icon: Hand, activeColor: "#F2A623", bg: "rgba(242, 166, 35, 0.15)" },
    { value: "out" as const, label: "Can't make it", icon: X, activeColor: "#E8593C", bg: "rgba(232, 89, 60, 0.15)" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o) => {
        const active = status === o.value;
        return (
          <button
            key={o.value}
            onClick={() => update(o.value)}
            disabled={pending}
            className="p-3 rounded-xl border-2 transition flex flex-col items-center gap-1.5"
            style={{
              borderColor: active ? o.activeColor : "#2A2826",
              background: active ? o.bg : "#1A1A18",
            }}
          >
            <o.icon size={16} color={active ? o.activeColor : "#8B7355"} />
            <div className="text-[11px] font-bold" style={{ color: active ? o.activeColor : "#FAF8F5" }}>{o.label}</div>
          </button>
        );
      })}
    </div>
  );
}
