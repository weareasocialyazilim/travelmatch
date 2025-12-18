export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: December 18, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            TravelMatch (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when
            you use our mobile application.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Information We Collect
          </h2>
          <h3 className="text-xl font-medium mb-2">Personal Information</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Name and email address</li>
            <li>Profile photo</li>
            <li>Location data (with your permission)</li>
            <li>Payment information (processed securely via Stripe)</li>
          </ul>
          <h3 className="text-xl font-medium mb-2">Usage Data</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>App usage statistics</li>
            <li>Device information</li>
            <li>Log data and analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To verify travel moments and locations</li>
            <li>To process payments and transactions</li>
            <li>To communicate with you about updates and promotions</li>
            <li>To improve our app and user experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
          <p className="text-gray-700 leading-relaxed">
            We do not sell your personal information. We may share your data
            with:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
            <li>Service providers who assist in our operations</li>
            <li>Law enforcement when required by law</li>
            <li>Other users (only information you choose to make public)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement industry-standard security measures to protect your
            data, including encryption, secure servers, and regular security
            audits.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Your Rights (GDPR/KVKK)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            7. Children&apos;s Privacy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our service is not intended for users under 18 years of age. We do
            not knowingly collect information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have questions about this Privacy Policy, please contact us
            at:
          </p>
          <p className="text-gray-700 mt-2">
            <strong>Email:</strong> privacy@travelmatch.app
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            9. Changes to This Policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &quot;Last updated&quot; date.
          </p>
        </section>
      </div>
    </main>
  );
}
