"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [normalisedPhone, setNormalisedPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't send code");
      setNormalisedPhone(data.phone);
      setStep("code");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalisedPhone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Wrong code");
      router.push(data.needsOnboarding ? "/onboarding" : next);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-12 justify-center">
          <div className="w-9 h-9 bg-terracotta rounded-lg flex items-center justify-center">
            <span className="text-ink font-bold">H</span>
          </div>
          <div className="display text-xl font-bold">Hangouts</div>
        </div>

        {step === "phone" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <h1 className="display text-3xl font-bold mb-2 leading-tight">What's your number?</h1>
              <p className="text-sm text-[#8B7355]">We'll text you a code. No password.</p>
            </div>
            <input
              type="tel"
              autoFocus
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0412 345 678"
              className="w-full px-4 py-4 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone text-lg placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta transition"
            />
            {error && <p className="text-xs text-terracotta">{error}</p>}
            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full px-6 py-4 bg-terracotta text-ink rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-terracotta/90 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : <>Send code <ArrowRight size={16} /></>}
            </button>
            <p className="text-xs text-[#8B7355] text-center pt-2">
              By continuing, you agree to be pestered until you reply. That's the whole point.
            </p>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <button
              type="button"
              onClick={() => { setStep("phone"); setCode(""); setError(""); }}
              className="flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone mb-2"
            >
              <ArrowLeft size={12} /> Back
            </button>
            <div>
              <h1 className="display text-3xl font-bold mb-2 leading-tight">Check your texts</h1>
              <p className="text-sm text-[#8B7355]">We sent a 6-digit code to <span className="text-bone">{normalisedPhone}</span></p>
            </div>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full px-4 py-4 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone text-2xl text-center tracking-[0.5em] placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta transition"
            />
            {error && <p className="text-xs text-terracotta">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full px-6 py-4 bg-terracotta text-ink rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-terracotta/90 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : <>Verify <ArrowRight size={16} /></>}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
