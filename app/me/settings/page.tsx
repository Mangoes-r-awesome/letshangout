import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sun, Moon, LogOut, User as UserIcon } from "lucide-react";
import ThemeToggleRow from "@/components/ThemeToggleRow";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, emoji, phone, theme_preference, is_admin")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-ink/85 border-b border-[#1F1D1B] px-5 py-4">
        <Link href="/app" className="inline-flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone">
          <ArrowLeft size={12} /> App
        </Link>
      </header>

      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        <div>
          <div className="text-6xl mb-3">{profile?.emoji || "🦊"}</div>
          <h1 className="display text-3xl font-bold leading-tight">{profile?.name || "You"}</h1>
          <p className="text-sm text-[#8B7355] mt-1">{profile?.phone}</p>
        </div>

        <section>
          <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase mb-3">Appearance</div>
          <ThemeToggleRow initial={(profile?.theme_preference as any) || "dark"} />
        </section>

        <section>
          <div className="text-[10px] font-bold text-[#8B7355] tracking-widest uppercase mb-3">Account</div>
          <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl overflow-hidden">
            <Link href="/app" className="block px-4 py-3.5 border-b border-[#2A2826] flex items-center gap-3 hover:bg-[#1F1D1B] transition">
              <UserIcon size={16} className="text-[#8B7355]" />
              <div className="flex-1 text-sm font-semibold">Edit profile</div>
              <div className="text-xs text-[#8B7355]">Coming soon</div>
            </Link>
            {profile?.is_admin && (
              <Link href="/admin" className="block px-4 py-3.5 border-b border-[#2A2826] flex items-center gap-3 hover:bg-[#1F1D1B] transition">
                <div className="text-base">⚙️</div>
                <div className="flex-1 text-sm font-semibold">Admin dashboard</div>
              </Link>
            )}
            <div className="px-4 py-3.5 flex items-center gap-3">
              <LogOut size={16} className="text-[#8B7355]" />
              <div className="flex-1 text-sm font-semibold">Sign out</div>
              <SignOutButton />
            </div>
          </div>
        </section>

        <div className="text-xs text-[#8B7355] text-center pt-4">Hangouts · v1 · 🇦🇺</div>
      </div>
    </main>
  );
}
