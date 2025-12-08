/**
 * Report Categories and Labels
 */

export const REPORT_CATEGORIES = {
  user: [
    'harassment',
    'hate_speech',
    'violence',
    'spam',
    'fake_profile',
    'inappropriate_content',
    'scam',
    'underage',
    'other',
  ],
  moment: [
    'nudity',
    'violence',
    'hate_speech',
    'spam',
    'copyright',
    'false_information',
    'inappropriate_content',
    'other',
  ],
  message: [
    'harassment',
    'spam',
    'inappropriate_content',
    'scam',
    'other',
  ],
  comment: [
    'harassment',
    'hate_speech',
    'spam',
    'inappropriate_content',
    'other',
  ],
} as const;

export const REPORT_CATEGORY_LABELS: Record<string, string> = {
  harassment: 'Harassment or Bullying',
  hate_speech: 'Hate Speech',
  violence: 'Violence or Threats',
  spam: 'Spam or Scam',
  fake_profile: 'Fake Profile',
  inappropriate_content: 'Inappropriate Content',
  scam: 'Scam or Fraud',
  underage: 'Underage User',
  nudity: 'Nudity or Sexual Content',
  copyright: 'Copyright Violation',
  false_information: 'False Information',
  other: 'Other',
};

export const REPORT_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  harassment: 'Bullying, threats, or unwanted contact',
  hate_speech: 'Attacks based on race, religion, gender, etc.',
  violence: 'Threats of violence or graphic content',
  spam: 'Unwanted promotional content or scams',
  fake_profile: 'Fake identity or impersonation',
  inappropriate_content: 'Content that violates community guidelines',
  scam: 'Fraudulent activity or requests for money',
  underage: 'User appears to be under 18',
  nudity: 'Explicit or sexual content',
  copyright: 'Unauthorized use of copyrighted material',
  false_information: 'Deliberately misleading information',
  other: 'Something else that concerns you',
};
