/**
 * Validation Schemas
 * Zod ile tüm form ve API validationları
 */

import { z } from 'zod';

/**
 * Auth Schemas
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Profile Schemas
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional(),
  dateOfBirth: z
    .date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .optional(),
});

/**
 * Moment Schemas
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

/**
 * Message Schemas
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

/**
 * Review Schemas
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

/**
 * Search Schemas
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
    {
      message: 'Min price must be less than max price',
      path: ['maxPrice'],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    },
  );

/**
 * Type Exports
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateMomentInput = z.infer<typeof createMomentSchema>;
export type UpdateMomentInput = z.infer<typeof updateMomentSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type AddCardInput = z.infer<typeof addCardSchema>;
export type AddBankAccountInput = z.infer<typeof addBankAccountSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
