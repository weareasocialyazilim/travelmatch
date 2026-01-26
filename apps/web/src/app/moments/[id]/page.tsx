import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Moment Page - Web fallback for shared moment links
 *
 * URL: https://www.lovendo.xyz/moments/{id}
 *
 * This page serves as a web fallback when users share moment links.
 * On mobile devices with the app installed, users will be redirected
 * via the app's intent filters (lovendo://moments/{id}).
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Moment | Lovendo',
    description: 'View this moment on Lovendo',
    alternates: {
      canonical: `https://www.lovendo.xyz/moments/${id}`,
    },
  };
}

export default async function MomentPage({ params }: PageProps) {
  const { id } = await params;

  // In production, fetch moment data from Supabase
  // const moment = await getMoment(id);

  // For now, show a landing page that prompts app download
  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2D2D2D]">Lovendo</h1>
          <p className="text-[#666] mt-2">Real moments, real connections</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="w-16 h-16 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-[#2D2D2D] mb-2">
            Moment #{id.slice(0, 8)}
          </h2>

          <p className="text-[#666] mb-6">
            This moment is waiting for you. Download the Lovendo app to view and connect.
          </p>

          {/* App Store badges */}
          <div className="flex justify-center gap-4 mb-6">
            <Link
              href="https://apps.apple.com/app/lovendo"
              className="inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                className="h-10"
              />
            </Link>
            <Link
              href="https://play.google.com/store/apps/details?id=com.lovendo.app"
              className="inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                className="h-10"
              />
            </Link>
          </div>

          {/* Deep link info */}
          <p className="text-xs text-[#999]">
            Have the app?{' '}
            <a
              href={`lovendo://moments/${id}`}
              className="text-[#F59E0B] hover:underline"
            >
              Open in Lovendo
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-sm text-[#999]">
          By using Lovendo, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
