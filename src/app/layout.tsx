import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/navbar";
import { Suspense } from "react";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Masters Madness 2026 — Fantasy Golf Pool for Augusta",
  description:
    "Pick 9 golfers across 9 tiers for the 2026 Masters Tournament. Live leaderboard, private pools, custom payouts — free to play. April 9–12 at Augusta National.",
  metadataBase: new URL("https://mastersmadness.com"),
  alternates: {
    canonical: "https://mastersmadness.com",
  },
  openGraph: {
    title: "Masters Madness 2026 — Fantasy Golf Pool for Augusta",
    description:
      "Pick 9 golfers across 9 tiers for the 2026 Masters Tournament. Live leaderboard, private pools, custom payouts — free to play. April 9–12 at Augusta National.",
    type: "website",
    url: "https://mastersmadness.com",
    siteName: "Masters Madness",
    locale: "en_US",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Masters Madness 2026 — Masters Tournament Fantasy Pool · April 9–12, 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masters Madness 2026 — Fantasy Golf Pool for Augusta",
    description:
      "Pick 9 golfers across 9 tiers for the 2026 Masters Tournament. Live leaderboard, private pools, custom payouts — free to play. April 9–12 at Augusta National.",
    site: "@mastersmadness",
    images: ["/thumbnail.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg antialiased">
        <ClerkProvider>
          <Suspense fallback={<div className="h-16 border-b border-border" />}>
            <Navbar />
          </Suspense>
          <main>{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
