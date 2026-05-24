import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users, Settings } from "lucide-react";

export default async function AppPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, emoji, is_admin, has_completed_onboarding")
    .eq("id", user.id)
    .single();

  if (!profile?.has_completed_onboarding) redirect("/onboarding");

  const { data: squads } = await supabase
    .from("squads")
    .select("id, name, emoji, squad_members(user_id, users(emoji))")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-page text-fg">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-page/85 border-b border-line-soft px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center">
            <span className="text-ink font-bold text-sm">H</span>
          </div>
          <div className="display text-lg font-bold">Hangouts</div>
        </div>
        <div className="flex items-center gap-3">
          {profile.is_admin && (
            <Link href="/admin" className="text-xs font-semibold text-fg-muted hover:text-fg transition">Admin</Link>
          )}
          <Link href="/me/settings" className="flex items-center gap-2 hover:opacity-80 transition" aria-label="Settings">
            <div className="text-2xl">{profile.emoji}</div>
            <div className="text-sm font-semibold">{profile.name}</div>
          </Link>
          <Link href="/me/settings" className="text-fg-muted hover:text-fg transition" aria-label="Settings">
            <Settings size={16} />
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-9">
        <div className="mb-8">
          <div className="display italic text-[13px] text-terracotta tracking-wide mb-1">— your crews</div>
          <h1 className="display text-4xl font-bold leading-tight">Your squads</h1>
          <p className="text-sm text-fg-muted mt-2">{squads?.length || 0} active</p>
        </div>

        {squads && squads.length > 0 ? (
          <div className="space-y-3 mb-8">
            {squads.map((s: any, idx: number) => {
              const memberEmojis: string[] = (s.squad_members ?? [])
                .map((sm: any) => sm.users?.emoji)
                .filter(Boolean)
                .slice(0, 5);
              return (
                <Link
                  key={s.id}
                  href={`/app/squad/${s.id}`}
                  className="group relative block overflow-hidden p-5 pl-6 bg-card border border-line rounded-2xl hover:border-terracotta/50 hover:bg-card-soft transition-all"
                  style={{ animation: `slide-up 0.4s ease-out ${idx * 0.06}s both` }}
                >
                  <span className="absolute top-0 left-0 bottom-0 w-[3px] bg-terracotta scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
                  <span className="absolute -right-3 -bottom-6 text-[110px] leading-none opacity-[0.05] select-none pointer-events-none transition-transform duration-500 group-hover:rotate-6 group-hover:opacity-[0.08]">
                    {s.emoji}
                  </span>

                  <div className="relative flex items-center gap-4">
                    <div className="text-3xl leading-none">{s.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="display text-xl font-bold leading-tight truncate">{s.name}</div>
                      <div className="text-[11px] text-fg-muted mt-1 font-medium tracking-wide uppercase">
                        {s.squad_members?.length || 0} {s.squad_members?.length === 1 ? "member" : "members"}
                      </div>
                    </div>

                    {memberEmojis.length > 0 && (
                      <div className="hidden sm:flex items-center -space-x-2 mr-1">
                        {memberEmojis.map((e, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-page border-2 border-card flex items-center justify-center text-base"
                            style={{ zIndex: memberEmojis.length - i }}
                          >
                            {e}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="relative p-10 bg-card-soft border border-dashed border-line rounded-3xl text-center mb-8 grain overflow-hidden">
            <div className="relative">
              <Users size={28} className="text-terracotta/70 mx-auto mb-4" strokeWidth={1.5} />
              <div className="display italic text-sm text-terracotta tracking-wide mb-2">A blank canvas</div>
              <div className="display text-2xl font-bold mb-2 leading-tight">No squads yet</div>
              <div className="text-sm text-fg-muted max-w-xs mx-auto leading-relaxed">
                Create your first one — or paste an invite link from a mate.
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/app/squad/new"
            className="flex items-center justify-center gap-2 px-5 py-4 bg-terracotta text-ink rounded-2xl font-bold hover:opacity-90 active:scale-[0.98] transition"
          >
            <Plus size={16} strokeWidth={2.5} /> Create squad
          </Link>
          <Link
            href="/app/join"
            className="flex items-center justify-center gap-2 px-5 py-4 bg-card border border-line text-fg rounded-2xl font-bold hover:border-terracotta/40 active:scale-[0.98] transition"
          >
            Join with code
          </Link>
        </div>
      </div>
    </main>
  );
}
