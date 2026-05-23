"use client";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function ThemeToggleRow({ initial }: { initial: "dark" | "light" }) {
  const [theme, setTheme] = useState<"dark" | "light">(initial);
  const [saving, setSaving] = useState(false);

  async function pick(next: "dark" | "light") {
    if (theme === next) return;
    setTheme(next);
    setSaving(true);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = next;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("hangouts-theme", next);
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("users").update({ theme_preference: next }).eq("id", user.id);
    }
    setSaving(false);
  }

  return (
    <div className="bg-[#1A1A18] border border-[#2A2826] rounded-2xl p-1.5 grid grid-cols-2 gap-1">
      <button
        onClick={() => pick("dark")}
        className="py-3 rounded-xl flex items-center justify-center gap-2 transition"
        style={{ background: theme === "dark" ? "#0F0E0C" : "transparent", border: theme === "dark" ? "1px solid #2A2826" : "1px solid transparent" }}
      >
        <Moon size={14} className={theme === "dark" ? "text-terracotta" : "text-[#8B7355]"} />
        <span className="text-sm font-bold" style={{ color: theme === "dark" ? "#FAF8F5" : "#8B7355" }}>Dark</span>
      </button>
      <button
        onClick={() => pick("light")}
        className="py-3 rounded-xl flex items-center justify-center gap-2 transition"
        style={{ background: theme === "light" ? "#0F0E0C" : "transparent", border: theme === "light" ? "1px solid #2A2826" : "1px solid transparent" }}
      >
        <Sun size={14} className={theme === "light" ? "text-sun" : "text-[#8B7355]"} />
        <span className="text-sm font-bold" style={{ color: theme === "light" ? "#FAF8F5" : "#8B7355" }}>Light</span>
      </button>
    </div>
  );
}
