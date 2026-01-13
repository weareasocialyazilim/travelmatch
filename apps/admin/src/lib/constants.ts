/**
 * Admin Panel Constants
 */

// Role Labels (Turkish)
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Süper Admin',
  manager: 'Yönetici',
  moderator: 'Moderatör',
  finance: 'Finans',
  marketing: 'Pazarlama',
  support: 'Destek',
  viewer: 'İzleyici',
};

// Status Labels (Turkish)
export const USER_STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  suspended: 'Askıya Alındı',
  banned: 'Yasaklandı',
  pending: 'Beklemede',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Acil',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
};

export const KYC_STATUS_LABELS: Record<string, string> = {
  not_started: 'Başlamadı',
  pending: 'Beklemede',
  verified: 'Doğrulandı',
  rejected: 'Reddedildi',
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Taciz',
  fake_profile: 'Sahte Profil',
  inappropriate_content: 'Uygunsuz İçerik',
  scam: 'Dolandırıcılık',
  safety: 'Güvenlik',
  other: 'Diğer',
};

export const REPORT_PRIORITY_LABELS: Record<string, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  scheduled: 'Planlandı',
  active: 'Aktif',
  paused: 'Duraklatıldı',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  push: 'Push Bildirim',
  email: 'E-posta',
  in_app: 'Uygulama İçi',
  sms: 'SMS',
};

// Colors
export const PRIORITY_COLORS: Record<string, string> = {
  urgent:
    'text-red-500 bg-red-500/10 border-red-500/30 dark:text-red-400 dark:bg-red-500/20 dark:border-red-500/30',
  high: 'text-orange-500 bg-orange-500/10 border-orange-500/30 dark:text-orange-400 dark:bg-orange-500/20 dark:border-orange-500/30',
  medium:
    'text-yellow-500 bg-yellow-500/10 border-yellow-500/30 dark:text-yellow-400 dark:bg-yellow-500/20 dark:border-yellow-500/30',
  low: 'text-green-500 bg-green-500/10 border-green-500/30 dark:text-green-400 dark:bg-green-500/20 dark:border-green-500/30',
};

export const STATUS_COLORS: Record<string, string> = {
  active:
    'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-500/20',
  pending:
    'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/20',
  suspended:
    'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/20',
  banned: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-500/20',
  completed: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/20',
  cancelled: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-500/20',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date formats
export const DATE_FORMAT = 'dd MMM yyyy';
export const DATETIME_FORMAT = 'dd MMM yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Task types
export const TASK_TYPES = [
  { value: 'kyc_verification', label: 'KYC Doğrulama' },
  { value: 'payment_approval', label: 'Ödeme Onayı' },
  { value: 'dispute_review', label: 'Anlaşmazlık İnceleme' },
  { value: 'report_review', label: 'Rapor İnceleme' },
  { value: 'payout_approval', label: 'Ödeme Çıkışı Onayı' },
  { value: 'content_moderation', label: 'İçerik Moderasyonu' },
  { value: 'support_ticket', label: 'Destek Talebi' },
];

// Creator tiers
export const CREATOR_TIER_LABELS: Record<string, string> = {
  bronze: 'Bronz',
  silver: 'Gümüş',
  gold: 'Altın',
  platinum: 'Platin',
};

export const CREATOR_TIER_COLORS: Record<string, string> = {
  bronze:
    'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/20',
  silver: 'text-gray-700 bg-gray-200 dark:text-gray-400 dark:bg-gray-500/20',
  gold: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/20',
  platinum:
    'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/20',
};

// Partner tiers
export const PARTNER_TIER_LABELS: Record<string, string> = {
  basic: 'Temel',
  premium: 'Premium',
  enterprise: 'Kurumsal',
};

// Badge rarities
export const BADGE_RARITY_LABELS: Record<string, string> = {
  common: 'Yaygın',
  rare: 'Nadir',
  epic: 'Epik',
  legendary: 'Efsanevi',
};

export const BADGE_RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-500/20',
  rare: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/20',
  epic: 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/20',
  legendary:
    'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/20',
};
