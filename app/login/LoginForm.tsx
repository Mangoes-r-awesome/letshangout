"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Phone, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "phone" | "email";
type PhoneStep = "enter" | "code";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/me";

  const [mode, setMode] = useState<Mode>("phone");

  const [phone, setPhone] = useState("+61");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter");
  const [code, setCode] = useState("");

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function sendPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.replace(/\s+/g, ""),
      });
      if (error) setError(error.message);
      else setPhoneStep("code");
    });
  }

  async function verifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    startTransition(async () => {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.replace(/\s+/g, ""),
        token: code.trim(),
        type: "sms",
      });
      if (error) {
        setError(error.message);
      } else {
        router.push(next);
        router.refresh();
      }
    });
  }

  async function sendEmailLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) setError(error.message);
      else setEmailSent(true);
    });
  }

  const inputCls =
    "w-full px-4 py-3.5 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone placeholder:text-[#8B7355] focus:outline-none focus:border-terracotta transition";
  const btnCls =
    "w-full px-6 py-3.5 bg-terracotta text-ink rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-terracotta/90 transition disabled:opacity-50";

  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col">
      <nav className="px-5 py-4 border-b border-[#1F1D1B]">
        <a href="/" className="flex items-center gap-2.5 w-fit">
          <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center">
            <span className="text-ink font-bold text-sm">H</span>
          </div>
          <div className="display text-lg font-bold">Hangouts</div>
        </a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <h1 className="display text-3xl font-bold mb-2 text-center">Welcome in</h1>
          <p className="text-sm text-[#8B7355] mb-8 text-center">
            One tap to your squad.
          </p>

          <div className="flex gap-1 p-1 bg-[#1A1A18] rounded-xl mb-6">
            {(["phone", "email"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  mode === m
                    ? "bg-terracotta text-ink"
                    : "text-[#8B7355] hover:text-bone"
                }`}
              >
                {m === "phone" ? <Phone size={14} /> : <Mail size={14} />}
                {m === "phone" ? "Phone" : "Email"}
              </button>
            ))}
          </div>

          {mode === "phone" && phoneStep === "enter" && (
            <form onSubmit={sendPhoneOtp} className="space-y-3">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+61 4XX XXX XXX"
                className={inputCls}
                autoFocus
              />
              <button type="submit" disabled={pending} className={btnCls}>
                {pending ? "Sending…" : <>Text me a code <ArrowRight size={16} /></>}
              </button>
              <p className="text-xs text-[#8B7355] text-center">
                Standard SMS rates may apply. We'll never share your number.
              </p>
            </form>
          )}

          {mode === "phone" && phoneStep === "code" && (
            <form onSubmit={verifyPhoneOtp} className="space-y-3">
              <div className="text-sm text-[#D4CFC7] text-center mb-2">
                We sent a 6-digit code to <span className="text-bone font-semibold">{phone}</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                maxLength={6}
                className={`${inputCls} text-center text-2xl tracking-[0.5em] font-mono`}
                autoFocus
              />
              <button type="submit" disabled={pending || code.length < 6} className={btnCls}>
                {pending ? "Verifying…" : "Verify & sign in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhoneStep("enter");
                  setCode("");
                  setError("");
                }}
                className="w-full text-xs text-[#8B7355] hover:text-bone transition"
              >
                Use a different number
              </button>
            </form>
          )}

          {mode === "email" && !emailSent && (
            <form onSubmit={sendEmailLink} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputCls}
                autoFocus
              />
              <button type="submit" disabled={pending} className={btnCls}>
                {pending ? "Sending…" : <>Email me a link <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {mode === "email" && emailSent && (
            <div className="p-5 bg-sage/10 border border-sage/30 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                <Check size={16} className="text-sage" />
              </div>
              <div>
                <div className="font-bold text-sage mb-1">Check your email</div>
                <div className="text-sm text-[#D4CFC7]">
                  Tap the link in the email we just sent to {email}.
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-terracotta mt-4 text-center">{error}</p>
          )}
        </div>
      </div>
    </main>
  );
}
