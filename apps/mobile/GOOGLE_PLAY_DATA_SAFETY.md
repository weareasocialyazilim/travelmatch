/**
 * Google Play Data Safety Declaration
 *
 * This document provides the information needed to complete the
 * Google Play Console Data Safety section for Lovendo app.
 *
 * REFERENCE: https://support.google.com/googleplay/android-developer/answer/10787469
 *
 * ## CRITICAL: This must be completed before Play Store release
 *
 * Generated: 2026-01-26
 * Last Updated: 2026-01-26
 */

// =============================================================================
// SECTION 1: DATA COLLECTION DECLARATION
// =============================================================================

export const DATA_COLLECTION_DECLARATION = {
  // Does the app collect or share any of the required user data types?
  // Answer: YES - The app collects user data
  collectsData: true,

  // Is all of the user data collected encrypted in transit?
  // All API calls use HTTPS/TLS 1.2+ via Supabase
  encryptedInTransit: true,

  // Do you offer a way for users to request deletion of their data?
  // Implemented via account deletion flow in settings
  offersDeletion: true,

  // Is this declared for children?
  // NO - App is for ages 18+ (dating app)
  forChildren: false,
};

// =============================================================================
// SECTION 2: DATA TYPES COLLECTED
// =============================================================================

export const DATA_TYPES_COLLECTED = {
  /**
   * Location - APPROXIMATE
   * Collected for: Discovering nearby content
   * Shared with third parties: NO
   * Encryption: At rest in Supabase
   * Retention: Until account deletion
   */
  location: {
    collected: true,
    type: 'Approximate (city-level)',
    purpose: 'App functionality - discover nearby moments',
    required: false,
    shared: false,
    encrypted: true,
    canDelete: true,
  },

  /**
   * Location - PRECISE
   * Collected for: Location-based matching and features
   * Shared with third parties: NO
   * Encryption: At rest in Supabase
   * Retention: Until account deletion
   */
  preciseLocation: {
    collected: true,
    type: 'Precise (GPS)',
    purpose: 'App functionality - location features',
    required: false,
    shared: false,
    encrypted: true,
    canDelete: true,
  },

  /**
   * Personal Info - NAME
   * Collected for: User identification
   * Shared with third parties: NO
   * Encryption: At rest in Supabase
   * Retention: Until account deletion
   */
  personalInfo: {
    collected: true,
    types: ['Display name', 'Email address', 'Phone number'],
    purpose: 'Account creation and communication',
    required: true,
    shared: false,
    encrypted: true,
    canDelete: true,
  },

  /**
   * User Content - PHOTOS AND VIDEOS
   * Collected for: User profiles and moments sharing
   * Shared with third parties: NO
   * Encryption: At rest (Supabase Storage)
   * Retention: Until user deletes or account deleted
   */
  userContent: {
    collected: true,
    types: ['Profile photos', 'Moment photos', 'Moment videos'],
    purpose: 'App functionality - sharing moments',
    required: false,
    shared: false,
    encrypted: false, // Storage encryption is at rest
    canDelete: true,
  },

  /**
   * User Content - MESSAGES
   * Collected for: In-app messaging between users
   * Shared with third parties: NO
   * Encryption: End-to-end encrypted where applicable
   * Retention: Until either party deletes or account deleted
   */
  messages: {
    collected: true,
    types: ['Chat messages', 'Voice messages'],
    purpose: 'App functionality - user communication',
    required: false,
    shared: false,
    encrypted: true,
    canDelete: true,
  },

  /**
   * User Content - CUSTOMER SUPPORT
   * Collected for: Support requests
   * Shared with third parties: NO
   * Encryption: At rest in support system
   * Retention: Per retention policy
   */
  customerSupport: {
    collected: true,
    types: ['Support tickets', 'Chat logs'],
    purpose: 'Customer service',
    required: false,
    shared: false,
    encrypted: true,
    canDelete: true,
  },

  /**
   * App Activity - APP INTERACTIONS
   * Collected for: Analytics and app improvement
   * Shared with third parties: NO (PostHog is first-party)
   * Retention: 90 days for analytics
   */
  appActivity: {
    collected: true,
    types: [
      'Screen views',
      'Feature usage',
      'Interactions with content',
      'Search queries',
    ],
    purpose: 'Analytics and app improvement',
    required: false,
    shared: false,
    encrypted: false,
    canDelete: false, // Aggregated analytics
  },

  /**
   * App Activity - CRASH DATA
   * Collected for: Bug fixes and stability
   * Shared with third parties: NO (Sentry)
   * Retention: 90 days
   */
  crashData: {
    collected: true,
    types: ['Crash logs', 'Stack traces', 'Device info'],
    purpose: 'Bug reporting and stability',
    required: false,
    shared: false,
    encrypted: true,
    canDelete: false,
  },

  /**
   * Device or Other IDs
   * Collected for: Authentication and analytics
   * Shared with third parties: NO
   */
  deviceIds: {
    collected: true,
    types: ['Device ID', 'Installation ID'],
    purpose: 'Authentication and analytics',
    required: false,
    shared: false,
    encrypted: false,
    canDelete: true,
  },
};

