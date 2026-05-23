"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function JoinButton({ squadId, code, loggedIn }: { squadId: string; code: string; loggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/squads/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't join");
      router.push(`/app/squad/${squadId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (!loggedIn) {
    return (
      <a
        href={`/login?next=/join/${code}`}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-terracotta text-ink rounded-xl font-bold hover:bg-terracotta/90 transition"
      >
        Sign in to join <ArrowRight size={16} />
      </a>
    );
  }

  return (
    <>
      <button
        onClick={join}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-terracotta text-ink rounded-xl font-bold hover:bg-terracotta/90 transition disabled:opacity-50"
      >
        {loading ? "Joining..." : <>Join squad <ArrowRight size={16} /></>}
      </button>
      {error && <p className="text-xs text-terracotta mt-2">{error}</p>}
    </>
  );
}
