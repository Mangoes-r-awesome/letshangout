// Shared design tokens. Use these instead of hard-coding hex codes in components.

export const tokens = {
  dark: {
    bg: "#0F0E0C",
    bgElevated: "#1A1A18",
    bgInset: "rgba(15,14,12,0.5)",
    border: "#2A2826",
    borderSoft: "#1F1D1B",
    text: "#FAF8F5",
    textMuted: "#8B7355",
    textDim: "#D4CFC7",
    textFaint: "#3A3835",
    accent: "#E8593C",
    warm: "#F2A623",
    sage: "#7BA77B",
    sand: "#C4B99A",
    headerBg: "rgba(15, 14, 12, 0.92)",
  },
  light: {
    bg: "#FAF8F5",
    bgElevated: "#FFFFFF",
    bgInset: "#F5F1EA",
    border: "#E5DFD3",
    borderSoft: "#EFE9DD",
    text: "#1A1A18",
    textMuted: "#7A6A4F",
    textDim: "#4A4338",
    textFaint: "#C4B99A",
    accent: "#D14A2F",
    warm: "#D89312",
    sage: "#5C8A5C",
    sand: "#A89970",
    headerBg: "rgba(250, 248, 245, 0.92)",
  },
};

export type Theme = keyof typeof tokens;
export type Tokens = typeof tokens.dark;

export function useTokens(theme: Theme): Tokens {
  return tokens[theme];
}
