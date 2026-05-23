import type { Metadata, Viewport } from "next";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
