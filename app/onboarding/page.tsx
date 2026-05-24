"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import Welcome from "./steps/Welcome";
import Pain from "./steps/Pain";
import Magic from "./steps/Magic";
import Stats from "./steps/Stats";
import Mission from "./steps/Mission";
import Identity from "./steps/Identity";
import Squad from "./steps/Squad";
import CalendarStep from "./steps/Calendar";

const TOTAL_STEPS = 8;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🦁");
  const [birthday, setBirthday] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  async function saveProfile(): Promise<boolean> {
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
      .update({
        name: name.trim(),
        emoji,
        ...(birthday ? { birthday } : {}),
      })
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

  async function handleIdentityNext() {
    const ok = await saveProfile();
    if (ok) next();
  }

  return (
    <main className="min-h-screen bg-page text-fg flex flex-col">
      <div className="sticky top-0 z-50 px-5 pt-12 pb-3 bg-page/90 backdrop-blur-xl flex items-center gap-3">
        {step > 0 && step < 7 && (
          <button onClick={prev} className="text-fg-muted hover:text-fg transition" aria-label="Back">
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-terracotta transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        {step > 0 && step < 5 && (
          <button onClick={() => setStep(5)} className="text-xs font-semibold text-fg-muted hover:text-fg transition">
            Skip
          </button>
        )}
      </div>

      <div
        key={step}
        className="flex-1 flex flex-col px-7 pb-8 overflow-y-auto"
        style={{ animation: "step-in 0.42s cubic-bezier(0.2, 0.7, 0.2, 1) both" }}
      >
        {step === 0 && <Welcome onNext={next} />}
        {step === 1 && <Pain onNext={next} />}
        {step === 2 && <Magic onNext={next} />}
        {step === 3 && <Stats onNext={next} />}
        {step === 4 && <Mission onNext={next} />}
        {step === 5 && (
          <Identity
            name={name}
            setName={setName}
            emoji={emoji}
            setEmoji={setEmoji}
            birthday={birthday}
            setBirthday={setBirthday}
            onNext={handleIdentityNext}
            saving={savingProfile}
            error={error}
          />
        )}
        {step === 6 && <Squad onCreate={() => completeOnboarding("create")} onJoin={() => completeOnboarding("join")} onSkip={next} />}
        {step === 7 && <CalendarStep onConnect={() => completeOnboarding("skip")} onSkip={() => completeOnboarding("skip")} />}
      </div>
    </main>
  );
}
