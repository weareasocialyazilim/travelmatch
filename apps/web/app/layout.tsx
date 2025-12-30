import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TravelMatch - Give a moment. See it happen.",
    template: "%s | TravelMatch",
  },
  description:
    "The first platform where you can gift real travel experiences and see verified proof when they happen. Build trust through authentic moments.",
  keywords: [
    "travel gifts",
    "experience gifting",
    "verified travel",
    "trust score",
    "travel matching",
    "hediye deneyim",
  ],
  authors: [{ name: "TravelMatch Inc." }],
  creator: "TravelMatch",
  publisher: "TravelMatch Inc.",
  metadataBase: new URL("https://travelmatch.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "tr_TR",
    url: "https://travelmatch.app",
    siteName: "TravelMatch",
    title: "TravelMatch - Give a moment. See it happen.",
    description:
      "Gift real travel experiences and see verified proof when they happen.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "TravelMatch - Experience Gifting Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelMatch - Give a moment. See it happen.",
    description:
      "Gift real travel experiences and see verified proof when they happen.",
    images: ["/og-image.svg"],
    creator: "@travelmatch",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://travelmatch.app/#organization",
      name: "TravelMatch",
      url: "https://travelmatch.app",
      logo: {
        "@type": "ImageObject",
        url: "https://travelmatch.app/og-image.svg",
        width: 1200,
        height: 630,
      },
      sameAs: [
        "https://instagram.com/travelmatchapp",
        "https://tiktok.com/@travelmatchapp",
        "https://x.com/travelmatchapp",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@travelmatch.app",
        contactType: "customer service",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://travelmatch.app/#website",
      url: "https://travelmatch.app",
      name: "TravelMatch",
      description:
        "The first platform where you can gift real travel experiences and see verified proof when they happen.",
      publisher: {
        "@id": "https://travelmatch.app/#organization",
      },
      inLanguage: ["en-US", "tr-TR"],
    },
    {
      "@type": "MobileApplication",
      "@id": "https://travelmatch.app/#app",
      name: "TravelMatch",
      operatingSystem: ["iOS", "Android"],
      applicationCategory: "TravelApplication",
      description:
        "Gift real travel experiences and see verified proof when they happen. Build trust through authentic moments.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "10000",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
