/**
 * Lovendo Proof Ceremony Constants
 *
 * Design tokens and configuration for the Proof Ceremony UX system.
 * This transforms proof verification from a bureaucratic process
 * into an emotional, shareable experience.
 */

// ═══════════════════════════════════════════════════
// CEREMONY COLORS
// ═══════════════════════════════════════════════════
export const CEREMONY_COLORS = {
  // Trust Levels (Constellation)
  constellation: {
    unverified: '#6B7280', // Gray - henüz kazanılmamış
    verified: '#10B981', // Emerald - kazanılmış
    glowing: '#34D399', // Lighter emerald - aktif glow
    connection: 'rgba(16, 185, 129, 0.3)', // Yıldızlar arası çizgi
    starCenter: '#FFFFFF', // Yıldız merkezi
    orbitPath: 'rgba(16, 185, 129, 0.15)', // Orbit çizgisi
  },

  // Sunset Clock phases
  sunset: {
    peaceful: '#FCD34D', // 7+ gün kalan - sarı
    golden: '#F59E0B', // 3 gün kalan - amber
    warning: '#F97316', // 24 saat kalan - orange
    urgent: '#EF4444', // 6 saat kalan - red
    twilight: '#7C3AED', // Son 1 saat - purple
    expired: '#1E1B4B', // Süre doldu - gece
  },

  // Sunset sky gradients
  sky: {
    peaceful: ['#87CEEB', '#FCD34D', '#F59E0B'],
    golden: ['#FCD34D', '#F59E0B', '#EA580C'],
    warning: ['#F97316', '#EA580C', '#DC2626'],
    urgent: ['#DC2626', '#991B1B', '#7C3AED'],
    twilight: ['#7C3AED', '#4C1D95', '#1E1B4B'],
    expired: ['#1E1B4B', '#0F0F23', '#000000'],
  },

  // Passport
  passport: {
    cover: '#1E3A5F', // Koyu mavi pasaport kapağı
    coverAccent: '#2563EB', // Accent çizgiler
    coverGold: '#D4AF37', // Altın page indicator
    pages: '#FEF3C7', // Krem sayfa rengi
    pageLines: 'rgba(0, 0, 0, 0.1)', // Sayfa çizgileri
    binding: '#1E293B', // Cilt kenarı
    stamp: {
      email: '#3B82F6', // Mavi damga
      phone: '#10B981', // Yeşil damga
      id: '#F59E0B', // Altın damga
      bank: '#8B5CF6', // Mor holografik
      gift: '#EC4899', // Magenta damga
    },
  },

  // Sacred Moments
  sacred: {
    blur: 'rgba(0, 0, 0, 0.85)',
    vaultGlow: 'rgba(236, 72, 153, 0.2)', // Magenta glow
    lockIcon: '#EC4899',
    shareButton: '#F59E0B',
    watermark: 'rgba(255, 255, 255, 0.15)',
  },

  // Authenticator
  authenticator: {
    scanning: '#3B82F6', // Mavi tarama çizgisi
    analyzing: '#F59E0B', // Amber analiz
    verified: '#10B981', // Yeşil onay
    rejected: '#EF4444', // Kırmızı ret
    needsReview: '#F97316', // Turuncu inceleme
  },

  // Celebration
  celebration: {
    confetti: ['#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#8B5CF6'],
    sparkle: '#FCD34D',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
} as const;

// ═══════════════════════════════════════════════════
// CEREMONY TIMING
// ═══════════════════════════════════════════════════
export const CEREMONY_TIMING = {
  // Constellation
  constellationDraw: 2000, // Yıldız çizim süresi
  starFadeIn: 300, // Tek yıldız fade-in
  starStagger: 150, // Yıldızlar arası gecikme
  connectionDraw: 800, // Bağlantı çizgisi çizimi
  glowPulse: 2000, // Glow pulse döngüsü

  // Sunset Clock
  sunsetTransition: 500, // Renk geçiş süresi
  sunMove: 60000, // Güneş hareket güncelleme (1 dk)
  phaseChange: 300, // Faz değişim animasyonu

  // Passport
  passportFlip: 800, // Sayfa çevirme
  stampPress: 300, // Damga basma
  stampBounce: 150, // Damga bounce
  hologramShimmer: 3000, // Hologram parlaması

  // Authenticator
  authenticatorScan: 3000, // AI tarama animasyonu
  scanLineSpeed: 2000, // Tarama çizgisi hızı
  checklistItemDelay: 400, // Checklist item gecikme
  resultReveal: 500, // Sonuç gösterimi

  // Sacred Moments
  blurTransition: 300, // Blur geçişi
  messageReveal: 200, // Mesaj gösterimi
  unblurDelay: 3000, // Blur kaldırma gecikmesi

  // Celebration
  celebrationBurst: 1500, // Konfeti patlaması
  confettiDuration: 3000, // Konfeti süresi
  successIconZoom: 400, // Başarı ikonu zoom
  cardGeneration: 1000, // Kart oluşturma

  // Flow transitions
  stepTransition: 400, // Adımlar arası geçiş
  modalOpen: 300, // Modal açılma
  modalClose: 200, // Modal kapanma
} as const;

// ═══════════════════════════════════════════════════
// TRUST MILESTONES
// ═══════════════════════════════════════════════════
export type TrustMilestoneType =
  | 'email'
  | 'phone'
  | 'id'
  | 'bank'
  | 'firstGift'
  | 'fiveGifts'
  | 'tenGifts'
  | 'firstProof';

export interface TrustMilestone {
  id: string;
  type: TrustMilestoneType;
  verified: boolean;
  verifiedAt?: Date;
  label: string;
  icon: string; // MaterialCommunityIcons name
  position: { x: number; y: number }; // Constellation pozisyonu (0-1 normalized)
  connections: string[]; // Bağlı olduğu milestone id'leri
}

export const DEFAULT_MILESTONES: TrustMilestone[] = [
  {
    id: 'email',
    type: 'email',
    verified: false,
    label: 'İletişim Doğrulandı',
    icon: 'email-check',
    position: { x: 0.5, y: 0.1 },
    connections: ['phone', 'id'],
  },
  {
    id: 'phone',
    type: 'phone',
    verified: false,
    label: 'Hesap Güvenliği',
    icon: 'phone-check',
    position: { x: 0.25, y: 0.3 },
    connections: ['email', 'bank'],
  },
  {
    id: 'id',
    type: 'id',
    verified: false,
    label: 'Kimlik Doğrulaması',
    icon: 'card-account-details',
    position: { x: 0.75, y: 0.3 },
    connections: ['email', 'bank'],
  },
  {
    id: 'bank',
    type: 'bank',
    verified: false,
    label: 'Ödeme Güvenilirliği',
    icon: 'bank-check',
    position: { x: 0.5, y: 0.5 },
    connections: ['phone', 'id', 'firstGift'],
  },
  {
    id: 'firstGift',
    type: 'firstGift',
    verified: false,
    label: 'İlk Anı Hediyesi',
    icon: 'gift',
    position: { x: 0.3, y: 0.7 },
    connections: ['bank', 'fiveGifts'],
  },
  {
    id: 'fiveGifts',
    type: 'fiveGifts',
    verified: false,
    label: 'Hediye Tutarlılığı',
    icon: 'gift-open',
    position: { x: 0.5, y: 0.75 },
    connections: ['firstGift', 'tenGifts', 'firstProof'],
  },
  {
    id: 'tenGifts',
    type: 'tenGifts',
    verified: false,
    label: 'Anı Ustası',
    icon: 'star',
    position: { x: 0.7, y: 0.7 },
    connections: ['fiveGifts'],
  },
  {
    id: 'firstProof',
    type: 'firstProof',
    verified: false,
    label: 'Anı Doğrulaması',
    icon: 'camera-check',
    position: { x: 0.5, y: 0.9 },
    connections: ['fiveGifts'],
  },
];

// ═══════════════════════════════════════════════════
// SUNSET PHASES
// ═══════════════════════════════════════════════════
export type SunsetPhase =
  | 'peaceful'
  | 'golden'
  | 'warning'
  | 'urgent'
  | 'twilight'
  | 'expired';

export const SUNSET_PHASE_THRESHOLDS = {
  peaceful: 72, // 72+ saat (3+ gün)
  golden: 24, // 24-72 saat (1-3 gün)
  warning: 6, // 6-24 saat
  urgent: 1, // 1-6 saat
  twilight: 0, // 0-1 saat
} as const;

export const SUNSET_PHASE_MESSAGES: Record<SunsetPhase, string> = {
  peaceful: 'Bol zamanın var',
  golden: 'Deneyimini paylaşmayı unutma',
  warning: 'Son 24 saat!',
  urgent: 'Acele et!',
  twilight: 'Son dakikalar...',
  expired: 'Süre doldu',
};

// ═══════════════════════════════════════════════════
// PASSPORT STAMPS
// ═══════════════════════════════════════════════════
export interface PassportStamp {
  id: string;
  type: 'email' | 'phone' | 'id' | 'bank';
  verified: boolean;
  verifiedAt?: Date;
  country?: string;
}

export const STAMP_LABELS: Record<PassportStamp['type'], string> = {
  email: 'EMAIL VERIFIED',
  phone: 'PHONE VERIFIED',
  id: 'ID VERIFIED',
  bank: 'BANK CONNECTED',
};

// ═══════════════════════════════════════════════════
// AUTHENTICATOR STATES
// ═══════════════════════════════════════════════════
export type AuthPhase =
  | 'uploading'
  | 'scanning'
  | 'analyzing'
  | 'verifying'
  | 'complete';

export const AUTH_PHASE_PROGRESS: Record<AuthPhase, number> = {
  uploading: 20,
  scanning: 50,
  analyzing: 80,
  verifying: 95,
  complete: 100,
};

export const AUTH_PHASE_MESSAGES: Record<AuthPhase, string> = {
  uploading: 'Fotoğraflar yükleniyor...',
  scanning: 'Görüntü taranıyor...',
  analyzing: 'AI anınızı analiz ediyor...',
  verifying: 'Doğrulama tamamlanıyor...',
  complete: 'Tamamlandı!',
};

export const AUTH_CHECKLIST_ITEMS = [
  { id: 'location', label: 'Konum kontrol ediliyor', icon: 'map-marker-check' },
  { id: 'date', label: 'Tarih doğrulanıyor', icon: 'calendar-check' },
  { id: 'scene', label: 'Sahnelik analiz ediliyor', icon: 'image-search' },
  {
    id: 'authenticity',
    label: 'Özgünlük kontrol ediliyor',
    icon: 'shield-check',
  },
] as const;

// ═══════════════════════════════════════════════════
// CEREMONY FLOW
// ═══════════════════════════════════════════════════
export type CeremonyStep =
  | 'intro'
  | 'capture'
  | 'authenticate'
  | 'thank-you'
  | 'celebrate';

export const CEREMONY_STEP_ORDER: CeremonyStep[] = [
  'intro',
  'capture',
  'authenticate',
  'thank-you',
  'celebrate',
];

export const CEREMONY_STEP_LABELS: Record<CeremonyStep, string> = {
  intro: 'Başla',
  capture: 'Fotoğraf',
  authenticate: 'Doğrulama',
  'thank-you': 'Teşekkür',
  celebrate: 'Kutlama',
};

// ═══════════════════════════════════════════════════
// THANK YOU CARD TEMPLATES
// ═══════════════════════════════════════════════════
export interface CardTemplate {
  id: string;
  name: string;
  gradient: readonly [string, string] | readonly [string, string, string];
  textColor: string;
  accentColor: string;
}

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'sunset',
    name: 'Gün Batımı',
    gradient: ['#FCD34D', '#F59E0B', '#EC4899'] as const,
    textColor: '#FFFFFF',
    accentColor: '#FCD34D',
  },
  {
    id: 'love',
    name: 'Aşk',
    gradient: ['#F472B6', '#EC4899'] as const,
    textColor: '#FFFFFF',
    accentColor: '#FDF2F8',
  },
  {
    id: 'adventure',
    name: 'Macera',
    gradient: ['#14B8A6', '#0D9488'] as const,
    textColor: '#FFFFFF',
    accentColor: '#CCFBF1',
  },
  {
    id: 'gratitude',
    name: 'Minnettarlık',
    gradient: ['#34D399', '#10B981'] as const,
    textColor: '#FFFFFF',
    accentColor: '#D1FAE5',
  },
  {
    id: 'golden',
    name: 'Altın',
    gradient: ['#FBBF24', '#F59E0B'] as const,
    textColor: '#78350F',
    accentColor: '#FFFBEB',
  },
  {
    id: 'twilight',
    name: 'Alacakaranlık',
    gradient: ['#8B5CF6', '#7C3AED'] as const,
    textColor: '#FFFFFF',
    accentColor: '#EDE9FE',
  },
];

