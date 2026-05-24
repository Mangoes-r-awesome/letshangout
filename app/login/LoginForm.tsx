"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft, Phone, Mail, Check } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

type Method = "phone" | "email";
type PhoneStep = "phone" | "code";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";

  const [method, setMethod] = useState<Method>("phone");

  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone");
  const [phone, setPhone] = useState("");
  const [normalisedPhone, setNormalisedPhone] = useState("");
  const [code, setCode] = useState("");

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (phoneStep === "code") codeRef.current?.focus();
  }, [phoneStep]);

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
      setPhoneStep("code");
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

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authErr } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (authErr) throw new Error(authErr.message);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full px-4 py-4 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone text-lg placeholder:text-[#3A3835] focus:outline-none focus:border-terracotta transition";
  const btnCls =
    "w-full px-6 py-4 bg-terracotta text-ink rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-terracotta/90 transition disabled:opacity-50";

  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-9 h-9 bg-terracotta rounded-lg flex items-center justify-center">
            <span className="text-ink font-bold">H</span>
          </div>
          <div className="display text-xl font-bold">Hangouts</div>
        </div>

        {/* Method tabs hidden when in the middle of phone code entry or after email send */}
        {phoneStep === "phone" && !emailSent && (
          <div className="flex gap-1 p-1 bg-[#1A1A18] rounded-xl mb-6">
            {(["phone", "email"] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMethod(m);
                  setError("");
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  method === m ? "bg-terracotta text-ink" : "text-[#8B7355] hover:text-bone"
                }`}
              >
                {m === "phone" ? <Phone size={14} /> : <Mail size={14} />}
                {m === "phone" ? "Phone" : "Email"}
              </button>
            ))}
          </div>
        )}

        {method === "phone" && phoneStep === "phone" && (
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
              className={inputCls}
            />
            {error && <p className="text-xs text-terracotta">{error}</p>}
            <button
              type="submit"
              disabled={loading || !phone}
              className={btnCls}
            >
              {loading ? "Sending..." : <>Send code <ArrowRight size={16} /></>}
            </button>
            <p className="text-xs text-[#8B7355] text-center pt-2">
              By continuing, you agree to be pestered until you reply. That's the whole point.
            </p>
          </form>
        )}

        {method === "phone" && phoneStep === "code" && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setPhoneStep("phone");
                setCode("");
                setError("");
              }}
              className="flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone mb-2"
            >
              <ArrowLeft size={12} /> Back
            </button>
            <div>
              <h1 className="display text-3xl font-bold mb-2 leading-tight">Check your texts</h1>
              <p className="text-sm text-[#8B7355]">
                We sent a 6-digit code to <span className="text-bone">{normalisedPhone}</span>
              </p>
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
              className={`${inputCls} text-2xl text-center tracking-[0.5em]`}
            />
            {error && <p className="text-xs text-terracotta">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className={btnCls}
            >
              {loading ? "Verifying..." : <>Verify <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {method === "email" && !emailSent && (
          <form onSubmit={sendMagicLink} className="space-y-4">
            <div>
              <h1 className="display text-3xl font-bold mb-2 leading-tight">What's your email?</h1>
              <p className="text-sm text-[#8B7355]">We'll send a link. Tap it to sign in.</p>
            </div>
            <input
              type="email"
              autoFocus
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={inputCls}
            />
            {error && <p className="text-xs text-terracotta">{error}</p>}
            <button type="submit" disabled={loading || !email} className={btnCls}>
              {loading ? "Sending..." : <>Email me a link <ArrowRight size={16} /></>}
            </button>
            <p className="text-xs text-[#8B7355] text-center pt-2">
              No password. Link expires in an hour.
            </p>
          </form>
        )}

        {method === "email" && emailSent && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setEmailSent(false);
                setError("");
              }}
              className="flex items-center gap-1 text-xs text-[#8B7355] hover:text-bone mb-2"
            >
              <ArrowLeft size={12} /> Use a different email
            </button>
            <div className="p-5 bg-sage/10 border border-sage/30 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                <Check size={16} className="text-sage" />
              </div>
              <div>
                <div className="font-bold text-sage mb-1">Check your inbox</div>
                <div className="text-sm text-[#D4CFC7]">
                  We sent a link to <span className="text-bone font-semibold">{email}</span>. Tap it to come back signed in.
                </div>
              </div>
            </div>
            <p className="text-xs text-[#8B7355] text-center pt-2">
              Didn't arrive? Check spam, or try phone instead.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
