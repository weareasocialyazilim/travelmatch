import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Geçerli bir e-posta adresi girin');

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalı')
  .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
  .regex(/[a-z]/, 'En az bir küçük harf içermeli')
  .regex(/[0-9]/, 'En az bir rakam içermeli');

/**
 * Turkish phone number validation
 */
export const phoneSchema = z
  .string()
  .regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası girin');

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre gerekli'),
});

/**
 * Admin user creation schema
 */
export const createAdminUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  role: z.enum([
    'super_admin',
    'manager',
    'moderator',
    'finance',
    'marketing',
    'support',
    'viewer',
  ]),
  requires_2fa: z.boolean().default(true),
});

/**
 * User update schema
 */
export const updateUserSchema = z.object({
  full_name: z.string().min(2, 'İsim en az 2 karakter olmalı').optional(),
  status: z.enum(['active', 'suspended', 'banned', 'pending']).optional(),
  kyc_status: z
    .enum(['not_started', 'pending', 'verified', 'rejected'])
    .optional(),
});

/**
 * Task creation schema
 */
export const createTaskSchema = z.object({
  type: z.enum([
    'kyc_verification',
    'payment_approval',
    'dispute_review',
    'report_review',
    'payout_approval',
    'content_moderation',
    'support_ticket',
  ]),
  title: z.string().min(5, 'Başlık en az 5 karakter olmalı'),
  description: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  resource_type: z.string(),
  resource_id: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().datetime().optional(),
});

/**
 * Report creation schema
 */
export const createReportSchema = z.object({
  reported_id: z.string().uuid('Geçerli bir kullanıcı ID gerekli'),
  type: z.enum([
    'spam',
    'harassment',
    'fake_profile',
    'inappropriate_content',
    'scam',
    'safety',
    'other',
  ]),
  reason: z.string().min(10, 'Sebep en az 10 karakter olmalı'),
  description: z.string().min(20, 'Açıklama en az 20 karakter olmalı'),
  evidence: z.array(z.string().url()).optional(),
});

/**
 * Notification campaign schema
 */
export const notificationCampaignSchema = z.object({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalı')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  message: z
    .string()
    .min(10, 'Mesaj en az 10 karakter olmalı')
    .max(500, 'Mesaj en fazla 500 karakter olabilir'),
  type: z.enum(['push', 'email', 'in_app', 'sms']),
  target_audience: z.object({
    segments: z.array(z.string()).optional(),
    filters: z.record(z.string(), z.unknown()).optional(),
    user_ids: z.array(z.string().uuid()).optional(),
  }),
  scheduled_at: z.string().datetime().optional(),
});

/**
 * Marketing campaign schema
 */
export const marketingCampaignSchema = z.object({
  name: z.string().min(5, 'Kampanya adı en az 5 karakter olmalı'),
  description: z.string().min(20, 'Açıklama en az 20 karakter olmalı'),
  type: z.enum(['email', 'push', 'social', 'display', 'influencer']),
  budget: z.number().min(0, 'Bütçe negatif olamaz'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  target_audience: z.record(z.string(), z.unknown()),
});

/**
 * Dispute resolution schema
 */
export const resolveDisputeSchema = z.object({
  resolution: z.string().min(20, 'Çözüm açıklaması en az 20 karakter olmalı'),
  action_taken: z
    .enum(['warning', 'suspension', 'ban', 'no_action', 'refund'])
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type NotificationCampaignInput = z.infer<
  typeof notificationCampaignSchema
>;
export type MarketingCampaignInput = z.infer<typeof marketingCampaignSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
