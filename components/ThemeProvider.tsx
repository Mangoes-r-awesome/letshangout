"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize from the data-theme attr the inline boot script already set on <html>.
  // Defaults to "dark" if we're outside the browser (SSR) — boot script will fix on hydrate.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return "dark";
    return (document.documentElement.dataset.theme as Theme) || "dark";
  });

  // Sync state -> DOM whenever theme changes after hydrate.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  function setTheme(next: Theme) {
    setThemeState(next);
    if (typeof window !== "undefined") localStorage.setItem("hangouts-theme", next);
    // Fire-and-forget persist to profile.
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from("users").update({ theme_preference: next }).eq("id", user.id);
    });
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
