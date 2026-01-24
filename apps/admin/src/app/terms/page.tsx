import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';

export const metadata: Metadata = {
  title: 'Terms of Service | Lovendo',
  description: 'Lovendo Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Link href="/">
          <CanvaButton variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </CanvaButton>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: December 25, 2025
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to our proof-based social experience platform
              moments. These Terms of Service (&quot;Terms&quot;) govern your
              use of our services, connecting travelers and supporters through
              escrow-protected, verified gestures. By accessing or using our
              platform, you agree to be bound by these Terms in full. If you
              disagree with any part of these terms, you must not use our
              services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. User Responsibilities
            </h2>
            <p className="text-muted-foreground">
              You must be at least 18 years of age to create an account and use
              our services. You are solely responsible for any activity that
              occurs through your account and you agree not to sell, transfer,
              license, or assign your account or any account rights. You are
              also responsible for maintaining the confidentiality of your
              password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. Gifting & Escrow Rules
            </h2>
            <p className="text-muted-foreground">
              All gifts contributed by supporters are held in a secure escrow
              account. Funds are released to the traveler only after they have
              provided valid proof of completing the specified moment.
              Our platform acts as a neutral third party to ensure the integrity
              of each transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              4. Proof Requirements
            </h2>
            <p className="text-muted-foreground">
              Valid proof may include, but is not limited to, geotagged photos,
              videos, or other verifiable documentation as specified in the gift
              request. All submitted proof is subject to review by our team. The
              determination of whether proof is sufficient is at our sole
              discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              5. Wallet & Payments
            </h2>
            <p className="text-muted-foreground">
              Our platform includes an in-app wallet for managing funds. All
              transactions are subject to processing fees, which will be clearly
              disclosed before you confirm any payment. Withdrawals from your
              wallet are subject to our payment provider&apos;s terms and may
              take several business days to process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              6. Account Suspension & Termination
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account at any
              time, without notice, for conduct that we believe violates these
              Terms, is harmful to other users, or is otherwise in breach of
              applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              7. Dispute Resolution
            </h2>
            <p className="text-muted-foreground">
              In the event of a dispute between a traveler and a supporter, our
              team will act as a mediator. We will review all provided evidence
              and make a final, binding decision regarding the release or refund
              of escrowed funds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Contact Information
            </h2>
            <p className="text-muted-foreground">
              For any questions or legal inquiries regarding these Terms of
              Service, please contact us at{' '}
              <a
                href="mailto:legal@lovendo.xyz"
                className="text-primary hover:underline"
              >
                legal@lovendo.xyz
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
