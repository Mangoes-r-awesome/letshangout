import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users, LogOut } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default async function AppPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, emoji, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.name) redirect("/onboarding");

  const { data: squads } = await supabase
    .from("squads")
    .select("id, name, emoji, squad_members(user_id)")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-ink/85 border-b border-[#1F1D1B] px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center">
            <span className="text-ink font-bold text-sm">H</span>
          </div>
          <div className="display text-lg font-bold">Hangouts</div>
        </div>
        <div className="flex items-center gap-3">
          {profile.is_admin && (
            <Link href="/admin" className="text-xs font-semibold text-[#8B7355] hover:text-bone">Admin</Link>
          )}
          <div className="flex items-center gap-2">
            <div className="text-2xl">{profile.emoji}</div>
            <div className="text-sm font-semibold">{profile.name}</div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="display text-3xl font-bold mb-1">Your squads</h1>
          <p className="text-sm text-[#8B7355]">{squads?.length || 0} active</p>
        </div>

        {squads && squads.length > 0 ? (
          <div className="space-y-3 mb-8">
            {squads.map((s: any) => (
              <Link
                key={s.id}
                href={`/app/squad/${s.id}`}
                className="block p-5 bg-[#1A1A18] border border-[#2A2826] rounded-2xl hover:border-terracotta/40 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{s.emoji}</div>
                  <div className="flex-1">
                    <div className="display text-lg font-bold">{s.name}</div>
                    <div className="text-xs text-[#8B7355] mt-0.5">{s.squad_members?.length || 0} members</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#1A1A18] border border-[#2A2826] rounded-2xl text-center mb-8">
            <Users size={32} className="text-[#3A3835] mx-auto mb-3" />
            <div className="display text-lg font-bold mb-1">No squads yet</div>
            <div className="text-sm text-[#8B7355] mb-4">Create your first one or join an existing squad via invite link.</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/app/squad/new"
            className="flex items-center justify-center gap-2 px-5 py-4 bg-terracotta text-ink rounded-xl font-bold hover:bg-terracotta/90 transition"
          >
            <Plus size={16} /> Create squad
          </Link>
          <Link
            href="/app/join"
            className="flex items-center justify-center gap-2 px-5 py-4 bg-[#1A1A18] border border-[#2A2826] text-bone rounded-xl font-bold hover:border-terracotta/40 transition"
          >
            Join with code
          </Link>
        </div>
      </div>
    </main>
  );
}
