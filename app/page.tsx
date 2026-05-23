"use client";
import { useState } from "react";
import { ArrowRight, Check, Heart, Flame, Radar, MessageCircle, Calendar, Sparkles } from "lucide-react";
import PhonePreview from "@/components/PhonePreview";

export default function Page() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Try again in a sec");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-bone overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-ink/85 border-b border-[#1F1D1B]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center">
              <span className="text-ink font-bold text-sm">H</span>
            </div>
            <div className="display text-lg font-bold">Hangouts</div>
          </div>
          <a href="#waitlist" className="text-xs sm:text-sm font-semibold text-terracotta hover:text-bone transition">
            Get early access →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-5 pt-12 pb-20 sm:pt-20 sm:pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,89,60,0.15) 0%, transparent 70%)" }} />
          <div className="absolute top-60 -right-20 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(242,166,35,0.1) 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/20 text-xs font-semibold text-terracotta mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta pulse" />
              Australian-built · invite-only beta
            </div>
            <h1 className="display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5">
              Stop planning hangouts.<br />
              <span className="text-terracotta italic">Start having them.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#D4CFC7] leading-relaxed mb-8 max-w-lg">
              An AI agent that pesters your mates until they actually reply. Calendar-synced.
              SMS for the ghosters. Public squad stats so everyone knows who's flaky 👀
            </p>

            {!submitted ? (
              <form onSubmit={submit} id="waitlist" className="space-y-3 max-w-md">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-3.5 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-bone placeholder:text-[#8B7355] focus:outline-none focus:border-terracotta transition"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3.5 bg-terracotta text-ink rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-terracotta/90 transition disabled:opacity-50"
                  >
                    {loading ? "..." : <>Get in <ArrowRight size={16} /></>}
                  </button>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+61 mobile (optional, for SMS launch)"
                  className="w-full px-4 py-3 bg-[#1A1A18] border border-[#2A2826] rounded-xl text-sm text-bone placeholder:text-[#8B7355] focus:outline-none focus:border-terracotta transition"
                />
                {error && <p className="text-xs text-terracotta">{error}</p>}
                <p className="text-xs text-[#8B7355]">No spam. We'll text you when your squad number is live.</p>
              </form>
            ) : (
              <div className="slide-up max-w-md p-5 bg-sage/10 border border-sage/30 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                  <Check size={16} className="text-sage" />
                </div>
                <div>
                  <div className="font-bold text-sage mb-1">You're in 🎉</div>
                  <div className="text-sm text-[#D4CFC7]">We'll text you when your squad's ready. Now go message your cousins.</div>
                </div>
              </div>
            )}
          </div>

          {/* Phone preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="float">
              <PhonePreview />
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="px-5 py-20 border-t border-[#1F1D1B]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs font-semibold text-terracotta tracking-widest uppercase mb-4">The problem</div>
          <h2 className="display text-3xl sm:text-4xl font-bold leading-tight mb-6">
            Your group chat is full of dead plans.
          </h2>
          <p className="text-lg text-[#D4CFC7] leading-relaxed mb-10">
            Someone proposes a date. Three people react with thumbs up. The other four
            never reply. The date passes. Repeat for 8 months until someone says
            "we should really catch up soon."
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { stat: "5 weeks", label: "average time to plan a group trip" },
              { stat: "44%", label: "of plans never happen" },
              { stat: "1 in 4", label: "Australians feel lonely" },
            ].map((s, i) => (
              <div key={i} className="p-5 bg-[#1A1A18] border border-[#2A2826] rounded-2xl">
                <div className="display text-3xl font-bold text-terracotta mb-1">{s.stat}</div>
                <div className="text-xs text-[#8B7355] leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-5 py-20 border-t border-[#1F1D1B] bg-gradient-to-b from-transparent to-[#0A0908]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold text-terracotta tracking-widest uppercase mb-4">What it does</div>
            <h2 className="display text-3xl sm:text-4xl font-bold leading-tight">
              The agent that won't let your friendships die.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: MessageCircle, title: "Adaptive nudging", body: "AI escalates tone based on each person's response history. Sam at 34% reply rate gets spicier copy than Marcus at 89%." },
              { icon: Flame, title: "Public squad stats", body: "Reply rate, pay rate, streaks — visible to the whole group. Nothing fixes flaky friends like a leaderboard." },
              { icon: Calendar, title: "Calendar sync", body: "Connect Google Calendar once. We find when everyone's actually free, propose dates, auto-add when confirmed." },
              { icon: Radar, title: "Open Mode (v3)", body: "Broadcast you're free this arvo. Calendar-detected free time gets matched with friends you haven't seen in a while." },
              { icon: Sparkles, title: "Smart suggestions", body: "Activities tailored to your squad's preferences, budget, and what worked last time. RedBalloon + EatClub deals built in." },
              { icon: MessageCircle, title: "SMS for ghosters", body: "Friends without the app text your squad number. AI parses 'yeah probs', 'nah cbf', 'what time?' all of it." },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-[#1A1A18] border border-[#2A2826] rounded-2xl hover:border-terracotta/40 transition">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-terracotta" />
                </div>
                <h3 className="display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-[#8B7355] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="px-5 py-20 border-t border-[#1F1D1B]">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl border border-[#2A2826]" style={{ background: "linear-gradient(135deg, rgba(232,89,60,0.08) 0%, rgba(242,166,35,0.04) 100%)" }}>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-terracotta/15 flex items-center justify-center flex-shrink-0">
                <Heart size={20} className="text-terracotta" />
              </div>
              <div>
                <div className="text-xs font-semibold text-terracotta tracking-widest uppercase mb-3">Why we built this</div>
                <h2 className="display text-2xl sm:text-3xl font-bold mb-4 leading-tight">
                  Friendships don't die from big fights. They die from small moments we never get back.
                </h2>
                <p className="text-[#D4CFC7] leading-relaxed mb-5">
                  1 in 4 Australians feel lonely. The hardest part of adult friendship isn't
                  finding good mates — it's getting six calendars and six different mental loads
                  to line up before everyone gives up.
                </p>
                <p className="text-[#D4CFC7] leading-relaxed mb-5">
                  Hangouts donates <span className="text-terracotta font-bold">1% of revenue to R U OK?</span> and partners with
                  community orgs because loneliness is a public health problem and we want to
                  be on the right side of it.
                </p>
                <div className="text-sm text-[#8B7355] italic">— Alex, founder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="px-5 py-20 border-t border-[#1F1D1B] text-center">
        <h2 className="display text-3xl sm:text-4xl font-bold mb-4">Ready to actually hang?</h2>
        <p className="text-[#8B7355] mb-8">First 500 signups get a free squad number for life.</p>
        <a href="#waitlist" className="inline-flex items-center gap-2 px-8 py-4 bg-terracotta text-ink rounded-xl font-bold hover:bg-terracotta/90 transition">
          Get early access <ArrowRight size={18} />
        </a>
      </section>

      <footer className="px-5 py-10 border-t border-[#1F1D1B] text-center text-xs text-[#8B7355]">
        <div className="display text-base font-bold text-bone mb-2">Hangouts</div>
        Built in Australia 💛 © 2026
      </footer>
    </main>
  );
}
