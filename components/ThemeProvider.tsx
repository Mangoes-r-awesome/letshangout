"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase-browser";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children, initialTheme = "dark" }: { children: ReactNode; initialTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // Hydrate from localStorage on mount (only if no server-side preference passed)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("hangouts-theme") as Theme | null;
    if (stored && stored !== theme) setTheme(stored);
  }, []);

  // Apply to html element for global CSS hooks
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  async function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") localStorage.setItem("hangouts-theme", next);

    // Persist to profile if logged in. Fire-and-forget.
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      supabase.from("users").update({ theme_preference: next }).eq("id", user.id);
    }
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
