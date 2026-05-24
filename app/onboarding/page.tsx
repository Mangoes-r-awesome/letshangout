"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronLeft, Plus, Share2, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

const ANIMAL_EMOJIS = ["🦁", "🦊", "🐻", "🦉", "🦝", "🐺", "🐯", "🐨", "🐼", "🐸", "🦄", "🦋", "🐙", "🦀", "🦖"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🦁");
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 8;
  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  async function saveProfile() {
    if (!name.trim()) {
      setError("Pop your name in first");
      return false;
    }
    setSavingProfile(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return false;
    }
    const { error: upErr } = await supabase
      .from("users")
      .update({ name: name.trim(), emoji })
      .eq("id", user.id);
    setSavingProfile(false);
    if (upErr) {
      setError(upErr.message);
      return false;
    }
    return true;
  }

  async function completeOnboarding(action: "create" | "join" | "skip") {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("users")
        .update({ has_completed_onboarding: true })
        .eq("id", user.id);
    }
    if (action === "create") router.push("/app/squad/new");
    else if (action === "join") router.push("/app/join");
    else router.push("/app");
  }

  async function handleStep5Next() {
    const ok = await saveProfile();
    if (ok) next();
  }

  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col">
      {/* Progress + back */}
      <div className="sticky top-0 z-50 px-5 pt-12 pb-3 bg-ink/90 backdrop-blur-xl flex items-center gap-3">
        {step > 0 && step < 7 && (
          <button onClick={prev} className="text-[#8B7355] hover:text-bone transition" aria-label="Back">
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex-1 h-1 bg-[#2A2826] rounded-full overflow-hidden">
          <div
            className="h-full bg-terracotta transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        {step > 0 && step < 5 && (
          <button onClick={() => setStep(5)} className="text-xs font-semibold text-[#8B7355] hover:text-bone transition">
            Skip
          </button>
        )}
      </div>

      <div
        key={step}
        className="flex-1 flex flex-col px-7 pb-8 overflow-y-auto"
        style={{ animation: "step-in 0.42s cubic-bezier(0.2, 0.7, 0.2, 1) both" }}
      >
        {step === 0 && <Step0Welcome onNext={next} />}
        {step === 1 && <Step1Pain onNext={next} />}
        {step === 2 && <Step2Magic onNext={next} />}
        {step === 3 && <Step3Stats onNext={next} />}
        {step === 4 && <Step4Mission onNext={next} />}
        {step === 5 && (
          <Step5Identity
            name={name}
            setName={setName}
            emoji={emoji}
            setEmoji={setEmoji}
            onNext={handleStep5Next}
            saving={savingProfile}
            error={error}
          />
        )}
        {step === 6 && <Step6Squad onCreate={() => completeOnboarding("create")} onJoin={() => completeOnboarding("join")} onSkip={next} />}
        {step === 7 && <Step7Calendar onConnect={() => completeOnboarding("skip")} onSkip={() => completeOnboarding("skip")} />}
      </div>
    </main>
  );
}

// ============ STEPS ============

