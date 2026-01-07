import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Safety Center',
  description:
    "Your safety is our priority. Learn about TravelMatch's safety features, community guidelines, and how we protect our users.",
};

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-stone-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
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
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Safety Center
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400">
            Your safety and security are our top priorities. Learn how we
            protect our community.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">
            Our Safety Commitment
          </h2>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
            At TravelMatch, we&apos;re committed to creating a safe and trusted
            environment for all users. Our platform is built with multiple
            layers of protection to ensure your experiences are secure.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">
            Safety Features
          </h2>
          <div className="space-y-6">
            {[
              {
                title: 'Identity Verification',
                desc: 'All users go through our KYC verification process to confirm their identity.',
                icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
              },
              {
                title: 'Trust Score System',
                desc: 'Our unique Trust Score helps you identify reliable and verified travelers.',
                icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
              },
              {
                title: 'Secure Payments',
                desc: 'All transactions are processed securely through PayTR with escrow protection.',
                icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
              },
              {
                title: 'AI-Powered Verification',
                desc: 'Our AI system verifies proof photos for authenticity and location accuracy.',
                icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
              },
              {
                title: 'End-to-End Encryption',
                desc: 'Your private moments and messages are protected with industry-standard encryption.',
                icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">
            Community Guidelines
          </h2>
          <ul className="space-y-3 text-stone-700 dark:text-stone-300">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Be respectful and authentic in all interactions
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Only share genuine experiences and accurate information
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Report any suspicious or inappropriate behavior
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Protect your personal information and privacy
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Meet in public places for first-time experiences
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">
            Report a Concern
          </h2>
          <p className="text-stone-700 dark:text-stone-300 mb-4">
            If you encounter any safety issues or suspicious activity, please
            contact our safety team immediately:
          </p>
          <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-xl">
            <p className="text-stone-900 dark:text-white font-semibold mb-2">
              Safety Team
            </p>
            <a
              href="mailto:safety@travelmatch.app"
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              safety@travelmatch.app
            </a>
          </div>
        </section>

        <div className="text-center pt-8 border-t border-stone-200 dark:border-stone-800">
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
