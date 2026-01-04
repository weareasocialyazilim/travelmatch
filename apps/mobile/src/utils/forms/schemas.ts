/**
 * Centralized Form Validation Schemas
 *
 * All form validation schemas using Zod
 * Consistent patterns across the entire app
 *
 * NOTE: Auth schemas are re-exported from @travelmatch/shared
 * to ensure single source of truth across all platforms.
 */

import { z } from 'zod';

// Re-export auth schemas from shared package (Single Source of Truth)
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  verifyOtpSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
  type VerifyEmailInput,
  type VerifyOtpInput,
} from '@travelmatch/shared/schemas';

// Re-export common schemas from shared
export {
  emailSchema,
  passwordSchema,
  phoneSchema,
  usernameSchema,
} from '@travelmatch/shared/schemas';

// ============================================================================
// MOBILE-SPECIFIC COMMON VALIDATION RULES
// ============================================================================

export const emailValidation = z
  .string()
  .min(1, 'forms.validation.email.required')
  .email('forms.validation.email.invalid');

export const passwordValidation = z
  .string()
  .min(8, 'forms.validation.password.min')
  .regex(/[A-Z]/, 'forms.validation.password.uppercase')
  .regex(/[a-z]/, 'forms.validation.password.lowercase')
  .regex(/[0-9]/, 'forms.validation.password.number');

export const optionalPasswordValidation = z
  .string()
  .min(8, 'forms.validation.password.min')
  .regex(/[A-Z]/, 'forms.validation.password.uppercase')
  .regex(/[a-z]/, 'forms.validation.password.lowercase')
  .regex(/[0-9]/, 'forms.validation.password.number')
  .optional()
  .or(z.literal(''));

export const phoneValidation = z
  .string()
  .min(1, 'forms.validation.phone.required')
  .regex(/^\+?[1-9]\d{9,14}$/, 'forms.validation.phone.invalid');

// Phone validation for registration (10 digits without country code)
export const phoneInputValidation = z
  .string()
  .min(1, 'Telefon numarası gerekli')
  .regex(/^\d{10}$/, 'Geçerli bir 10 haneli telefon numarası girin');

export const nameValidation = z
  .string()
  .min(2, 'forms.validation.name.min')
  .max(50, 'forms.validation.name.max');

export const usernameValidation = z
  .string()
  .min(3, 'forms.validation.username.min')
  .max(30, 'forms.validation.username.max')
  .regex(/^[a-zA-Z0-9_]+$/, 'forms.validation.username.invalid');

export const amountValidation = z
  .number()
  .positive('forms.validation.amount.positive')
  .max(100000, 'forms.validation.amount.max');

export const urlValidation = z
  .string()
  .url('forms.validation.url.invalid')
  .optional()
  .or(z.literal(''));

export const bioValidation = z
  .string()
  .max(500, 'forms.validation.bio.max')
  .optional()
  .or(z.literal(''));

export const messageValidation = z
  .string()
  .min(1, 'forms.validation.message.required')
  .max(1000, 'forms.validation.message.max');

export const genderValidation = z.enum(
  ['male', 'female', 'other', 'prefer_not_to_say'],
  { message: 'forms.validation.gender.required' },
);

