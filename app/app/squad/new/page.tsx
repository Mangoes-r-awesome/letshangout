"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const SQUAD_EMOJIS = ["👥", "🍻", "🏔️", "🎉", "🏝️", "🍕", "⚽", "🎮", "🎬", "✈️", "🏠", "💪", "🎨", "🎵", "🔥", "💛"];

export default function NewSquadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👥");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/squads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't create");
      router.push(`/app/squad/${data.squad.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-bone px-5 py-10">
      <div className="max-w-md mx-auto">
        <Link href="/app" className="inline-flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone mb-6">
          <ArrowLeft size={12} /> Back
        </Link>

        <form onSubmit={create} className="space-y-6">
          <div>
            <div className="text-6xl mb-4">{emoji}</div>
            <h1 className="display text-3xl font-bold mb-2 leading-tight">Name your squad</h1>
            <p className="text-sm text-[#8B7355]">Like "The Cousins" or "Bali Boys" or whatever.</p>
          </div>

          <input
            autoFocus
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Squad name"
            maxLength={50}
            className="w-full px-4 py-4 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone text-lg placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta transition"
          />

          <div>
            <div className="text-xs font-semibold text-[#8B7355] tracking-widest uppercase mb-3">Squad emoji</div>
            <div className="grid grid-cols-8 gap-2">
              {SQUAD_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`aspect-square text-xl rounded-lg border-2 transition flex items-center justify-center ${emoji === e ? "border-terracotta bg-terracotta/10" : "border-[#2A2826] bg-[#1A1A18] hover:border-[#3A3835]"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-terracotta">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full px-6 py-4 bg-terracotta text-ink rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-terracotta/90 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : <>Create squad <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </main>
  );
}
