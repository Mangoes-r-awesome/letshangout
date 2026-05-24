"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft, Phone, Mail, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
    "w-full px-4 py-4 bg-card border border-line rounded-2xl text-fg text-lg placeholder:text-fg-faint focus:outline-none focus:border-terracotta transition";
  const btnCls =
    "w-full px-6 py-4 bg-terracotta text-ink rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50";

  return (
    <main className="min-h-screen bg-page text-fg flex flex-col relative overflow-hidden">
      {/* Atmosphere: oversized italic watermark, off-screen edge */}
      <div
        aria-hidden
        className="absolute pointer-events-none select-none display italic font-bold text-terracotta/[0.04] leading-none whitespace-nowrap"
        style={{ fontSize: "min(46vw, 360px)", top: "20%", left: "-8%", transform: "rotate(-6deg)" }}
      >
        hangouts.
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-10 sm:py-14">
        <div className="w-full max-w-sm">
          {/* Brand mark */}
          <div className="flex items-center gap-2.5 mb-12 sm:mb-14">
            <div className="w-9 h-9 bg-terracotta rounded-lg flex items-center justify-center shadow-[0_4px_14px_-2px_rgba(232,89,60,0.5)]">
              <span className="text-ink font-bold">H</span>
            </div>
            <div className="display text-xl font-bold">Hangouts</div>
          </div>

          {/* Editorial header — adapts per step */}
          <header className="mb-8">
            <div className="display italic text-[15px] text-terracotta tracking-wide mb-3 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terracotta/60" />
              {phoneStep === "code"
                ? "Almost in"
                : emailSent
                ? "Sent"
                : "Welcome in"}
            </div>
            <h1 className="display text-[40px] sm:text-[44px] font-bold leading-[1.02] tracking-tight">
              {phoneStep === "code" ? (
                <>Check your <span className="italic text-terracotta">texts.</span></>
              ) : emailSent ? (
                <>Check your <span className="italic text-terracotta">inbox.</span></>
              ) : (
                <>Plans that <span className="italic text-terracotta">actually</span> happen.</>
              )}
            </h1>
            {phoneStep === "phone" && !emailSent && (
              <p className="text-sm text-fg-muted mt-3 leading-relaxed">
                Sign in to your squad. No password.
              </p>
            )}
          </header>

          {/* Method tabs — hidden during code entry / after email sent */}
          {phoneStep === "phone" && !emailSent && (
            <div className="flex gap-1 p-1 bg-card border border-line rounded-2xl mb-5">
              {(["phone", "email"] as Method[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMethod(m);
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                    method === m
                      ? "bg-terracotta text-ink shadow-[0_2px_8px_-2px_rgba(232,89,60,0.5)]"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {m === "phone" ? <Phone size={13} strokeWidth={2.5} /> : <Mail size={13} strokeWidth={2.5} />}
                  {m === "phone" ? "Phone" : "Email"}
                </button>
              ))}
            </div>
          )}

          {method === "phone" && phoneStep === "phone" && (
            <form onSubmit={sendOtp} className="space-y-3">
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
              <button type="submit" disabled={loading || !phone} className={btnCls}>
                {loading ? "Sending…" : <>Send code <ArrowRight size={16} /></>}
              </button>
              <p className="text-[11px] text-fg-muted text-center pt-2 leading-relaxed">
                By continuing, you agree to be pestered until you reply. That's the whole point.
              </p>
            </form>
          )}

          {method === "phone" && phoneStep === "code" && (
            <form onSubmit={verifyOtp} className="space-y-3">
              <p className="text-sm text-fg-muted leading-relaxed -mt-2 mb-1">
                We sent a 6-digit code to <span className="text-fg font-semibold">{normalisedPhone}</span>
              </p>
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
                className={`${inputCls} text-2xl text-center tracking-[0.5em] font-mono`}
              />
              {error && <p className="text-xs text-terracotta">{error}</p>}
              <button type="submit" disabled={loading || code.length !== 6} className={btnCls}>
                {loading ? "Verifying…" : <>Verify <ArrowRight size={16} /></>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhoneStep("phone");
                  setCode("");
                  setError("");
                }}
                className="w-full text-xs text-fg-muted hover:text-fg transition flex items-center justify-center gap-1 pt-2"
              >
                <ArrowLeft size={12} /> Use a different number
              </button>
            </form>
          )}

          {method === "email" && !emailSent && (
            <form onSubmit={sendMagicLink} className="space-y-3">
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
                {loading ? "Sending…" : <>Email me a link <ArrowRight size={16} /></>}
              </button>
              <p className="text-[11px] text-fg-muted text-center pt-2 leading-relaxed">
                No password. Link expires in an hour.
              </p>
            </form>
          )}

          {method === "email" && emailSent && (
            <div className="space-y-4">
              <div className="relative p-5 bg-card border border-sage/40 rounded-2xl flex items-start gap-3 overflow-hidden">
                <span className="absolute top-0 left-0 bottom-0 w-1 bg-sage" />
                <div className="w-9 h-9 rounded-full bg-sage/15 flex items-center justify-center shrink-0">
                  <Check size={16} className="text-sage" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="display italic text-sm text-sage tracking-wide mb-1">On its way</div>
                  <div className="text-sm text-fg leading-relaxed">
                    Tap the link we sent to <span className="font-semibold">{email}</span> from the same device.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setError("");
                }}
                className="w-full text-xs text-fg-muted hover:text-fg transition flex items-center justify-center gap-1"
              >
                <ArrowLeft size={12} /> Use a different email
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer: tiny editorial line */}
      <footer className="relative px-6 pb-6 sm:pb-8 text-center">
        <p className="display italic text-xs text-fg-muted">
          built in Australia · 1% of revenue to <span className="text-terracotta not-italic font-semibold">R U OK?</span>
        </p>
      </footer>
    </main>
  );
}
