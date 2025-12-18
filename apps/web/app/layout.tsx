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
  title: "TravelMatch - Find Your Perfect Travel Companion",
  description:
    "Connect with solo travelers and explore the world together. Find your ideal travel buddy, share moments, and create unforgettable memories with verified travelers worldwide.",
  keywords: [
    "travel companion",
    "solo travel",
    "travel buddy",
    "travel matching",
    "travel app",
    "find travel partner",
  ],
  authors: [{ name: "TravelMatch Team" }],
  creator: "TravelMatch",
  publisher: "TravelMatch",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://travelmatch.app",
    siteName: "TravelMatch",
    title: "TravelMatch - Find Your Perfect Travel Companion",
    description:
      "Connect with solo travelers and explore the world together. Share moments and create unforgettable memories.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TravelMatch - Travel Together",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelMatch - Find Your Perfect Travel Companion",
    description: "Connect with solo travelers and explore the world together.",
    images: ["/twitter-image.png"],
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
  alternates: {
    canonical: "https://travelmatch.app",
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
