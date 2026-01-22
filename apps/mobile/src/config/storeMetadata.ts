/**
 * Store Metadata Configuration
 * Centralized store listing information for App Store and Play Store
 *
 * This file contains all metadata required for store submissions.
 * Update this file when changing store listings to maintain consistency.
 */

export const STORE_METADATA = {
  // App Identity
  appName: 'Lovendo',
  subtitle: 'Support Creators via Moments',
  shortDescription:
    'Use Gifting to support creators. Share moments. Connect via appreciation.',

  // Store IDs
  storeIds: {
    ios: {
      appStoreId: '6740496053',
      bundleId: 'com.lovendo.app',
      teamId: 'ZWCGM5V955',
    },
    android: {
      packageName: 'com.lovendo.app',
    },
  },

  // URLs
  urls: {
    website: 'https://www.lovendo.xyz',
    privacyPolicy: 'https://www.lovendo.xyz/privacy',
    termsOfService: 'https://www.lovendo.xyz/terms',
    support: 'https://www.lovendo.xyz/support',
    marketing: 'https://www.lovendo.xyz',
  },

  // Contact
  contact: {
    supportEmail: 'support@lovendo.xyz',
    privacyEmail: 'privacy@lovendo.xyz',
    legalEmail: 'legal@lovendo.xyz',
  },

  // Categories
  categories: {
    ios: {
      primary: 'Social Networking',
      secondary: 'Lifestyle',
    },
    android: {
      category: 'Social',
      tags: ['Social', 'Lifestyle', 'Creator Economy', 'Gifting'],
    },
  },

  // Age Rating
  ageRating: {
    ios: '12+',
    android: 'Everyone 10+',
    reasons: [
      'User Generated Content (Moderated)',
      'User Interaction (Chat)',
      'Location Sharing (Optional)',
      'Digital Purchases (In-App)',
    ],
  },

  // Keywords (iOS - 100 chars max)
  keywords:
    'moments,appreciation,creator,gifts,vibe,social,support,influencer,lifestyle,connect',

  // Feature List for Marketing
  features: [
    {
      emoji: '✨',
      title: 'Discover Vibes',
      description: 'Browse exclusive moments shared by your favorite creators.',
    },
    {
      emoji: '💝',
      title: 'Send Gifts',
      description: 'Support creators directly with meaningful digital gifts.',
    },
    {
      emoji: '💬',
      title: 'Creator Chat',
      description: 'Connect with creators through secure messaging.',
    },
    {
      emoji: '🔒',
      title: 'Trust & Safety',
      description: 'Verified creators, secure transactions, 24/7 support.',
    },
    {
      emoji: '📍',
      title: 'Explore Nearby',
      description: 'Find inspiring moments happening around you.',
    },
    {
      emoji: '🎁',
      title: 'Wallet System',
      description: 'Add funds, send gifts, withdraw easily.',
    },
  ],

  // Screenshots Requirements
  // Dimensions per Apple App Store requirements (Dec 2025)
  screenshotRequirements: {
    ios: {
      'iPhone 6.7"': { width: 1290, height: 2796, required: true }, // iPhone 15 Pro Max
      'iPhone 6.5"': { width: 1242, height: 2688, required: true }, // iPhone 11 Pro Max
      'iPhone 5.5"': { width: 1242, height: 2208, required: true }, // iPhone 8 Plus
      'iPad Pro 12.9"': { width: 2048, height: 2732, required: false },
    },
    android: {
      phone: {
        minWidth: 320,
        maxWidth: 3840,
        aspectRatio: '16:9 or 9:16',
        min: 2,
        max: 8,
      },
      tablet7: { minWidth: 320, maxWidth: 3840, required: false },
      tablet10: { minWidth: 320, maxWidth: 3840, required: false },
    },
  },

  // Icon Requirements
  iconRequirements: {
    ios: {
      size: 1024,
      format: 'PNG',
      notes: 'No alpha channel, no rounded corners (system applies mask)',
    },
    android: {
      size: 512,
      format: 'PNG',
      notes: '32-bit PNG, no alpha for icon, separate feature graphic 1024x500',
    },
  },

  // Data Privacy Declarations
  dataPrivacy: {
    dataCollected: [
      { type: 'Name', purpose: 'Account, Profile', shared: false },
      { type: 'Email', purpose: 'Account, Communication', shared: false },
      { type: 'Phone', purpose: 'Verification', shared: false, optional: true },
      { type: 'Location', purpose: 'App Functionality', shared: false },
      {
        type: 'Photos',
        purpose: 'User Content',
        shared: true,
        note: 'Within app only',
      },
      {
        type: 'Payment Info',
        purpose: 'Purchases',
        shared: true,
        processor: 'Apple/Google IAP',
      },
      { type: 'Messages', purpose: 'App Functionality', shared: false },
    ],
    securityPractices: [
      'Data encrypted in transit (TLS 1.3)',
      'Data encrypted at rest',
      'Users can request data deletion',
      'Independent security review',
    ],
    thirdPartyServices: [
      { name: 'PayTR', purpose: 'Withdrawal processing' },
      { name: 'Supabase', purpose: 'Database and authentication' },
      { name: 'Mapbox', purpose: 'Maps and location' },
      { name: 'Sentry', purpose: 'Error tracking' },
      { name: 'Expo', purpose: 'App updates' },
    ],
  },

  // Version History Template
  versionHistoryTemplate: (version: string, changes: string[]) =>
    `
Version ${version}
${changes.map((change) => `• ${change}`).join('\n')}
`.trim(),

  // Current Version Release Notes
  currentVersion: {
    version: '1.0.0',
    changes: [
      'Initial release',
      'Discover and share travel moments',
      'Secure gift system with escrow protection',
      'Real-time encrypted messaging',
      'KYC verification for trusted hosts',
      'Apple Pay and card payments',
    ],
  },
} as const;

// Helper to generate full description
export const generateFullDescription = (): string => {
  const { features } = STORE_METADATA;

  return `${STORE_METADATA.appName} connects travelers through unique experiences. Share your travel moments, discover local guides, and create unforgettable memories.

KEY FEATURES:

${features
  .map(
    (f) => `${f.emoji} ${f.title}
${f.description}`,
  )
  .join('\n\n')}

WHY LOVENDO?
We believe the best travel experiences come from real connections. Whether you're a local sharing your favorite spots or a traveler seeking authentic experiences, Lovendo brings people together.

Download now and start your journey!`;
};

// Helper to generate release notes
export const generateReleaseNotes = (): string => {
  const { version, changes } = STORE_METADATA.currentVersion;
  return STORE_METADATA.versionHistoryTemplate(version, [...changes]);
};

export default STORE_METADATA;
