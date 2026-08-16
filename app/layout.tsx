import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WAYNE ACOUSTICS · Δ-1939 Batcave Tape Deck",
  description: "A 1939 Gotham shortwave cassette tape deck broadcasting nocturnal rain ambient, Batcave drone, and dark synth ambient.",
};

export const viewport = {
  themeColor: "#0b0c10",
  viewportFit: "cover" as const,
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-charcoal text-slate-100 antialiased selection:bg-crimson selection:text-white font-sans min-h-dvh flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