// =============================================================================
// SECTION 3: DATA PRACTICES
// =============================================================================

export const DATA_PRACTICES = {
  // Data is encrypted in transit
  encryptedInTransit: true,

  // Data is encrypted at rest
  encryptedAtRest: true,

  // Users can request data deletion
  deletionRequest: true,

  // Deletion implementation
  deletionMethod: 'Account settings > Delete Account',

  // Data shared with third parties
  sharedWithThirdParties: false,

  // Data sold to third parties
  soldToThirdParties: false,

  // Legally required sharing
  legalRequirementSharing: true,
  legalRequirementDetails:
    'Shared when required by law (e.g., court order, regulatory request)',
};

// =============================================================================
// SECTION 4: THIRD-PARTY LIBRARIES & DATA PRACTICES
// =============================================================================

export const THIRD_PARTY_SDKS = [
  {
    name: 'Supabase',
    category: 'Backend as a Service',
    dataUsed: ['Authentication', 'Database', 'Storage'],
    privacyPolicy: 'https://supabase.com/privacy',
    dataShared: false,
    participatesInPrivacyShield: false,
  },
  {
    name: 'PostHog',
    category: 'Analytics',
    dataUsed: ['App interactions', 'Feature usage'],
    privacyPolicy: 'https://posthog.com/privacy',
    dataShared: false,
    participatesInPrivacyShield: false,
  },
  {
    name: 'Sentry',
    category: 'Crash Reporting',
    dataUsed: ['Crash reports', 'Error logs'],
    privacyPolicy: 'https://sentry.io/privacy/',
    dataShared: false,
    participatesInPrivacyShield: false,
  },
  {
    name: 'Mapbox',
    category: 'Maps and Location',
    dataUsed: ['Map rendering', 'Location display'],
    privacyPolicy: 'https://www.mapbox.com/legal/privacy/',
    dataShared: false,
    participatesInPrivacyShield: false,
  },
  {
    name: 'Expo (by Formium)',
    category: 'App Development Platform',
    dataUsed: ['OTA updates', 'Push notifications'],
    privacyPolicy: 'https://expo.dev/privacy',
    dataShared: false,
    participatesInPrivacyShield: false,
  },
  {
    name: 'Stripe/PayTR',
    category: 'Payments',
    dataUsed: ['Transaction processing'],
    privacyPolicy: 'https://paytr.com/aydinlatma-metni',
    dataShared: false,
    participatesInPrivacyShield: false,
  },
];

// =============================================================================
// SECTION 5: GOOGLE PLAY CONSOLE FORM ANSWERS
// =============================================================================

