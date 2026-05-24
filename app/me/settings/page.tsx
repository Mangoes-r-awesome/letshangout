import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut, User as UserIcon } from "lucide-react";
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
    <main className="min-h-screen bg-page text-fg">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-page/85 border-b border-line-soft px-5 py-4">
        <Link href="/app" className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg transition">
          <ArrowLeft size={12} /> App
        </Link>
      </header>

      <div className="max-w-md mx-auto px-5 py-7 space-y-7">
        <div>
          <div className="text-6xl mb-3">{profile?.emoji || "🦊"}</div>
          <div className="display italic text-[13px] text-terracotta tracking-wide mb-1">— that's you</div>
          <h1 className="display text-3xl font-bold leading-tight">{profile?.name || "You"}</h1>
          <p className="text-sm text-fg-muted mt-1">{profile?.phone}</p>
        </div>

        <section>
          <div className="text-[10px] font-bold text-fg-muted tracking-[0.25em] uppercase mb-3">Appearance</div>
          <ThemeToggleRow />
        </section>

        <section>
          <div className="text-[10px] font-bold text-fg-muted tracking-[0.25em] uppercase mb-3">Account</div>
          <div className="bg-card border border-line rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-line flex items-center gap-3">
              <UserIcon size={16} className="text-fg-muted" />
              <div className="flex-1 text-sm font-semibold">Edit profile</div>
              <div className="text-xs text-fg-muted">Coming soon</div>
            </div>
            {profile?.is_admin && (
              <Link href="/admin" className="block px-4 py-3.5 border-b border-line flex items-center gap-3 hover:bg-card-soft transition">
                <div className="text-base">⚙️</div>
                <div className="flex-1 text-sm font-semibold">Admin dashboard</div>
              </Link>
            )}
            <div className="px-4 py-3.5 flex items-center gap-3">
              <LogOut size={16} className="text-fg-muted" />
              <div className="flex-1 text-sm font-semibold">Sign out</div>
              <SignOutButton />
            </div>
          </div>
        </section>

        <div className="display italic text-xs text-fg-muted text-center pt-4">
          Hangouts · v1 · made in 🇦🇺
        </div>
      </div>
    </main>
  );
}
