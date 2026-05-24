"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggleRow() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-card border border-line rounded-2xl p-1.5 grid grid-cols-2 gap-1">
      {([
        { value: "dark", label: "Dark", icon: Moon, accent: "text-terracotta" },
        { value: "light", label: "Light", icon: Sun, accent: "text-sun" },
      ] as const).map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition border ${
              active
                ? "bg-page border-line"
                : "bg-transparent border-transparent hover:bg-card-soft"
            }`}
          >
            <opt.icon size={14} className={active ? opt.accent : "text-fg-muted"} />
            <span className={`text-sm font-bold ${active ? "text-fg" : "text-fg-muted"}`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
