// KYC Constants - Shared data for KYC verification screens
import type { DocumentOption, Requirement, Guideline, NextStep } from './types';

export const REQUIREMENTS: Requirement[] = [
  { id: 'doc', label: 'Government-issued ID', icon: 'card-account-details' },
  { id: 'selfie', label: 'Live selfie photo', icon: 'account-box' },
  { id: 'time', label: '5-10 minutes of your time', icon: 'clock-outline' },
];

export const DOCUMENT_OPTIONS: DocumentOption[] = [
  { id: 'passport', label: 'Passport', icon: 'passport' },
  { id: 'id_card', label: 'National ID Card', icon: 'card-account-details' },
  { id: 'drivers_license', label: "Driver's License", icon: 'car' },
];

export const GUIDELINES: Guideline[] = [
  { id: '1', text: 'Ensure all corners are visible' },
  { id: '2', text: 'Avoid glare or reflections' },
  { id: '3', text: 'Use good lighting' },
  { id: '4', text: 'Keep the document flat' },
];

export const NEXT_STEPS: NextStep[] = [
  {
    id: '1',
    icon: 'email-outline',
    title: 'Email Confirmation',
    description: "We'll send you an email when verification is complete.",
  },
  {
    id: '2',
    icon: 'shield-check',
    title: 'Account Upgrade',
    description: "Once verified, you'll unlock all platform features.",
  },
  {
    id: '3',
    icon: 'help-circle-outline',
    title: 'Need Help?',
    description: 'Contact support if you have any questions.',
  },
];

export const INITIAL_VERIFICATION_DATA = {
  fullName: 'John Doe',
  dateOfBirth: '1990-01-15',
  country: 'United States',
  documentType: null,
  documentFront: null,
  documentBack: null,
  selfie: null,
  confirmed: false,
};

// Progress calculation helper
export const getStepProgress = (
  step: string,
): { current: number; total: number; percentage: number } => {
  const steps = ['intro', 'document', 'upload', 'selfie', 'review', 'pending'];
  const currentIndex = steps.indexOf(step);
  const total = steps.length - 1; // Exclude pending from progress
  const current = Math.min(currentIndex, total);
  const percentage = (current / total) * 100;
  return { current, total, percentage };
};
