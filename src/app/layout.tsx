import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/navbar";
import { Suspense } from "react";
import Script from "next/script";
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
        {/* JSON-LD: WebSite + Organization + SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Masters Madness",
                "url": "https://mastersmadness.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://mastersmadness.com/join?search={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Masters Madness",
                "url": "https://mastersmadness.com",
                "logo": "https://mastersmadness.com/thumbnail.png",
                "sameAs": [],
                "description": "Masters Madness is a free fantasy golf pool platform for the Masters Tournament at Augusta National. Pick 9 golfers across 9 tiers, track live leaderboard scores, and compete with friends."
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Masters Madness",
                "applicationCategory": "SportsApplication",
                "operatingSystem": "Web",
                "url": "https://mastersmadness.com",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "description": "Free during 2026 beta"
                },
                "description": "Free fantasy golf pool app for the 2026 Masters Tournament. Pick 9 golfers across 9 tiers, run private pools, track live leaderboard scores April 9–12 at Augusta National.",
                "screenshot": "https://mastersmadness.com/thumbnail.png",
                "featureList": [
                  "Live Masters Tournament leaderboard",
                  "9-tier golfer draft system",
                  "Private pool creation and sharing",
                  "Custom payout structures",
                  "Real-time scoring updates",
                  "Built-in golfer research and odds"
                ]
              }
            ])
          }}
        />
      </head>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-QY51QMW3YH"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-QY51QMW3YH');
        `}
      </Script>
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
