import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner with TravelMatch',
  description:
    'Join the TravelMatch partner network. Reach engaged travelers and grow your business with our experience gifting platform.',
};

export default function PartnerPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-stone-950">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-rose-50 to-amber-50 dark:from-stone-900 dark:to-stone-950">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-sm font-medium mb-6">
            Partner Program
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-6">
            Grow Your Business with
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-rose-500">
              TravelMatch
            </span>
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-8">
            Join our partner network and connect with thousands of engaged
            travelers looking for authentic local experiences.
          </p>
          <a
            href="mailto:partners@travelmatch.app"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
          >
            Contact Partnership Team
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-white mb-12">
            Why Partner with Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                ),
                title: 'Reach Engaged Travelers',
                desc: 'Connect with travelers actively seeking unique local experiences in your area.',
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                    />
                  </svg>
                ),
                title: 'No Upfront Costs',
                desc: 'Pay only when you receive bookings. No listing fees or monthly subscriptions.',
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
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
                ),
                title: 'Verified Reviews',
                desc: 'Build trust with verified proof photos from actual experiences.',
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="bg-stone-50 dark:bg-stone-900 p-6 rounded-2xl text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center text-white">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-stone-600 dark:text-stone-400">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-16 px-4 bg-stone-50 dark:bg-stone-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-white mb-12">
            Who Can Partner?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Cafes & Restaurants',
              'Tour Operators',
              'Hotels & Accommodations',
              'Experience Providers',
              'Local Guides',
              'Activity Centers',
            ].map((type, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white dark:bg-stone-800 p-4 rounded-xl"
              >
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-lg font-medium text-stone-900 dark:text-white">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
            Contact our partnership team to learn more about joining the
            TravelMatch network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:partners@travelmatch.app"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity"
            >
              Email Us
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white font-semibold rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