export const PLAY_CONSOLE_ANSWERS = {
  // Declaration form questions and answers

  Q1: {
    question: 'Does your app collect or share any user data?',
    answer: 'Yes',
    requiredDataTypes: [
      'Location',
      'Personal info',
      'Photos and videos',
      'Messages',
      'App activity',
      'Device or other IDs',
    ],
  },

  Q2: {
    question: 'Is all of the user data collected by your app encrypted in transit?',
    answer: 'Yes',
    details:
      'All data transmitted between the app and our servers uses TLS 1.2+ encryption.',
  },

  Q3: {
    question:
      'Do you provide a way for users to request deletion of their data?',
    answer: 'Yes',
    details:
      'Users can request data deletion through Account > Settings > Delete Account. Data deletion is processed within 30 days.',
  },

  Q4: {
    question: 'Is your app declared as a children\'s app in Play Console?',
    answer: 'No',
    details: 'Lovendo is a dating app for users 18+',
  },

  Q5: {
    question: 'Does your app contain ads?',
    answer: 'No',
    details: 'Lovendo does not display third-party advertisements',
  },
};

// =============================================================================
// SECTION 6: PRIVACY POLICY URLS
// =============================================================================

export const PRIVACY_POLICY = {
  appPrivacyPolicy: 'https://www.lovendo.xyz/privacy',
  developerPrivacyPolicy: 'https://www.lovendo.xyz/privacy-policy',
};

// =============================================================================
// SECTION 7: PLAY STORE CHECKLIST
// =============================================================================

export const RELEASE_CHECKLIST = [
  {
    task: 'Complete Data Safety form in Play Console',
    status: 'pending',
    reference: 'Play Console > Data Safety',
  },
  {
    task: 'Upload privacy policy URL',
    status: 'pending',
    reference: 'Play Console > Store listing > Privacy policy',
  },
  {
    task: 'Set target audience (18+)',
    status: 'pending',
    reference: 'Play Console > Target audience and content',
  },
  {
    task: 'Complete content rating questionnaire',
    status: 'pending',
    reference: 'Play Console > Content rating',
  },
  {
    task: 'Set up Data Safety declaration',
    status: 'pending',
    reference: 'Play Console > Data Safety > Declare',
  },
  {
    task: 'Submit for review',
    status: 'pending',
    reference: 'Play Console > Testing > Internal testing',
  },
];

// =============================================================================
// IMPLEMENTATION VERIFICATION
// =============================================================================

/**
 * Verification checklist for dev team
 * Each item must be verified before production release
 */
export const IMPLEMENTATION_VERIFICATION = {
  // Data collection
  dataCollection: {
    locationCollectionImplemented: true,
    analyticsOptOutAvailable: true,
    crashReportingOptOut: true,
    allCollectionsDocumented: true,
  },

  // Data protection
  dataProtection: {
    tls12PlusEnforced: true,
    encryptionAtRestSupabase: true,
    secureStorageForTokens: true,
    noSensitiveDataInLogs: true,
  },

  // User controls
  userControls: {
    accountDeletionImplemented: true,
    dataExportAvailable: false, // TODO: Implement GDPR data export
    analyticsOptOutInSettings: true,
    notificationPreferences: true,
  },

  // Privacy compliance
  privacyCompliance: {
    privacyPolicyPublished: false,
    gdprCompliance: false, // TODO: Complete GDPR implementation
    ccpaCompliance: false, // TODO: Complete CCPA implementation
    iosPrivacyManifest: true,
  },
};

export default {
  DATA_COLLECTION_DECLARATION,
  DATA_TYPES_COLLECTED,
  DATA_PRACTICES,
  THIRD_PARTY_SDKS,
  PLAY_CONSOLE_ANSWERS,
  PRIVACY_POLICY,
  RELEASE_CHECKLIST,
  IMPLEMENTATION_VERIFICATION,
};
