import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Hangouts — friendships die from small moments we never get back",
  description: "The agent that actually pesters your friends until you finally hang. Squad stats. Calendar sync. SMS for the ghosters. Built in Australia 💛",
  openGraph: {
    title: "Hangouts",
    description: "The agent that pesters your friends until you finally hang.",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hangouts",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0E0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Inline script: set data-theme on <html> before React hydrates so there's no
// flash of dark-then-light (or vice versa) on first paint.
const themeBootstrap = `
try {
  var t = localStorage.getItem('hangouts-theme');
  if (t !== 'light' && t !== 'dark') t = 'dark';
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t;
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
