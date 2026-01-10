/**
 * Validation Schemas
 * Re-exports from @travelmatch/shared and mobile-specific schemas
 *
 * @see packages/shared/src/schemas for base schemas
 */

import { z } from 'zod';

// Re-export all schemas from shared package
export {
  // Auth schemas
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

  // User schemas
  updateProfileSchema,
  type UpdateProfileInput,

  // Common schemas
  emailSchema,
  passwordSchema,
  phoneSchema,
  urlSchema,
  uuidSchema,
  usernameSchema,
  currencySchema,
  amountSchema,
  paginationSchema,
  cursorPaginationSchema,
  dateRangeSchema,
  searchSchema as baseSearchSchema,
  sortSchema,
  coordinatesSchema,
  coordinatesSchema as coordinateSchema, // alias for backward compatibility
  locationSearchSchema,
  type PaginationInput,
  type CursorPaginationInput,
  type DateRangeInput,
  type SearchInput as BaseSearchInput,
  type SortInput,
  type CoordinatesInput,
  type LocationSearchInput,
} from '../../../../packages/shared/src/schemas';

// =============================================================================
// MOBILE-SPECIFIC SCHEMAS
// =============================================================================

/**
 * Create Moment Schema
 */
export const createMomentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Category is required'),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  price: z.number().min(0, 'Price must be positive').optional(),
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
});

export const updateMomentSchema = createMomentSchema.partial();

export type CreateMomentInput = z.infer<typeof createMomentSchema>;
export type UpdateMomentInput = z.infer<typeof updateMomentSchema>;

/**
 * Message Schema
 */
export const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters'),
  attachments: z
    .array(z.string().url('Invalid attachment URL'))
    .max(5, 'Maximum 5 attachments allowed')
    .optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/**
 * Payment Schemas
 */
export const addCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  cardholderName: z
    .string()
    .min(1, 'Cardholder name is required')
    .max(50, 'Name must be less than 50 characters'),
  expiryMonth: z.number().min(1, 'Invalid month').max(12, 'Invalid month'),
  expiryYear: z.number().min(new Date().getFullYear(), 'Card has expired'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});

export const addBankAccountSchema = z.object({
  accountHolderName: z
    .string()
    .min(1, 'Account holder name is required')
    .max(50, 'Name must be less than 50 characters'),
  iban: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, 'Invalid IBAN format'),
  bankName: z.string().min(1, 'Bank name is required'),
});

export type AddCardInput = z.infer<typeof addCardSchema>;
export type AddBankAccountInput = z.infer<typeof addBankAccountSchema>;

/**
 * Review Schema
 */
export const createReviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters')
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * Search Schema (mobile extended)
 */
export const searchSchema = z
  .object({
    query: z
      .string()
      .min(1, 'Search query is required')
      .max(100, 'Search query must be less than 100 characters'),
    category: z.string().optional(),
    location: z.string().optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    { message: 'Min price must be less than max price', path: ['maxPrice'] },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { message: 'Start date must be before end date', path: ['endDate'] },
  );

export type SearchInput = z.infer<typeof searchSchema>;

/**
 * Report Schema
 */
export const reportSchema = z.object({
  reason: z.enum([
    'spam',
    'harassment',
    'inappropriate_content',
    'fraud',
    'other',
  ]),
  description: z
    .string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(1000, 'Description must be less than 1000 characters'),
  evidence: z
    .array(z.string().url('Invalid evidence URL'))
    .max(5, 'Maximum 5 evidence files allowed')
    .optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

/**
 * Settings Schemas
 */
export const notificationSettingsSchema = z.object({
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  marketingEnabled: z.boolean(),
  newMessages: z.boolean(),
  momentUpdates: z.boolean(),
  requestUpdates: z.boolean(),
  paymentUpdates: z.boolean(),
});

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']),
  showLocation: z.boolean(),
  allowMessagesFrom: z.enum(['everyone', 'friends', 'none']),
  showActivityStatus: z.boolean(),
});

export type NotificationSettingsInput = z.infer<
  typeof notificationSettingsSchema
>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;

/**
 * Contact & Feedback Schemas
 */
export const contactSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  category: z.enum(['general', 'support', 'billing', 'partnership', 'other']),
  email: z.string().email('Invalid email address').optional(),
});

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other']),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  attachments: z
    .array(z.string().url('Invalid attachment URL'))
    .max(3, 'Maximum 3 attachments allowed')
    .optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;

/**
 * Transaction Schemas
 */
export const withdrawalSchema = z.object({
  amount: z.number().min(10, 'Minimum withdrawal amount is $10'),
  destinationType: z.enum(['bank', 'card']),
  destinationId: z.string().min(1, 'Destination is required'),
});

export const disputeSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  reason: z.enum([
    'not_as_described',
    'not_received',
    'unauthorized',
    'duplicate',
    'other',
  ]),
  description: z
    .string()
    .min(20, 'Please provide more details (at least 20 characters)')
    .max(2000, 'Description must be less than 2000 characters'),
  evidence: z
    .array(z.string().url('Invalid evidence URL'))
    .min(1, 'At least one piece of evidence is required')
    .max(10, 'Maximum 10 evidence files allowed'),
});

export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type DisputeInput = z.infer<typeof disputeSchema>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Helper function to validate and parse data
 */
export const validateInput = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
};

/**
 * Helper to format Zod errors for display
 */
export const formatZodErrors = (
  errors: z.ZodError,
): Record<string, string[]> => {
  const formattedErrors: Record<string, string[]> = {};

  errors.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(issue.message);
  });

  return formattedErrors;
};
