// KYC Verification Types
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type KYCStep =
  | 'intro'
  | 'document'
  | 'upload'
  | 'selfie'
  | 'review'
  | 'pending';

export type DocumentType = 'passport' | 'id_card' | 'drivers_license';

export interface VerificationData {
  fullName: string;
  dateOfBirth: string;
  country: string;
  documentType: DocumentType | null;
  documentFront: string | null;
  documentBack: string | null;
  selfie: string | null;
  confirmed: boolean;
}

export interface DocumentOption {
  id: DocumentType;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export interface Requirement {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export interface Guideline {
  id: string;
  text: string;
}

export interface NextStep {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
}

// Route params for KYC screens
export interface KYCIntroScreenParams {
  returnTo?: string;
}

export interface KYCDocumentTypeScreenParams {
  data: VerificationData;
}

export interface KYCDocumentCaptureScreenParams {
  data: VerificationData;
}

export interface KYCSelfieScreenParams {
  data: VerificationData;
}

export interface KYCReviewScreenParams {
  data: VerificationData;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface KYCPendingScreenParams {
  // No specific params needed - interface kept for type consistency
}
