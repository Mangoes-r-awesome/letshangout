"use client";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import Dropdown from "@/components/Dropdown";

const VENDOR_TYPES = [
  { value: "restaurant", label: "Restaurant / bar", emoji: "🍷" },
  { value: "experience", label: "Experience / activity", emoji: "🎯" },
  { value: "venue", label: "Venue", emoji: "🏛️" },
  { value: "other", label: "Other", emoji: "✨" },
];

export default function DealsTeaser() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [vendorType, setVendorType] = useState("restaurant");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/partnerships/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, business_name: businessName, vendor_type: vendorType }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="p-5 bg-sage/10 border border-sage/30 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
          <Check size={14} className="text-sage" />
        </div>
        <div>
          <div className="text-sm font-bold text-sage mb-1">Thanks!</div>
          <div className="text-xs text-[#D4CFC7] leading-relaxed">We'll be in touch about partnership options soon.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="relative p-5 border border-[#2A2826] rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(242,166,35,0.08) 0%, rgba(232,89,60,0.05) 100%)" }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl">🎟️</div>
          <div className="flex-1">
            <div className="display text-base font-bold mb-1">Deals coming soon</div>
            <div className="text-xs text-[#8B7355] leading-relaxed">
              We're partnering with EatClub, RedBalloon and local venues to surface last-minute deals to your squad.
            </div>
          </div>
        </div>

        {!open ? (
          <button onClick={() => setOpen(true)} className="text-xs font-bold text-sun hover:text-bone transition flex items-center gap-1">
            Run a venue or experience? Partner with us → 
          </button>
        ) : (
          <form onSubmit={submit} className="space-y-2 mt-4">
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business name"
              className="w-full px-3 py-2.5 bg-[#1A1A18] border border-[#2A2826] rounded-lg text-bone text-sm placeholder:text-[#3A3835] focus:outline-none focus:border-sun"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full px-3 py-2.5 bg-[#1A1A18] border border-[#2A2826] rounded-lg text-bone text-sm placeholder:text-[#3A3835] focus:outline-none focus:border-sun"
            />
            <Dropdown
              value={vendorType}
              onChange={setVendorType}
              options={VENDOR_TYPES}
              accent="#F2A623"
              size="sm"
            />
            {error && <p className="text-xs text-terracotta">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-xs text-[#8B7355] font-semibold">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-sun text-ink rounded-lg font-bold text-xs disabled:opacity-50">
                {loading ? "Sending..." : <span className="flex items-center justify-center gap-1">Submit <ArrowRight size={11} /></span>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
