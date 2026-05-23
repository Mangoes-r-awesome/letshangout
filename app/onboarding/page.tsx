"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

const EMOJIS = ["🦁", "🦊", "🐻", "🦉", "🦝", "🐺", "🐯", "🐨", "🐼", "🐸", "🦄", "🦋", "🐙", "🦀", "🦖", "🐉", "🦅", "🦩", "🐧", "🦦"];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🦊");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error: upErr } = await supabase
      .from("users")
      .update({ name: name.trim(), emoji })
      .eq("id", user.id);

    if (upErr) {
      setError(upErr.message);
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col items-center justify-center px-5 py-10">
      <form onSubmit={save} className="w-full max-w-sm space-y-6">
        <div>
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="display text-3xl font-bold mb-2 leading-tight">Who are you?</h1>
          <p className="text-sm text-[#8B7355]">Your squad will see this name and emoji.</p>
        </div>

        <div>
          <input
            autoFocus
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            maxLength={30}
            className="w-full px-4 py-4 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone text-lg placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta transition"
          />
        </div>

        <div>
          <div className="text-xs font-semibold text-[#8B7355] tracking-widest uppercase mb-3">Pick your animal</div>
          <div className="grid grid-cols-5 gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`aspect-square text-2xl rounded-xl border-2 transition flex items-center justify-center ${emoji === e ? "border-terracotta bg-terracotta/10" : "border-[#2A2826] bg-[#1A1A18] hover:border-[#3A3835]"}`}
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
          {loading ? "..." : <>Let's go <ArrowRight size={16} /></>}
        </button>
      </form>
    </main>
  );
}
