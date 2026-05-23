import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const handle = user.phone || user.email || "friend";

  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col">
      <nav className="px-5 py-4 border-b border-[#1F1D1B] flex justify-between items-center">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center">
            <span className="text-ink font-bold text-sm">H</span>
          </div>
          <div className="display text-lg font-bold">Hangouts</div>
        </a>
        <form action="/auth/signout" method="POST">
          <button className="text-xs text-[#8B7355] hover:text-bone transition">
            Sign out
          </button>
        </form>
      </nav>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md text-center">
          <div className="display text-4xl mb-3">👋</div>
          <h1 className="display text-3xl font-bold mb-2">You're in.</h1>
          <p className="text-sm text-[#8B7355] mb-6">
            Signed in as <span className="text-bone font-semibold">{handle}</span>
          </p>
          <p className="text-sm text-[#D4CFC7] leading-relaxed">
            Squad creation, hangout proposals, and the AI nudger ship next.
            For now, brag to your group chat that you got in.
          </p>
        </div>
      </div>
    </main>
  );
}
