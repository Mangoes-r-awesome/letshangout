"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function JoinWithCodePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function join(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/squads/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't join");
      router.push(`/app/squad/${data.squad_id}`);
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

        <form onSubmit={join} className="space-y-6">
          <div>
            <h1 className="display text-3xl font-bold mb-2 leading-tight">Got a code?</h1>
            <p className="text-sm text-[#8B7355]">Enter the 6-character squad code your mate shared.</p>
          </div>

          <input
            autoFocus
            required
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="w-full px-4 py-4 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone text-2xl text-center tracking-[0.5em] uppercase placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta transition font-mono"
          />

          {error && <p className="text-xs text-terracotta">{error}</p>}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full px-6 py-4 bg-terracotta text-ink rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-terracotta/90 transition disabled:opacity-50"
          >
            {loading ? "Joining..." : <>Join <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </main>
  );
}
