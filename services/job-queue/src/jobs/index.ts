import { z } from 'zod';

/**
 * KYC Verification Job Schema
 * Used to validate job data before processing
 */
export const KycJobSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  documentType: z.enum(['passport', 'id_card', 'driving_license'], {
    errorMap: () => ({ message: 'Document type must be passport, id_card, or driving_license' }),
  }),
  documentNumber: z.string().min(5, 'Document number must be at least 5 characters'),
  frontImageUrl: z.string().url('Invalid front image URL'),
  backImageUrl: z.string().url('Invalid back image URL').optional(),
  provider: z.enum(['onfido', 'stripe_identity']).default('onfido'),
  metadata: z
    .record(z.unknown())
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
  metadata: z.record(z.unknown()).optional(),
});

export type KycJobResult = z.infer<typeof KycJobResultSchema>;

/**
 * Image Processing Job Schema
 */
export const ImageJobSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  userId: z.string().uuid('Invalid user ID'),
  type: z.enum(['profile', 'moment', 'proof']),
  sizes: z.array(
    z.object({
      width: z.number().positive(),
      height: z.number().positive(),
      format: z.enum(['webp', 'jpeg', 'png']).default('webp'),
    })
  ),
  quality: z.number().min(1).max(100).default(80),
  bucket: z.string().default('images'),
});

export type ImageJobData = z.infer<typeof ImageJobSchema>;

/**
 * Email Job Schema
 */
export const EmailJobSchema = z.object({
  to: z.string().email('Invalid email address'),
  template: z.string().min(1, 'Template name is required'),
  data: z.record(z.unknown()),
  provider: z.enum(['sendgrid', 'mailgun']).default('sendgrid'),
  from: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(), // Base64 encoded
        contentType: z.string(),
      })
    )
    .optional(),
});

export type EmailJobData = z.infer<typeof EmailJobSchema>;

/**
 * Notification Job Schema
 */
export const NotificationJobSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  type: z.enum(['push', 'sms', 'in_app']),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
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
  properties: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
  sessionId: z.string().optional(),
  platform: z.enum(['ios', 'android', 'web']).optional(),
});

export type AnalyticsJobData = z.infer<typeof AnalyticsJobSchema>;

/**
 * Job Options for all queues
 */
export interface JobOptions {
  priority?: number; // 1 (highest) - 10 (lowest)
  delay?: number; // Delay in milliseconds before processing
  attempts?: number; // Number of retry attempts
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number; // Base delay in milliseconds
  };
  removeOnComplete?: boolean | number; // Keep last N completed jobs
  removeOnFail?: boolean | number; // Keep last N failed jobs
  timeout?: number; // Job timeout in milliseconds
}

/**
 * Predefined job options for different priorities
 */
export const JobPriorities = {
  CRITICAL: {
    priority: 1,
    attempts: 5,
    backoff: { type: 'exponential' as const, delay: 10000 }, // 10s, 20s, 40s, 80s, 160s
    timeout: 120000, // 2 minutes
  },
  HIGH: {
    priority: 3,
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 60000 }, // 1min, 2min, 4min
    timeout: 60000, // 1 minute
  },
  NORMAL: {
    priority: 5,
    attempts: 3,
    backoff: { type: 'fixed' as const, delay: 120000 }, // 2min each retry
    timeout: 30000, // 30 seconds
  },
  LOW: {
    priority: 8,
    attempts: 2,
    backoff: { type: 'fixed' as const, delay: 300000 }, // 5min each retry
    timeout: 60000, // 1 minute
  },
};

/**
 * Queue Names (centralized)
 */
export const QueueNames = {
  KYC_VERIFICATION: 'kyc-verification',
  IMAGE_PROCESSING: 'image-processing',
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  ANALYTICS: 'analytics',
} as const;

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];

/**
 * Job Status Enum
 */
export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
}