export const dateOfBirthValidation = z.date().refine(
  (date) => {
    const today = new Date();
    const minAge = 18;
    const maxAge = 120;
    const age = Math.floor(
      (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    return age >= minAge && age <= maxAge;
  },
  { message: 'forms.validation.dateOfBirth.age' },
);

// Gender type export
export type Gender = z.infer<typeof genderValidation>;

// ============================================================================
// MOBILE-SPECIFIC AUTH SCHEMAS (Extended for mobile UI)
// Note: Core auth schemas (loginSchema, registerSchema, etc.) are imported
// from @travelmatch/shared above. These are mobile-specific extensions.
// ============================================================================

export const phoneAuthSchema = z.object({
  phone: phoneValidation,
  otp: z
    .string()
    .regex(/^\d{6}$/, 'forms.validation.otp.invalid')
    .optional(),
});

export const emailAuthSchema = z.object({
  email: emailValidation,
});

export const verifyCodeSchema = z.object({
  code: z.string().length(6, 'forms.validation.code.length'),
});

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const editProfileSchema = z.object({
  fullName: nameValidation,
  username: usernameValidation.optional(),
  bio: bioValidation,
  location: z.string().max(100, 'forms.validation.location.max').optional(),
  website: urlValidation,
  dateOfBirth: z.date().optional(),
});

export const completeProfileSchema = z.object({
  fullName: nameValidation,
  username: usernameValidation,
  bio: bioValidation,
  avatar: z.string().optional().or(z.literal('')),
  interests: z
    .array(z.string())
    .min(1, 'forms.validation.interests.min')
    .max(5, 'forms.validation.interests.max'),
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const withdrawSchema = z.object({
  amount: z
    .string()
    .min(1, 'forms.validation.amount.required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'forms.validation.amount.positive',
    })
    .refine((val) => parseFloat(val) <= 100000, {
      message: 'forms.validation.amount.max',
    }),
  note: z
    .string()
    .max(500, 'forms.validation.note.max')
    .optional()
    .or(z.literal('')),
});

export const addPaymentMethodSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'forms.validation.cardNumber.required')
    .regex(/^[0-9]{13,19}$/, 'forms.validation.cardNumber.invalid'),
  expiryMonth: z
    .number()
    .min(1, 'forms.validation.expiryMonth.min')
    .max(12, 'forms.validation.expiryMonth.max'),
  expiryYear: z
    .number()
    .min(new Date().getFullYear(), 'forms.validation.expiryYear.min'),
  cvv: z.string().regex(/^[0-9]{3,4}$/, 'forms.validation.cvv.invalid'),
  cardHolderName: nameValidation,
});

export const sendGiftSchema = z.object({
  recipientEmail: emailValidation,
  message: messageValidation.optional(),
});

export const refundRequestSchema = z.object({
  reason: z.enum([
    'not_received',
    'not_as_described',
    'damaged',
    'wrong_item',
    'other',
  ]),
  description: messageValidation,
  amount: amountValidation.optional(),
});

// ============================================================================
// TRIP SCHEMAS
// ============================================================================

export const createTripSchema = z
  .object({
    destination: z.string().min(1, 'forms.validation.destination.required'),
    startDate: z.date(),
    endDate: z.date(),
    budget: amountValidation.optional(),
    description: messageValidation.optional(),
    companions: z.number().min(1).max(10).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'forms.validation.endDate.afterStart',
    path: ['endDate'],
  });

export const tripRequestSchema = z.object({
  tripId: z.string().uuid('forms.validation.tripId.invalid'),
  message: messageValidation,
  budget: amountValidation.optional(),
});

// ============================================================================
// MOMENT SCHEMAS
// ============================================================================

