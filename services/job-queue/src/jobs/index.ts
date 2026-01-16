import { z } from 'zod';

export const QueueNames = {
  KYC_VERIFICATION: 'kyc-verification',
  IMAGE_PROCESSING: 'image-processing',
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  ANALYTICS: 'analytics',
  // Keeping both formats to ensure compatibility if any file calls .KYC instead of .KYC_VERIFICATION during migration
  KYC: 'kyc-verification',
  IMAGE: 'image-processing',
} as const;

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];

export const JobPriorities = {
  HIGH: { priority: 1 },
  NORMAL: { priority: 2 },
  LOW: { priority: 3 },
} as const;

export type JobPriority = (typeof JobPriorities)[keyof typeof JobPriorities];

/**
 * KYC Verification Job Schema
 * Used to validate job data before processing
 */
export const KycJobSchema = z.object({
  userId: z.string().uuid(),
  documentType: z.enum(['passport', 'id_card', 'driving_license']),
  documentNumber: z.string().min(5),
  frontImageUrl: z.string().url(),
  backImageUrl: z.string().url().optional(),
  provider: z.enum(['onfido', 'stripe_identity']).default('onfido'),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Additional metadata for the verification'),
});

export type KycJobData = z.infer<typeof KycJobSchema>;

/**
 * KYC Verification Result Schema
 * Returned by the worker after processing
 */
export const KycJobResultSchema = z.object({
  success: z.boolean(),
  status: z.enum(['verified', 'rejected', 'needs_review']),
  provider: z.string(),
  providerId: z.string().optional(), // ID from provider (Onfido, Stripe)
  confidence: z.number().min(0).max(1).optional(), // 0-1 confidence score
  rejectionReasons: z.array(z.string()).optional(),
  completedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type KycJobResult = z.infer<typeof KycJobResultSchema>;

/**
 * Image Processing Job Schema
 */
export const ImageJobSchema = z.object({
  imageUrl: z.string().url(),
  userId: z.string().uuid(),
  type: z.enum(['profile', 'moment', 'proof']),
  sizes: z.array(
    z.object({
      width: z.number().positive(),
      height: z.number().positive(),
      format: z.enum(['webp', 'jpeg', 'png']).default('webp'),
    }),
  ),
  quality: z.number().min(1).max(100).default(80),
  bucket: z.string().default('images'),
});

export type ImageJobData = z.infer<typeof ImageJobSchema>;

/**
 * Email Job Schema
 */
export const EmailJobSchema = z.object({
  to: z.string().email(),
  template: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
  provider: z.enum(['sendgrid', 'mailgun']).default('sendgrid'),
  from: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(), // Base64 encoded
        contentType: z.string(),
      }),
    )
    .optional(),
});

export type EmailJobData = z.infer<typeof EmailJobSchema>;

/**
 * Notification Job Schema
 */
export const NotificationJobSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['push', 'sms', 'in_app']),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.string(), z.unknown()).optional(),
  deepLink: z.string().url().optional(), // Deep link URL
  icon: z.string().url().optional(),
  sound: z.string().optional(),
  badge: z.number().optional(),
});

export type NotificationJobData = z.infer<typeof NotificationJobSchema>;

/**
 * Analytics Event Job Schema
 */
export const AnalyticsJobSchema = z.object({
  userId: z.string().uuid().optional(),
  event: z.string().min(1),
  properties: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
  sessionId: z.string().optional(),
  platform: z.enum(['ios', 'android', 'web']).optional(),
});

export type AnalyticsJobData = z.infer<typeof AnalyticsJobSchema>;