// ═══════════════════════════════════════════════════
// COMPONENT SIZES
// ═══════════════════════════════════════════════════
export const CEREMONY_SIZES = {
  constellation: {
    sm: 120,
    md: 180,
    lg: 240,
  },
  sunsetClock: {
    compact: 80,
    full: 200,
  },
  passport: {
    width: 280,
    height: 400,
  },
  stamp: {
    size: 60,
  },
  memoryCard: {
    width: 300,
    height: 420,
  },
  thankYouCard: {
    width: 320,
    height: 200,
  },
} as const;

// ═══════════════════════════════════════════════════
// ACCESSIBILITY
// ═══════════════════════════════════════════════════
export const CEREMONY_A11Y = {
  labels: {
    trustConstellation: 'Güven yıldız haritası',
    sunsetClock: 'Geri sayım saati',
    passport: 'Dijital pasaport',
    authenticator: 'Fotoğraf doğrulama',
    sacredMoments: 'Korunan içerik',
    thankYouCard: 'Teşekkür kartı oluşturucu',
    memoryCard: 'Anı kartı',
  },
  hints: {
    milestoneVerified: 'Doğrulandı',
    milestonePending: 'Henüz doğrulanmadı',
    timeRemaining: (time: string) => `Kalan süre: ${time}`,
    screenshotBlocked: 'Ekran görüntüsü engellendi',
  },
} as const;

// ═══════════════════════════════════════════════════
// HAPTIC PATTERNS
// ═══════════════════════════════════════════════════
export const CEREMONY_HAPTICS = {
  milestoneUnlock: 'success', // Milestone kazanıldığında
  stampPress: 'heavy', // Damga basıldığında
  pageFlip: 'light', // Sayfa çevrildiğinde
  phaseChange: 'warning', // Sunset faz değişiminde
  screenshotBlock: 'warning', // Screenshot engellendiğinde
  verificationSuccess: 'success', // Doğrulama başarılı
  verificationFail: 'error', // Doğrulama başarısız
  celebration: 'success', // Kutlama
} as const;

export type HapticType =
  (typeof CEREMONY_HAPTICS)[keyof typeof CEREMONY_HAPTICS];