function Step0Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full">
      <div className="text-7xl mb-6 animate-[fade-in_1.2s_ease-out]">👋</div>
      <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05] mb-5 animate-[fade-in_0.6s_ease-out_0.2s_both]">
        Your friendships<br />deserve better.
      </h1>
      <p className="text-base text-[#D4CFC7] leading-relaxed mb-auto animate-[fade-in_0.6s_ease-out_0.5s_both]">
        We built Hangouts because group chats are where good plans go to die. Let's fix that. ↓
      </p>
      <button
        onClick={onNext}
        className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-10 animate-[fade-in_0.6s_ease-out_0.9s_both]"
      >
        Show me <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Step1Pain({ onNext }: { onNext: () => void }) {
  const pains = [
    { emoji: "📅", text: "Three people thumbs-up your date. The other four never reply." },
    { emoji: "💸", text: "You front $2k for the boys' trip. Six months later you've collected $400." },
    { emoji: "📵", text: "Eight months pass. Nobody saw it happen." },
  ];
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-5 animate-[fade-in_0.4s]">You know the feeling</div>
      <h2 className="display text-3xl sm:text-4xl font-bold leading-[1.1] mb-8 animate-[fade-in_0.6s_ease-out_0.1s_both]">
        "We <span className="text-terracotta italic">really</span> need to catch up soon"
      </h2>
      <div className="space-y-3 mb-auto">
        {pains.map((p, i) => (
          <div
            key={i}
            className="p-4 bg-[#1A1A18] border border-[#2A2826] rounded-2xl text-[#D4CFC7] animate-[fade-in_0.6s_ease-out_both]"
            style={{ animationDelay: `${0.3 + i * 0.25}s` }}
          >
            <div className="text-xl mb-1">{p.emoji}</div>
            <div className="text-sm leading-relaxed">{p.text}</div>
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-6 animate-[fade-in_0.6s_ease-out_1.4s_both]"
      >
        Yep, that's me <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Step2Magic({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-3 animate-[fade-in_0.4s]">Meet your agent</div>
      <h2 className="display text-3xl font-bold leading-[1.1] mb-2 animate-[fade-in_0.6s_ease-out_0.1s_both]">
        It does the pestering<br />so you don't have to.
      </h2>
      <p className="text-xs text-[#8B7355] mb-6 animate-[fade-in_0.6s_ease-out_0.3s_both]">Watch ↓</p>

      <div className="flex-1 bg-[#1A1A18] border border-[#2A2826] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#2A2826] mb-1">
          <div className="w-1.5 h-1.5 bg-sage rounded-full animate-pulse" />
          <div className="text-[10px] text-sage font-bold tracking-widest">AGENT WORKING</div>
        </div>

        <div className="flex items-start gap-2 animate-[fade-in_0.6s_ease-out_0.2s_both]">
          <div className="text-xl">🦝</div>
          <div className="flex-1 p-3 bg-[#0F0E0C] rounded-xl rounded-tl-sm">
            <div className="text-[10px] text-[#8B7355] mb-1">Sam · 3 days ago</div>
            <div className="text-sm">didn't reply 🦗</div>
          </div>
        </div>

        <div className="flex items-start justify-end gap-2 animate-[fade-in_0.6s_ease-out_0.6s_both]">
          <div className="flex-1 max-w-[85%] p-3 bg-terracotta/10 border border-terracotta/30 rounded-xl rounded-tr-sm">
            <div className="text-[10px] text-terracotta font-bold tracking-wider mb-1">AGENT · SMS SENT</div>
            <div className="text-sm italic">"Mate, third time asking 🙃 yes or no for Hunter Valley?"</div>
          </div>
        </div>

        <div className="flex items-start gap-2 animate-[fade-in_0.6s_ease-out_1.1s_both]">
          <div className="text-xl">🦝</div>
          <div className="flex-1 p-3 bg-[#0F0E0C] rounded-xl rounded-tl-sm">
            <div className="text-[10px] text-[#8B7355] mb-1">Sam · 4 min ago</div>
            <div className="text-sm">fk it, yeah i'm in 🍷</div>
          </div>
        </div>

        <div className="p-2.5 bg-sage/10 border border-sage/30 rounded-lg text-sm text-sage font-semibold flex items-center gap-2 animate-[fade-in_0.6s_ease-out_1.6s_both]">
          <Check size={14} /> Confirmed · auto-added to his calendar
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-5 animate-[fade-in_0.6s_ease-out_2s_both]"
      >
        Sick. What else? <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Step3Stats({ onNext }: { onNext: () => void }) {
  const people = [
    { rank: 1, name: "Marcus", emoji: "🦊", rate: 98, crown: true },
    { rank: 2, name: "Liam", emoji: "🐻", rate: 92 },
    { rank: 3, name: "Dee", emoji: "🦉", rate: 76 },
    { rank: 4, name: "Sam", emoji: "🦝", rate: 34, ghoster: true },
  ];
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-3 animate-[fade-in_0.4s]">Squad Stats</div>
      <h2 className="display text-3xl font-bold leading-[1.1] mb-2 animate-[fade-in_0.6s_ease-out_0.1s_both]">
        Nothing fixes a flake<br />like a leaderboard.
      </h2>
      <p className="text-sm text-[#8B7355] mb-5 leading-relaxed animate-[fade-in_0.6s_ease-out_0.3s_both]">
        Everyone sees who replies, who pays, who ghosts. Friends don't get mad — they get competitive 👀
      </p>

      <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl overflow-hidden flex-1 animate-[fade-in_0.6s_ease-out_0.5s_both]">
        {people.map((p, i) => (
          <div key={i} className={`px-4 py-3 flex items-center gap-3 ${i < 3 ? "border-b border-[#2A2826]" : ""}`}>
            <div className={`display text-lg font-bold w-5 ${p.crown ? "text-sun" : p.ghoster ? "text-terracotta" : "text-[#3A3835]"}`}>{p.rank}</div>
            <div className="text-2xl">{p.emoji}</div>
            <div className="flex-1">
              <div className="text-sm font-bold flex items-center gap-1.5">
                {p.name}
                {p.crown && <span>👑</span>}
                {p.ghoster && <span className="text-[10px] text-terracotta font-bold">🚩 GHOSTER</span>}
              </div>
              <div className="h-1 bg-[#2A2826] rounded mt-1.5 overflow-hidden">
                <div className="h-full rounded transition-all" style={{ width: `${p.rate}%`, background: p.rate > 80 ? "#7BA77B" : p.rate > 50 ? "#F2A623" : "#E8593C" }} />
              </div>
            </div>
            <div className="text-xs text-[#8B7355] min-w-[30px] text-right">{p.rate}%</div>
          </div>
        ))}
      </div>

      <button onClick={onNext} className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-5 animate-[fade-in_0.6s_ease-out_0.8s_both]">
        Public shaming, finally <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Step4Mission({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-5xl mb-5 animate-[fade-in_1s_ease-out]">💛</div>
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-3 animate-[fade-in_0.6s_ease-out_0.2s_both]">Why we built this</div>
      <h2 className="display text-3xl font-bold leading-[1.15] mb-5 animate-[fade-in_0.6s_ease-out_0.3s_both]">
        Friendships don't die from big fights.
      </h2>
      <p className="text-base text-[#D4CFC7] leading-relaxed mb-4 animate-[fade-in_0.6s_ease-out_0.6s_both]">
        They die from small moments we never get back. A coffee that didn't happen. A trip that fell through. A birthday someone meant to call about.
      </p>
      <p className="text-sm text-[#8B7355] leading-relaxed mb-auto animate-[fade-in_0.6s_ease-out_0.9s_both]">
        1 in 4 Australians feel lonely. We give <span className="text-terracotta font-bold">1% of revenue to R U OK?</span> because we want to be on the right side of that.
      </p>
      <button onClick={onNext} className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-6 animate-[fade-in_0.6s_ease-out_1.3s_both]">
        Let's go <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Step5Identity({ name, setName, emoji, setEmoji, onNext, saving, error }: {
  name: string;
  setName: (n: string) => void;
  emoji: string;
  setEmoji: (e: string) => void;
  onNext: () => void;
  saving: boolean;
  error: string;
}) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-6xl mb-4">{emoji}</div>
      <h2 className="display text-3xl font-bold leading-[1.1] mb-1">Who are you?</h2>
      <p className="text-sm text-[#8B7355] mb-5">Your squad will see this name and animal.</p>

      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name"
        maxLength={30}
        className="w-full px-4 py-4 bg-[#1A1A18] border border-[#2A2826] rounded-2xl text-bone text-lg placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta transition mb-5"
      />

      <div className="text-xs font-bold text-[#8B7355] tracking-widest uppercase mb-2.5">Pick your animal</div>
      <div className="grid grid-cols-5 gap-2 mb-auto">
        {ANIMAL_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            className={`aspect-square text-2xl rounded-xl border-2 transition flex items-center justify-center ${
              emoji === e ? "border-terracotta bg-terracotta/10" : "border-[#2A2826] bg-[#1A1A18] hover:border-[#3A3835]"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-terracotta mt-3">{error}</p>}

      <button
        onClick={onNext}
        disabled={saving || !name.trim()}
        className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 mt-5"
      >
        {saving ? "..." : <>That's me <ArrowRight size={16} /></>}
      </button>
    </div>
  );
}

function Step6Squad({ onCreate, onJoin, onSkip }: { onCreate: () => void; onJoin: () => void; onSkip: () => void }) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="text-xs font-bold text-terracotta tracking-widest uppercase mb-3">The only step that matters</div>
      <h2 className="display text-3xl font-bold leading-[1.1] mb-2">Who's your first squad?</h2>
      <p className="text-sm text-[#8B7355] mb-6 leading-relaxed">
        The magic only works when 2+ mates are in. Get your group chat off WhatsApp and into Hangouts.
      </p>

      <div className="space-y-3 flex-1">
        <button onClick={onCreate} className="w-full p-4 bg-terracotta text-ink rounded-2xl font-bold text-sm flex items-center gap-3 text-left hover:opacity-90 transition">
          <Plus size={18} />
          <div className="flex-1">
            <div className="text-base">Create a squad</div>
            <div className="text-xs opacity-70 mt-0.5 font-medium">Name it, invite the crew</div>
          </div>
          <ArrowRight size={16} />
        </button>
        <button onClick={onJoin} className="w-full p-4 bg-[#1A1A18] border border-[#2A2826] text-bone rounded-2xl font-semibold text-sm flex items-center gap-3 text-left hover:border-terracotta/40 transition">
          <Share2 size={18} className="text-sun" />
          <div className="flex-1">
            <div className="text-base">Got an invite link?</div>
            <div className="text-xs text-[#8B7355] mt-0.5 font-medium">Paste it or enter a code</div>
          </div>
          <ArrowRight size={16} className="text-[#8B7355]" />
        </button>
      </div>

      <div className="p-3.5 bg-[#0F0E0C] border border-dashed border-[#2A2826] rounded-xl mt-4 flex items-start gap-2.5">
        <div className="text-lg">💡</div>
        <div className="text-xs text-[#8B7355] leading-relaxed">
          <span className="text-bone font-semibold">Pro move:</span> create the squad, drop the invite into your group chat. Half your mates will be in within 10 min.
        </div>
      </div>

      <button onClick={onSkip} className="text-xs text-[#8B7355] font-semibold mt-4 py-2 hover:text-bone transition">
        I'll do this later
      </button>
    </div>
  );
}

function Step7Calendar({ onConnect, onSkip }: { onConnect: () => void; onSkip: () => void }) {
  return (
    <div className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-2">
      <div className="flex justify-center gap-3 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-[#1A1A18] border border-[#2A2826] flex items-center justify-center text-2xl">📅</div>
        <div className="flex items-center text-[#3A3835] text-xl">↔</div>
        <div className="w-14 h-14 rounded-2xl bg-terracotta flex items-center justify-center text-ink font-bold text-xl">H</div>
      </div>

      <h2 className="display text-3xl font-bold leading-[1.1] mb-2 text-center">Sync your calendar?</h2>
      <p className="text-sm text-[#D4CFC7] mb-6 text-center leading-relaxed">
        Optional — but this is where the magic compounds. We find when you're actually free instead of asking.
      </p>

      <div className="space-y-2 mb-auto">
        {["Auto-detect conflicts before nudging", "Suggest dates that work for everyone", "Auto-add confirmed hangouts to your calendar"].map((t, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-[#1A1A18] border border-[#2A2826] rounded-xl">
            <Check size={14} className="text-sage flex-shrink-0" />
            <div className="text-sm text-[#D4CFC7]">{t}</div>
          </div>
        ))}
      </div>

      <button onClick={onConnect} className="w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition mt-6">
        <Calendar size={16} /> Connect Google Calendar
      </button>
      <button onClick={onSkip} className="text-xs text-[#8B7355] font-semibold mt-3 py-2 hover:text-bone transition">
        Maybe later
      </button>
    </div>
  );
}
