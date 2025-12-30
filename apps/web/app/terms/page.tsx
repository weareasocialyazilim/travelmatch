export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: December 18, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using TravelMatch, you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not
            use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Description of Service
          </h2>
          <p className="text-gray-700 leading-relaxed">
            TravelMatch is a social platform that connects travelers through
            shared experiences and &quot;moments&quot;. Users can share travel
            experiences, verify their locations, and send/receive gifts as
            tokens of appreciation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>You must be at least 18 years old to create an account</li>
            <li>
              You are responsible for maintaining the security of your account
            </li>
            <li>You must provide accurate and complete information</li>
            <li>One person may only maintain one account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            You retain ownership of content you post. By posting content, you
            grant us a non-exclusive license to use, display, and distribute
            your content on our platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            You agree not to post content that is:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
            <li>Illegal or promotes illegal activities</li>
            <li>Harmful, threatening, or harassing</li>
            <li>Infringing on intellectual property rights</li>
            <li>False, misleading, or fraudulent</li>
            <li>Sexually explicit or pornographic</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Payments and Gifts</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>All payments are processed securely through PayTR</li>
            <li>Gifts are voluntary and non-refundable once sent</li>
            <li>We charge a platform fee on transactions</li>
            <li>Withdrawals are subject to identity verification</li>
            <li>We reserve the right to hold funds for fraud prevention</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Prohibited Activities
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Attempting to manipulate location verification</li>
            <li>Creating fake accounts or impersonating others</li>
            <li>Using automated systems to access the service</li>
            <li>Attempting to reverse engineer the app</li>
            <li>Engaging in any form of fraud or money laundering</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to suspend or terminate your account at any
            time for violations of these terms or for any other reason at our
            sole discretion. You may delete your account at any time through the
            app settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            8. Disclaimer of Warranties
          </h2>
          <p className="text-gray-700 leading-relaxed">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY
            KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED OR
            ERROR-FREE.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            9. Limitation of Liability
          </h2>
          <p className="text-gray-700 leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRAVELMATCH SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These terms shall be governed by the laws of Turkey. Any disputes
            shall be resolved in the courts of Istanbul, Turkey.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            For questions about these Terms of Service, contact us at:
          </p>
          <p className="text-gray-700 mt-2">
            <strong>Email:</strong> legal@travelmatch.app
          </p>
        </section>
      </div>
    </main>
  );
}
