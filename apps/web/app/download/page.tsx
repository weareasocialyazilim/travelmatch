import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download TravelMatch",
  description:
    "Download TravelMatch for iOS and Android. Gift real travel experiences and see verified proof when they happen.",
};

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 dark:from-stone-900 dark:to-stone-950 py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
          </div>
          <span className="text-3xl font-bold text-stone-900 dark:text-white">
            TravelMatch
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-stone-900 dark:text-white">
          Coming Soon to
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-rose-500">
            App Store & Google Play
          </span>
        </h1>

        <p className="text-xl text-stone-600 dark:text-stone-400 mb-12 max-w-lg mx-auto">
          We&apos;re putting the finishing touches on our mobile apps. Join the
          waitlist to be notified when we launch!
        </p>

        {/* App Store Buttons (Coming Soon) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <div className="inline-flex items-center gap-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-8 py-4 rounded-2xl font-semibold opacity-75">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-75">Coming Soon</div>
              <div className="text-lg font-bold">App Store</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-8 py-4 rounded-2xl font-semibold opacity-75">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-75">Coming Soon</div>
              <div className="text-lg font-bold">Google Play</div>
            </div>
          </div>
        </div>

        {/* Waitlist Form Placeholder */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
            Get Notified at Launch
          </h3>
          <p className="text-stone-600 dark:text-stone-400 mb-6">
            Be the first to know when TravelMatch is available in your region.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Notify Me
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12">
          <Link
            href="/"
            className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