export const createMomentSchema = z.object({
  title: z
    .string()
    .min(5, 'forms.validation.title.minMoment')
    .max(100, 'forms.validation.title.max'),
  category: z.string().min(1, 'forms.validation.category.required'),
  amount: z
    .number()
    .positive('forms.validation.amount.positive')
    .max(10000, 'forms.validation.amount.maxMoment'),
  date: z.date(),
  story: z
    .string()
    .max(1000, 'forms.validation.story.max')
    .optional()
    .or(z.literal('')),
  photo: z.string().optional().or(z.literal('')),
  place: z
    .object({
      name: z.string(),
      address: z.string(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional()
    .nullable(),
});

export const proofSchema = z.object({
  type: z.enum(['micro-kindness', 'verified-experience', 'community-proof']),
  title: z
    .string()
    .min(1, 'forms.validation.title.required')
    .max(100, 'forms.validation.title.max'),
  description: z
    .string()
    .min(10, 'forms.validation.description.minProof')
    .max(500, 'forms.validation.description.max'),
  photos: z
    .array(z.string())
    .min(1, 'forms.validation.photos.required')
    .max(5, 'forms.validation.photos.max'),
  ticket: z.string().optional().or(z.literal('')),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      name: z.string(),
    })
    .optional()
    .nullable(),
  amount: z.number().positive().optional(),
  receiver: z.string().optional().or(z.literal('')),
});

export const editMomentSchema = z.object({
  title: z
    .string()
    .min(1, 'forms.validation.title.required')
    .max(100, 'forms.validation.title.max'),
  description: z
    .string()
    .max(500, 'forms.validation.description.max')
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .positive('forms.validation.price.positive')
    .max(100000, 'forms.validation.price.max'),
});

// ============================================================================
// REPORTING SCHEMAS
// ============================================================================

export const reportSchema = z.object({
  reason: z.string().min(1, 'forms.validation.reason.required'),
  details: z
    .string()
    .max(500, 'forms.validation.details.max')
    .optional()
    .or(z.literal('')),
});

export const disputeSchema = z.object({
  reason: z
    .string()
    .min(1, 'forms.validation.reason.required')
    .max(1000, 'forms.validation.reason.max'),
  evidence: z
    .array(z.string())
    .max(3, 'forms.validation.evidence.max')
    .optional(),
});

export const deleteAccountSchema = z.object({
  confirmation: z.string().refine((val) => val.toUpperCase() === 'DELETE', {
    message: 'forms.validation.confirmation.delete',
  }),
});

export const twoFactorSetupSchema = z.object({
  verificationCode: z.string().regex(/^\d{6}$/, 'forms.validation.code.length'),
});

// ============================================================================
// KYC SCHEMAS
// ============================================================================

export const kycPersonalInfoSchema = z.object({
  firstName: nameValidation,
  lastName: nameValidation,
  dateOfBirth: z.date(),
  nationality: z.string().min(1, 'forms.validation.nationality.required'),
  address: z.string().min(1, 'forms.validation.address.required'),
  city: z.string().min(1, 'forms.validation.city.required'),
  postalCode: z.string().min(1, 'forms.validation.postalCode.required'),
  country: z.string().min(1, 'forms.validation.country.required'),
});

export const kycDocumentSchema = z.object({
  documentType: z.enum(['passport', 'id_card', 'drivers_license']),
  documentNumber: z.string().min(1, 'forms.validation.documentNumber.required'),
  expiryDate: z.date(),
});

// ============================================================================
// SUPPORT SCHEMAS
// ============================================================================

export const contactSupportSchema = z.object({
  subject: z.string().min(1, 'forms.validation.subject.required'),
  category: z.enum(['account', 'payment', 'technical', 'safety', 'other']),
  message: messageValidation,
  email: emailValidation.optional(),
});

export const feedbackSchema = z.object({
  rating: z
    .number()
    .min(1, 'forms.validation.rating.required')
    .max(5, 'forms.validation.rating.max'),
  category: z.string().min(1, 'forms.validation.category.required'),
  comment: messageValidation.optional(),
});

// ============================================================================
// TRUST & PROOF SCHEMAS
// ============================================================================

export const trustNoteSchema = z.object({
  note: z
    .string()
    .min(10, 'forms.validation.trustNote.min')
    .max(500, 'forms.validation.trustNote.max'),
  rating: z.number().min(1).max(5),
  category: z.enum(['meet', 'trip', 'help', 'other']).optional(),
});

export const proofUploadSchema = z.object({
  title: z
    .string()
    .min(1, 'forms.validation.title.required')
    .max(100, 'forms.validation.title.max'),
  description: messageValidation.optional(),
  category: z.enum(['travel', 'education', 'work', 'skill', 'other']),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProofInput = z.infer<typeof proofSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;
export type EmailAuthInput = z.infer<typeof emailAuthSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type EditProfileInput = z.infer<typeof editProfileSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type AddPaymentMethodInput = z.infer<typeof addPaymentMethodSchema>;
export type SendGiftInput = z.infer<typeof sendGiftSchema>;
export type RefundRequestInput = z.infer<typeof refundRequestSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type TripRequestInput = z.infer<typeof tripRequestSchema>;
export type CreateMomentInput = z.infer<typeof createMomentSchema>;
export type EditMomentInput = z.infer<typeof editMomentSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type DisputeInput = z.infer<typeof disputeSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type TwoFactorSetupInput = z.infer<typeof twoFactorSetupSchema>;
export type KYCPersonalInfoInput = z.infer<typeof kycPersonalInfoSchema>;
export type KYCDocumentInput = z.infer<typeof kycDocumentSchema>;
export type ContactSupportInput = z.infer<typeof contactSupportSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type TrustNoteInput = z.infer<typeof trustNoteSchema>;
export type ProofUploadInput = z.infer<typeof proofUploadSchema>;
