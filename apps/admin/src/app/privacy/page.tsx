import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';

export const metadata: Metadata = {
  title: 'Privacy Policy | Lovendo',
  description: 'Lovendo Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Link href="/">
          <CanvaButton variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </CanvaButton>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: December 25, 2025
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Data We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when
              you create an account, create or share content, and communicate
              with us. This may include your name, email address, phone number,
              and payment information. We also collect device information and
              usage data automatically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Location Use</h2>
            <p className="text-muted-foreground">
              To verify your moments, we require access to your
              device&apos;s location data. This information is used solely for
              the purpose of confirming that you are at the location you claim
              to be, which is essential for the proof-based nature of our
              platform. We do not track your location in the background or share
              this data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. Photos & Proof Data
            </h2>
            <p className="text-muted-foreground">
              When you upload photos or other media as proof of a moment,
              we store this data securely. This content is used to validate your
              experience and is shared with your designated supporters. We do
              not use your photos for any purpose other than the core
              functionality of the app without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              4. Payments & Security
            </h2>
            <p className="text-muted-foreground">
              We use a secure third-party payment processor to handle all
              transactions. Your payment information is encrypted and
              transmitted directly to the processor; we do not store your full
              credit card details on our servers. All funds are held in a secure
              escrow system until the moment is successfully verified.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal data for as long as your account is active
              or as needed to provide you services. We will also retain and use
              your information as necessary to comply with our legal
              obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              6. User Rights (GDPR/KVKK)
            </h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or update your personal
              information at any time through your account settings. You may
              also request a copy of your data or ask for its deletion, subject
              to legal and contractual restrictions. Under GDPR (EU) and KVKK
              (Turkey), you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>Right to access your data</li>
              <li>Right to rectification</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              7. Deleting Your Data
            </h2>
            <p className="text-muted-foreground">
              You can request the deletion of your account and associated
              personal data by contacting our support team or through the app
              settings. Upon receiving a request, we will delete your
              information from our active databases, although some data may be
              retained in our backups for a limited period before being
              permanently erased.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions or concerns about this Privacy Policy,
              please contact us at{' '}
              <a
                href="mailto:privacy@lovendo.xyz"
                className="text-primary hover:underline"
              >
                privacy@lovendo.xyz
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
