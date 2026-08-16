import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOTHAM BROADCAST // 1942 Late Night Noir Transmission",
  description: "A forgotten late-night music transmission from a cave high above Gotham City. Retro noir lo-fi, dark jazz, and nocturnal atmospheric broadcasts.",
  keywords: ["gotham", "noir", "retro music", "batman atmosphere", "1940s radio", "dark jazz"],
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
      <body className="bg-charcoal text-slate-100 antialiased selection:bg-crimson selection:text-white font-sans min-h-dvh flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
