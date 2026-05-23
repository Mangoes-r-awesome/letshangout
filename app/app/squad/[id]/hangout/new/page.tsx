"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Clock, MapPin, DollarSign, Package } from "lucide-react";
import Link from "next/link";

const HANGOUT_EMOJIS = ["🍻", "🍷", "🍕", "🎉", "🏔️", "🏝️", "⚽", "🎮", "🎬", "✈️", "🏠", "💪", "🎨", "🎵", "🔥", "🎤", "🍝", "☕"];

export default function NewHangoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const squadId = params.id;

  const [emoji, setEmoji] = useState("🍻");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [cost, setCost] = useState("");
  const [bring, setBring] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give it a name first");
      return;
    }
    setError("");
    setLoading(true);

    let starts_at = null;
    if (date) {
      const datetime = time ? `${date}T${time}` : `${date}T18:00`;
      starts_at = new Date(datetime).toISOString();
    }

    try {
      const res = await fetch("/api/hangouts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          squad_id: squadId,
          title,
          emoji,
          description,
          location,
          starts_at,
          cost_per_person: cost,
          bring,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't create");
      router.push(`/app/squad/${squadId}/hangout/${data.hangout.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-ink/85 border-b border-[#1F1D1B] px-5 py-4">
        <Link href={`/app/squad/${squadId}`} className="inline-flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone">
          <ArrowLeft size={12} /> Squad
        </Link>
      </header>

      <form onSubmit={create} className="max-w-md mx-auto px-5 py-6 space-y-5">
        <div>
          <div className="text-6xl mb-3">{emoji}</div>
          <h1 className="display text-3xl font-bold mb-1 leading-tight">Plan something.</h1>
          <p className="text-sm text-[#8B7355]">The agent does the rest.</p>
        </div>

        <div>
          <input
            autoFocus
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's the plan? e.g. Hunter Valley trip"
            maxLength={80}
            className="w-full px-4 py-4 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone text-lg placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta transition"
          />
        </div>

        <div>
          <div className="text-xs font-bold text-[#8B7355] tracking-widest uppercase mb-2">Emoji</div>
          <div className="grid grid-cols-9 gap-1.5">
            {HANGOUT_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`aspect-square text-lg rounded-lg border-2 transition flex items-center justify-center ${
                  emoji === e ? "border-terracotta bg-terracotta/10" : "border-[#2A2826] bg-[#1A1A18] hover:border-[#3A3835]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <Field icon={Clock} label="When">
            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 px-3 py-3 bg-[#1A1A18] border border-[#2A2826] rounded-lg text-bone text-sm focus:outline-none focus:border-terracotta"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 px-3 py-3 bg-[#1A1A18] border border-[#2A2826] rounded-lg text-bone text-sm focus:outline-none focus:border-terracotta"
              />
            </div>
          </Field>

          <Field icon={MapPin} label="Where">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tower Estate, Pokolbin"
              className="w-full px-3 py-3 bg-[#1A1A18] border border-[#2A2826] rounded-lg text-bone text-sm placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta"
            />
          </Field>

          <Field icon={DollarSign} label="Cost per person">
            <input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="285"
              className="w-full px-3 py-3 bg-[#1A1A18] border border-[#2A2826] rounded-lg text-bone text-sm placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta"
            />
          </Field>

          <Field icon={Package} label="Bring">
            <input
              type="text"
              value={bring}
              onChange={(e) => setBring(e.target.value)}
              placeholder="Esky, snacks, wallet"
              className="w-full px-3 py-3 bg-[#1A1A18] border border-[#2A2826] rounded-lg text-bone text-sm placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta"
            />
          </Field>
        </div>

        <div>
          <div className="text-xs font-bold text-[#8B7355] tracking-widest uppercase mb-2">Details</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Three vineyards, lunch at Muse, cheese at HV Cheese Co. Carpooling from Sydney 8am."
            rows={3}
            className="w-full px-4 py-3 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone text-sm placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta resize-none"
          />
        </div>

        {error && <p className="text-xs text-terracotta">{error}</p>}

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : <>Send to the squad <ArrowRight size={16} /></>}
        </button>
      </form>
    </main>
  );
}

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="p-3.5 bg-[#1A1A18] border border-[#2A2826] rounded-xl">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} className="text-[#8B7355]" />
        <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase">{label}</div>
      </div>
      {children}
    </div>
  );
}
