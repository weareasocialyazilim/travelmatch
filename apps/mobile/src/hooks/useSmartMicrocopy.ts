/**
 * useSmartMicrocopy - Dynamic Contextual Greetings
 *
 * Generates personalized, silk-smooth micro-copy based on:
 * - Time of day (morning, afternoon, evening, night)
 * - User location (city name)
 * - User state (wallet balance, trust score, activity)
 * - Special occasions
 *
 * Features:
 * - Turkish language support
 * - Poetic, premium tone
 * - Emoji integration ✨
 * - Context-aware messaging
 *
 * Usage:
 * const { greeting, subtext } = useSmartMicrocopy({
 *   userName: 'Kemal',
 *   city: 'Istanbul',
 *   walletBalance: 2500,
 * });
 */

import { useMemo } from 'react';

interface SmartMicrocopyConfig {
  /** User's first name */
  userName?: string;
  /** User's city */
  city?: string;
  /** Current wallet balance */
  walletBalance?: number;
  /** Trust score (0-100) */
  trustScore?: number;
  /** Number of active moments */
  activeMoments?: number;
  /** Last activity date */
  lastActive?: Date;
  /** Is user verified */
  isVerified?: boolean;
}

interface SmartMicrocopyResult {
  /** Main greeting text */
  greeting: string;
  /** Optional subtext/subtitle */
  subtext?: string;
}

/**
 * Get time of day category
 */
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

/**
 * Get season (for future seasonal messages)
 */
const getSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

/**
 * Time-based greetings
 */
const TIME_GREETINGS = {
  morning: [
    (city: string, name: string) => `${city}'de ipeksi bir sabah ${name} ✨`,
    (city: string, name: string) =>
      `Günaydın ${name}, ${city} seni bekliyor 🌅`,
    (city: string, name: string) => `${city}'de yeni bir gün, ${name} ☀️`,
    (_city: string, name: string) => `Sabah enerjiyle dolu ${name} 🌤️`,
  ],
  afternoon: [
    (city: string, name: string) =>
      `${city}'de öğleden sonra parıltısı ${name} ✨`,
    (city: string, name: string) => `İyi öğlenler ${name}, ${city} canlı 🌞`,
    (_city: string, name: string) => `Öğle vakti keşif zamanı ${name} 🎯`,
  ],
  evening: [
    (city: string, name: string) => `${city}'de akşam ışıltısı ${name} 🌆`,
    (city: string, name: string) =>
      `İyi akşamlar ${name}, şehir sana merhaba diyor 🌃`,
    (_city: string, name: string) => `Akşam büyüsü başlıyor ${name} ✨`,
  ],
  night: [
    (city: string, name: string) => `${city} gecesi parlıyor ${name} 🌙`,
    (_city: string, name: string) => `Gece keşiflerine hazır ${name} ⭐`,
    (_city: string, name: string) => `Gecenin sırrı seninle ${name} 🌌`,
  ],
};

/**
 * Wallet balance-based messages
 */
const WALLET_MESSAGES = [
  (balance: number) =>
    balance > 1000 ? `Bugün kazancın parlıyor 💎` : undefined,
  (balance: number) =>
    balance > 500 ? `Cüzdanında ${balance} TL ✨` : undefined,
  (balance: number) =>
    balance === 0 ? `Yeni bir başlangıç zamanı 🌱` : undefined,
];

/**
 * Trust score-based messages
 */
const TRUST_MESSAGES = [
  (score: number) => (score >= 80 ? `Güven skoru parlıyor ⭐` : undefined),
  (score: number) => (score >= 50 ? `Doğrulamalar artıyor 🛡️` : undefined),
  (score: number) =>
    score < 30 ? `Doğrulama yaparak güven kazan 🎯` : undefined,
];

/**
 * Activity-based messages
 */
const ACTIVITY_MESSAGES = [
  (count: number) => (count > 5 ? `${count} aktif anın var 🎪` : undefined),
  (count: number) => (count > 0 ? `Anlarda hareketlilik var 🌟` : undefined),
  (count: number) => (count === 0 ? `İlk anını oluştur ✨` : undefined),
];

export const useSmartMicrocopy = ({
  userName = 'Explorer',
  city = 'şehir',
  walletBalance = 0,
  trustScore = 0,
  activeMoments = 0,
  lastActive,
  isVerified = false,
}: SmartMicrocopyConfig = {}): SmartMicrocopyResult => {
  const timeOfDay = getTimeOfDay();
  const season = getSeason();

  const result = useMemo(() => {
    // Select time-based greeting
    const greetings = TIME_GREETINGS[timeOfDay];
    const randomIndex = Math.floor(Math.random() * greetings.length);
    const greeting = greetings[randomIndex](city, userName);

    // Generate contextual subtext
    let subtext: string | undefined;

    // Priority: Wallet > Trust > Activity
    if (walletBalance !== undefined) {
      for (const getMessage of WALLET_MESSAGES) {
        const message = getMessage(walletBalance);
        if (message) {
          subtext = message;
          break;
        }
      }
    }

    if (!subtext && trustScore !== undefined) {
      for (const getMessage of TRUST_MESSAGES) {
        const message = getMessage(trustScore);
        if (message) {
          subtext = message;
          break;
        }
      }
    }

    if (!subtext && activeMoments !== undefined) {
      for (const getMessage of ACTIVITY_MESSAGES) {
        const message = getMessage(activeMoments);
        if (message) {
          subtext = message;
          break;
        }
      }
    }

    // Verified users get special treatment
    if (isVerified && !subtext) {
      subtext = `Doğrulanmış üye ✓`;
    }

    return {
      greeting,
      subtext,
    };
  }, [
    userName,
    city,
    walletBalance,
    trustScore,
    activeMoments,
    isVerified,
    timeOfDay,
  ]);

  return result;
};

/**
 * Specific use case: Profile screen header
 */
export const useProfileMicrocopy = (config: SmartMicrocopyConfig) => {
  return useSmartMicrocopy(config);
};

/**
 * Specific use case: Discover screen header
 */
export const useDiscoverMicrocopy = (config: SmartMicrocopyConfig) => {
  const base = useSmartMicrocopy(config);

  // Override with discovery-specific messages if needed
  return {
    ...base,
    greeting: base.greeting.replace('Explorer', config.userName || 'Explorer'),
  };
};
