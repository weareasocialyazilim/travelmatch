/**
 * TravelMatch SEO Engine - "The Neural Mesh"
 * God-Mode Metadata Generator for pSEO Domination
 *
 * This engine generates dynamic metadata for every city/intent combination,
 * feeding Google's algorithm with semantically rich, entity-optimized content.
 */

import type { Metadata } from 'next';

// ============================================================================
// CONFIGURATION: Global Cities, Intents, and Languages
// ============================================================================

export const SUPPORTED_LANGUAGES = [
  'en',
  'tr',
  'ar',
  'de',
  'fr',
  'es',
  'ru',
  'it',
  'pt',
  'ja',
  'ko',
] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const GLOBAL_CITIES = [
  // Tier 1: Premium Markets
  'london',
  'new-york',
  'dubai',
  'paris',
  'tokyo',
  'singapore',
  'hong-kong',
  'los-angeles',
  'miami',
  'san-francisco',
  // Tier 2: High-Growth Markets
  'istanbul',
  'berlin',
  'barcelona',
  'amsterdam',
  'rome',
  'milan',
  'madrid',
  'vienna',
  'zurich',
  'munich',
  // Tier 3: Emerging Luxury
  'bali',
  'ibiza',
  'maldives',
  'monaco',
  'saint-tropez',
  'mykonos',
  'santorini',
  'amalfi',
  'capri',
  'portofino',
  // Tier 4: Social Hubs
  'seoul',
  'bangkok',
  'kuala-lumpur',
  'jakarta',
  'manila',
  'ho-chi-minh',
  'taipei',
  'osaka',
  'sydney',
  'melbourne',
  // Tier 5: Middle East & Africa
  'abu-dhabi',
  'doha',
  'riyadh',
  'jeddah',
  'cairo',
  'casablanca',
  'johannesburg',
  'cape-town',
  'lagos',
  'nairobi',
  // Tier 6: Americas
  'sao-paulo',
  'rio-de-janeiro',
  'buenos-aires',
  'mexico-city',
  'bogota',
  'lima',
  'santiago',
  'toronto',
  'vancouver',
  'montreal',
] as const;

export type GlobalCity = (typeof GLOBAL_CITIES)[number];

export const INTENT_CATEGORIES = [
  // Primary Intents (High Search Volume)
  'dating-match',
  'love-fortune',
  'gifting-moment',
  'travel-match',
  'instant-love',
  'fortune-connection',
  // Secondary Intents (Long-tail Keywords)
  'luxury-dating',
  'elite-match',
  'vip-access',
  'premium-gifting',
  'social-fortune',
  'travel-buddy',
  // Action-Oriented Intents
  'skip-queue',
  'instant-access',
  'unlock-moment',
  'hack-dating',
  'fast-match',
  'direct-connect',
] as const;

export type IntentCategory = (typeof INTENT_CATEGORIES)[number];

// ============================================================================
// DICTIONARIES: Multi-language Content Generation
// ============================================================================

interface LanguageDictionary {
  intents: Record<string, string>;
  actions: Record<string, string>;
  descriptions: Record<string, string>;
  cta: string;
  tagline: string;
}

const DICTIONARIES: Record<SupportedLanguage, LanguageDictionary> = {
  en: {
    intents: {
      'dating-match': 'Match & Meet Instantly',
      'love-fortune': 'Unlock Love & Fortune',
      'gifting-moment': 'Gift to Match Moments',
      'travel-match': 'Elite Travel Matching',
      'instant-love': 'Instant Love Connection',
      'fortune-connection': 'Fortune-Based Matching',
      'luxury-dating': 'Luxury Dating Experience',
      'elite-match': 'Elite Social Matching',
      'vip-access': 'VIP Access Dating',
      'premium-gifting': 'Premium Gifting Economy',
      'social-fortune': 'Social Fortune Network',
      'travel-buddy': 'Travel Buddy Finder',
      'skip-queue': 'Skip the Dating Queue',
      'instant-access': 'Instant Social Access',
      'unlock-moment': 'Unlock Exclusive Moments',
      'hack-dating': 'Hack Dating Algorithms',
      'fast-match': 'Fast Track Matching',
      'direct-connect': 'Direct Connection Hub',
    },
    actions: {
      unlock: 'Unlock Now',
      match: 'Match Instantly',
      gift: 'Send Gift',
      discover: 'Discover Moments',
    },
    descriptions: {
      default:
        'Skip the queue and unlock exclusive moments through our gifting economy. Find love, fortune, and travel connections instantly.',
      dating:
        'Why wait for likes? Use gifting to hack dating algorithms and connect with verified profiles in seconds.',
      travel:
        'Find your perfect travel buddy through moment-based matching. Real experiences, real connections.',
      luxury:
        'Access the elite social network. Premium moments, VIP experiences, and high-value connections.',
    },
    cta: 'Hack the Queue',
    tagline: "The World's Fastest Social Discovery Platform",
  },
  tr: {
    intents: {
      'dating-match': 'Anında Eşleş ve Tanış',
      'love-fortune': 'Aşkı ve Şansı Yakala',
      'gifting-moment': 'Hediye Gönder, Momenti Yakala',
      'travel-match': 'Lüks Seyahat Eşleşmesi',
      'instant-love': 'Anlık Aşk Bağlantısı',
      'fortune-connection': 'Şans Tabanlı Eşleşme',
      'luxury-dating': 'Lüks Tanışma Deneyimi',
      'elite-match': 'Elit Sosyal Eşleşme',
      'vip-access': 'VIP Erişim',
      'premium-gifting': 'Premium Hediyeleşme',
      'social-fortune': 'Sosyal Şans Ağı',
      'travel-buddy': 'Seyahat Arkadaşı Bul',
      'skip-queue': 'Sırayı Atla',
      'instant-access': 'Anlık Sosyal Erişim',
      'unlock-moment': 'Özel Momentları Aç',
      'hack-dating': 'Dating Algoritmasını Hackle',
      'fast-match': 'Hızlı Eşleşme',
      'direct-connect': 'Direkt Bağlantı',
    },
    actions: {
      unlock: 'Kilidi Aç',
      match: 'Anında Eşleş',
      gift: 'Hediye Gönder',
      discover: 'Momentları Keşfet',
    },
    descriptions: {
      default:
        'Sırayı hackle ve hediyeleşme ekonomisiyle özel momentların kilidini aç. Aşkı, şansı ve seyahat bağlantılarını anında bul.',
      dating:
        'Beğeni beklemeyi bırak. Gifting sistemiyle dating algoritmalarını hackle ve doğrulanmış profillerle saniyeler içinde bağlan.',
      travel:
        'Moment tabanlı eşleşmeyle mükemmel seyahat arkadaşını bul. Gerçek deneyimler, gerçek bağlantılar.',
      luxury:
        'Elit sosyal ağa eriş. Premium momentlar, VIP deneyimler ve yüksek değerli bağlantılar.',
    },
    cta: 'Sırayı Hackle',
    tagline: 'Dünyanın En Hızlı Sosyal Keşif Platformu',
  },
  ar: {
    intents: {
      'dating-match': 'تطابق فوري',
      'love-fortune': 'اكتشف الحب والحظ',
      'gifting-moment': 'أهدِ لتتطابق',
      'travel-match': 'رفيق سفر فاخر',
      'instant-love': 'اتصال حب فوري',
      'fortune-connection': 'مطابقة قائمة على الحظ',
      'luxury-dating': 'تجربة مواعدة فاخرة',
      'elite-match': 'مطابقة النخبة',
      'vip-access': 'وصول VIP',
      'premium-gifting': 'اقتصاد الهدايا المميزة',
      'social-fortune': 'شبكة الحظ الاجتماعي',
      'travel-buddy': 'ابحث عن رفيق سفر',
      'skip-queue': 'تخطى الطابور',
      'instant-access': 'وصول اجتماعي فوري',
      'unlock-moment': 'افتح اللحظات الحصرية',
      'hack-dating': 'اخترق خوارزميات المواعدة',
      'fast-match': 'مطابقة سريعة',
      'direct-connect': 'اتصال مباشر',
    },
    actions: {
      unlock: 'افتح الآن',
      match: 'تطابق فوراً',
      gift: 'أرسل هدية',
      discover: 'اكتشف اللحظات',
    },
    descriptions: {
      default:
        'تخطى الطابور وافتح اللحظات الحصرية من خلال اقتصاد الهدايا. اعثر على الحب والحظ والسفر فوراً.',
      dating:
        'لماذا تنتظر الإعجابات؟ استخدم الهدايا لاختراق خوارزميات المواعدة.',
      travel:
        'اعثر على رفيق السفر المثالي من خلال المطابقة القائمة على اللحظات.',
      luxury: 'الوصول إلى شبكة النخبة الاجتماعية. لحظات متميزة وتجارب VIP.',
    },
    cta: 'تخطى الطابور',
    tagline: 'أسرع منصة اكتشاف اجتماعي في العالم',
  },
  de: {
    intents: {
      'dating-match': 'Sofort Matchen & Treffen',
      'love-fortune': 'Liebe & Glück Entdecken',
      'gifting-moment': 'Schenken zum Matchen',
      'travel-match': 'Elite Reise-Matching',
      'instant-love': 'Sofortige Liebesverbindung',
      'fortune-connection': 'Glücksbasiertes Matching',
      'luxury-dating': 'Luxus-Dating-Erlebnis',
      'elite-match': 'Elite Social Matching',
      'vip-access': 'VIP-Zugang Dating',
      'premium-gifting': 'Premium Geschenk-Ökonomie',
      'social-fortune': 'Soziales Glücksnetzwerk',
      'travel-buddy': 'Reisepartner Finden',
      'skip-queue': 'Warteschlange Überspringen',
      'instant-access': 'Sofortiger Sozialer Zugang',
      'unlock-moment': 'Exklusive Momente Freischalten',
      'hack-dating': 'Dating-Algorithmen Hacken',
      'fast-match': 'Schnelles Matching',
      'direct-connect': 'Direkte Verbindung',
    },
    actions: {
      unlock: 'Jetzt Freischalten',
      match: 'Sofort Matchen',
      gift: 'Geschenk Senden',
      discover: 'Momente Entdecken',
    },
    descriptions: {
      default:
        'Überspringe die Warteschlange und schalte exklusive Momente durch unsere Geschenk-Ökonomie frei.',
      dating:
        'Warum auf Likes warten? Nutze Gifting, um Dating-Algorithmen zu hacken.',
      travel:
        'Finde deinen perfekten Reisepartner durch moment-basiertes Matching.',
      luxury: 'Zugang zum Elite-Netzwerk. Premium Momente und VIP-Erlebnisse.',
    },
    cta: 'Warteschlange Hacken',
    tagline: 'Die Schnellste Soziale Entdeckungsplattform der Welt',
  },
  fr: {
    intents: {
      'dating-match': 'Matcher Instantanément',
      'love-fortune': 'Découvrir Amour & Fortune',
      'gifting-moment': 'Offrir pour Matcher',
      'travel-match': 'Matching Voyage Élite',
      'instant-love': 'Connexion Amour Instantanée',
      'fortune-connection': 'Matching Basé sur la Chance',
      'luxury-dating': 'Expérience Dating Luxe',
      'elite-match': 'Matching Social Élite',
      'vip-access': 'Accès VIP Dating',
      'premium-gifting': 'Économie Cadeaux Premium',
      'social-fortune': 'Réseau Fortune Sociale',
      'travel-buddy': 'Trouver Compagnon Voyage',
      'skip-queue': 'Passer la File',
      'instant-access': 'Accès Social Instantané',
      'unlock-moment': 'Débloquer Moments Exclusifs',
      'hack-dating': 'Hacker les Algorithmes Dating',
      'fast-match': 'Matching Rapide',
      'direct-connect': 'Connexion Directe',
    },
    actions: {
      unlock: 'Débloquer',
      match: 'Matcher Maintenant',
      gift: 'Envoyer Cadeau',
      discover: 'Découvrir Moments',
    },
    descriptions: {
      default:
        'Passez la file et débloquez des moments exclusifs grâce à notre économie de cadeaux.',
      dating:
        'Pourquoi attendre les likes? Utilisez le gifting pour hacker les algorithmes de dating.',
      travel:
        'Trouvez votre compagnon de voyage idéal grâce au matching basé sur les moments.',
      luxury:
        'Accédez au réseau social élite. Moments premium et expériences VIP.',
    },
    cta: 'Hacker la File',
    tagline: 'La Plateforme de Découverte Sociale la Plus Rapide au Monde',
  },
  es: {
    intents: {
      'dating-match': 'Match Instantáneo',
      'love-fortune': 'Descubre Amor y Fortuna',
      'gifting-moment': 'Regala para Matchear',
      'travel-match': 'Match de Viaje Élite',
      'instant-love': 'Conexión de Amor Instantánea',
      'fortune-connection': 'Match Basado en la Suerte',
      'luxury-dating': 'Experiencia Dating de Lujo',
      'elite-match': 'Match Social Élite',
      'vip-access': 'Acceso VIP Dating',
      'premium-gifting': 'Economía de Regalos Premium',
      'social-fortune': 'Red de Fortuna Social',
      'travel-buddy': 'Encontrar Compañero de Viaje',
      'skip-queue': 'Saltar la Cola',
      'instant-access': 'Acceso Social Instantáneo',
      'unlock-moment': 'Desbloquear Momentos Exclusivos',
      'hack-dating': 'Hackear Algoritmos de Citas',
      'fast-match': 'Match Rápido',
      'direct-connect': 'Conexión Directa',
    },
    actions: {
      unlock: 'Desbloquear',
      match: 'Matchear Ahora',
      gift: 'Enviar Regalo',
      discover: 'Descubrir Momentos',
    },
    descriptions: {
      default:
        'Salta la cola y desbloquea momentos exclusivos a través de nuestra economía de regalos.',
      dating:
        '¿Por qué esperar likes? Usa el gifting para hackear los algoritmos de citas.',
      travel:
        'Encuentra tu compañero de viaje perfecto a través del matching basado en momentos.',
      luxury:
        'Accede a la red social élite. Momentos premium y experiencias VIP.',
    },
    cta: 'Hackear la Cola',
    tagline: 'La Plataforma de Descubrimiento Social Más Rápida del Mundo',
  },
  ru: {
    intents: {
      'dating-match': 'Мгновенное Совпадение',
      'love-fortune': 'Найди Любовь и Удачу',
      'gifting-moment': 'Дари для Совпадения',
      'travel-match': 'Элитное Тревел-Совпадение',
      'instant-love': 'Мгновенная Связь Любви',
      'fortune-connection': 'Совпадение на Удачу',
      'luxury-dating': 'Люксовое Знакомство',
      'elite-match': 'Элитное Социальное Совпадение',
      'vip-access': 'VIP Доступ к Знакомствам',
      'premium-gifting': 'Премиум Экономика Подарков',
      'social-fortune': 'Социальная Сеть Удачи',
      'travel-buddy': 'Найти Попутчика',
      'skip-queue': 'Пропустить Очередь',
      'instant-access': 'Мгновенный Социальный Доступ',
      'unlock-moment': 'Разблокировать Эксклюзивные Моменты',
      'hack-dating': 'Взломать Алгоритмы Знакомств',
      'fast-match': 'Быстрое Совпадение',
      'direct-connect': 'Прямое Подключение',
    },
    actions: {
      unlock: 'Разблокировать',
      match: 'Совпасть Сейчас',
      gift: 'Отправить Подарок',
      discover: 'Открыть Моменты',
    },
    descriptions: {
      default:
        'Пропусти очередь и разблокируй эксклюзивные моменты через нашу экономику подарков.',
      dating:
        'Зачем ждать лайков? Используй подарки, чтобы взломать алгоритмы знакомств.',
      travel: 'Найди идеального попутчика через совпадение на основе моментов.',
      luxury: 'Доступ к элитной социальной сети. Премиум моменты и VIP опыт.',
    },
    cta: 'Взломать Очередь',
    tagline: 'Самая Быстрая Платформа Социального Открытия в Мире',
  },
  it: {
    intents: {
      'dating-match': 'Match Istantaneo',
      'love-fortune': 'Scopri Amore e Fortuna',
      'gifting-moment': 'Regala per Matchare',
      'travel-match': 'Match Viaggio Elite',
      'instant-love': 'Connessione Amore Istantanea',
      'fortune-connection': 'Match Basato sulla Fortuna',
      'luxury-dating': 'Esperienza Dating di Lusso',
      'elite-match': 'Match Sociale Elite',
      'vip-access': 'Accesso VIP Dating',
      'premium-gifting': 'Economia Regali Premium',
      'social-fortune': 'Rete Fortuna Sociale',
      'travel-buddy': 'Trova Compagno di Viaggio',
      'skip-queue': 'Salta la Coda',
      'instant-access': 'Accesso Sociale Istantaneo',
      'unlock-moment': 'Sblocca Momenti Esclusivi',
      'hack-dating': 'Hackerare Algoritmi Dating',
      'fast-match': 'Match Veloce',
      'direct-connect': 'Connessione Diretta',
    },
    actions: {
      unlock: 'Sblocca',
      match: 'Matcha Ora',
      gift: 'Invia Regalo',
      discover: 'Scopri Momenti',
    },
    descriptions: {
      default:
        'Salta la coda e sblocca momenti esclusivi attraverso la nostra economia dei regali.',
      dating:
        'Perché aspettare i like? Usa il gifting per hackerare gli algoritmi di dating.',
      travel:
        'Trova il tuo compagno di viaggio perfetto attraverso il matching basato sui momenti.',
      luxury:
        'Accedi alla rete sociale elite. Momenti premium ed esperienze VIP.',
    },
    cta: 'Hackerare la Coda',
    tagline: 'La Piattaforma di Scoperta Sociale Più Veloce al Mondo',
  },
  pt: {
    intents: {
      'dating-match': 'Match Instantâneo',
      'love-fortune': 'Descubra Amor e Fortuna',
      'gifting-moment': 'Presente para Matchear',
      'travel-match': 'Match de Viagem Elite',
      'instant-love': 'Conexão de Amor Instantânea',
      'fortune-connection': 'Match Baseado na Sorte',
      'luxury-dating': 'Experiência Dating de Luxo',
      'elite-match': 'Match Social Elite',
      'vip-access': 'Acesso VIP Dating',
      'premium-gifting': 'Economia de Presentes Premium',
      'social-fortune': 'Rede de Fortuna Social',
      'travel-buddy': 'Encontrar Companheiro de Viagem',
      'skip-queue': 'Pular a Fila',
      'instant-access': 'Acesso Social Instantâneo',
      'unlock-moment': 'Desbloquear Momentos Exclusivos',
      'hack-dating': 'Hackear Algoritmos de Encontros',
      'fast-match': 'Match Rápido',
      'direct-connect': 'Conexão Direta',
    },
    actions: {
      unlock: 'Desbloquear',
      match: 'Matchear Agora',
      gift: 'Enviar Presente',
      discover: 'Descobrir Momentos',
    },
    descriptions: {
      default:
        'Pule a fila e desbloqueie momentos exclusivos através da nossa economia de presentes.',
      dating:
        'Por que esperar curtidas? Use presentes para hackear os algoritmos de encontros.',
      travel:
        'Encontre seu companheiro de viagem perfeito através do matching baseado em momentos.',
      luxury:
        'Acesse a rede social elite. Momentos premium e experiências VIP.',
    },
    cta: 'Hackear a Fila',
    tagline: 'A Plataforma de Descoberta Social Mais Rápida do Mundo',
  },
  ja: {
    intents: {
      'dating-match': '即座にマッチング',
      'love-fortune': '愛と幸運を発見',
      'gifting-moment': 'ギフトでマッチング',
      'travel-match': 'エリート旅行マッチング',
      'instant-love': '即座の愛の接続',
      'fortune-connection': '運ベースのマッチング',
      'luxury-dating': 'ラグジュアリーデート体験',
      'elite-match': 'エリートソーシャルマッチング',
      'vip-access': 'VIPアクセスデート',
      'premium-gifting': 'プレミアムギフトエコノミー',
      'social-fortune': 'ソーシャルフォーチュンネットワーク',
      'travel-buddy': '旅行仲間を見つける',
      'skip-queue': '列をスキップ',
      'instant-access': '即座のソーシャルアクセス',
      'unlock-moment': '限定モーメントをアンロック',
      'hack-dating': 'デートアルゴリズムをハック',
      'fast-match': '高速マッチング',
      'direct-connect': 'ダイレクト接続',
    },
    actions: {
      unlock: 'アンロック',
      match: '今すぐマッチング',
      gift: 'ギフトを送る',
      discover: 'モーメントを発見',
    },
    descriptions: {
      default:
        '列をスキップして、ギフトエコノミーで限定モーメントをアンロック。',
      dating: 'いいねを待つ理由は？ギフトでデートアルゴリズムをハック。',
      travel: 'モーメントベースのマッチングで完璧な旅行仲間を見つける。',
      luxury:
        'エリートソーシャルネットワークにアクセス。プレミアムモーメントとVIP体験。',
    },
    cta: '列をハック',
    tagline: '世界最速のソーシャルディスカバリープラットフォーム',
  },
  ko: {
    intents: {
      'dating-match': '즉시 매칭',
      'love-fortune': '사랑과 행운 발견',
      'gifting-moment': '선물로 매칭',
      'travel-match': '엘리트 여행 매칭',
      'instant-love': '즉각적인 사랑 연결',
      'fortune-connection': '운 기반 매칭',
      'luxury-dating': '럭셔리 데이트 경험',
      'elite-match': '엘리트 소셜 매칭',
      'vip-access': 'VIP 접근 데이트',
      'premium-gifting': '프리미엄 선물 경제',
      'social-fortune': '소셜 포춘 네트워크',
      'travel-buddy': '여행 친구 찾기',
      'skip-queue': '줄 건너뛰기',
      'instant-access': '즉각적인 소셜 접근',
      'unlock-moment': '독점 모먼트 잠금 해제',
      'hack-dating': '데이트 알고리즘 해킹',
      'fast-match': '빠른 매칭',
      'direct-connect': '직접 연결',
    },
    actions: {
      unlock: '잠금 해제',
      match: '지금 매칭',
      gift: '선물 보내기',
      discover: '모먼트 발견',
    },
    descriptions: {
      default: '줄을 건너뛰고 선물 경제를 통해 독점 모먼트를 잠금 해제하세요.',
      dating: '좋아요를 기다리는 이유는? 선물로 데이트 알고리즘을 해킹하세요.',
      travel: '모먼트 기반 매칭으로 완벽한 여행 친구를 찾으세요.',
      luxury: '엘리트 소셜 네트워크에 접근. 프리미엄 모먼트와 VIP 경험.',
    },
    cta: '줄 해킹',
    tagline: '세계에서 가장 빠른 소셜 디스커버리 플랫폼',
  },
};

// ============================================================================
// CITY DISPLAY NAMES: Localized city names
// ============================================================================

const CITY_DISPLAY_NAMES: Record<string, Record<SupportedLanguage, string>> = {
  london: {
    en: 'London',
    tr: 'Londra',
    ar: 'لندن',
    de: 'London',
    fr: 'Londres',
    es: 'Londres',
    ru: 'Лондон',
    it: 'Londra',
    pt: 'Londres',
    ja: 'ロンドン',
    ko: '런던',
  },
  'new-york': {
    en: 'New York',
    tr: 'New York',
    ar: 'نيويورك',
    de: 'New York',
    fr: 'New York',
    es: 'Nueva York',
    ru: 'Нью-Йорк',
    it: 'New York',
    pt: 'Nova York',
    ja: 'ニューヨーク',
    ko: '뉴욕',
  },
  dubai: {
    en: 'Dubai',
    tr: 'Dubai',
    ar: 'دبي',
    de: 'Dubai',
    fr: 'Dubaï',
    es: 'Dubái',
    ru: 'Дубай',
    it: 'Dubai',
    pt: 'Dubai',
    ja: 'ドバイ',
    ko: '두바이',
  },
  paris: {
    en: 'Paris',
    tr: 'Paris',
    ar: 'باريس',
    de: 'Paris',
    fr: 'Paris',
    es: 'París',
    ru: 'Париж',
    it: 'Parigi',
    pt: 'Paris',
    ja: 'パリ',
    ko: '파리',
  },
  tokyo: {
    en: 'Tokyo',
    tr: 'Tokyo',
    ar: 'طوكيو',
    de: 'Tokio',
    fr: 'Tokyo',
    es: 'Tokio',
    ru: 'Токио',
    it: 'Tokyo',
    pt: 'Tóquio',
    ja: '東京',
    ko: '도쿄',
  },
  istanbul: {
    en: 'Istanbul',
    tr: 'İstanbul',
    ar: 'اسطنبول',
    de: 'Istanbul',
    fr: 'Istanbul',
    es: 'Estambul',
    ru: 'Стамбул',
    it: 'Istanbul',
    pt: 'Istambul',
    ja: 'イスタンブール',
    ko: '이스탄불',
  },
  berlin: {
    en: 'Berlin',
    tr: 'Berlin',
    ar: 'برلين',
    de: 'Berlin',
    fr: 'Berlin',
    es: 'Berlín',
    ru: 'Берлин',
    it: 'Berlino',
    pt: 'Berlim',
    ja: 'ベルリン',
    ko: '베를린',
  },
  miami: {
    en: 'Miami',
    tr: 'Miami',
    ar: 'ميامي',
    de: 'Miami',
    fr: 'Miami',
    es: 'Miami',
    ru: 'Майами',
    it: 'Miami',
    pt: 'Miami',
    ja: 'マイアミ',
    ko: '마이애미',
  },
  bali: {
    en: 'Bali',
    tr: 'Bali',
    ar: 'بالي',
    de: 'Bali',
    fr: 'Bali',
    es: 'Bali',
    ru: 'Бали',
    it: 'Bali',
    pt: 'Bali',
    ja: 'バリ',
    ko: '발리',
  },
  singapore: {
    en: 'Singapore',
    tr: 'Singapur',
    ar: 'سنغافورة',
    de: 'Singapur',
    fr: 'Singapour',
    es: 'Singapur',
    ru: 'Сингапур',
    it: 'Singapore',
    pt: 'Cingapura',
    ja: 'シンガポール',
    ko: '싱가포르',
  },
};

// ============================================================================
// MAIN SEO STRATEGY ENGINE
// ============================================================================

export const TM_STRATEGY = {
  /**
   * Generate full metadata for a dynamic pSEO page
   */
  getMeta: (lang: string, city: string, intent: string): Metadata => {
    const safeLang = (
      SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang : 'en'
    ) as SupportedLanguage;
    const dict = DICTIONARIES[safeLang];

    const cityDisplay =
      CITY_DISPLAY_NAMES[city]?.[safeLang] || formatCityName(city);
    const intentDisplay = dict.intents[intent] || dict.intents['dating-match'];

    const title = `${cityDisplay} | ${intentDisplay} | TravelMatch`;
    const description = generateDescription(safeLang, cityDisplay, intent);

    const keywords = generateKeywords(safeLang, city, intent);

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: getLocaleCode(safeLang),
        url: `https://travelmatch.app/${lang}/${city}/${intent}`,
        siteName: 'TravelMatch',
        images: [
          {
            url: `/api/og?city=${city}&intent=${intent}&lang=${lang}`,
            width: 1200,
            height: 630,
            alt: `${cityDisplay} - ${intentDisplay}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`/api/og?city=${city}&intent=${intent}&lang=${lang}`],
      },
      alternates: {
        canonical: `https://travelmatch.app/${lang}/${city}/${intent}`,
        languages: generateAlternateLanguages(city, intent),
      },
      other: {
        // AI Bot Signals - SGE Optimization
        'entity-type': 'Social-Financial-Exchange',
        'interaction-velocity': 'Instant',
        'trust-protocol': 'Verified-Moments-v7',
        'ai-optimization': 'high-frequency-semantic',
        category: 'Social Interaction Financialized',
      },
    };
  },

  /**
   * Get dictionary for a language
   */
  getDictionary: (lang: string): LanguageDictionary => {
    const safeLang = (
      SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang : 'en'
    ) as SupportedLanguage;
    return DICTIONARIES[safeLang];
  },

  /**
   * Get city display name
   */
  getCityName: (city: string, lang: string): string => {
    const safeLang = (
      SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang : 'en'
    ) as SupportedLanguage;
    return CITY_DISPLAY_NAMES[city]?.[safeLang] || formatCityName(city);
  },

  /**
   * Generate JSON-LD structured data for the page
   */
  getJsonLd: (lang: string, city: string, intent: string) => {
    const safeLang = (
      SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang : 'en'
    ) as SupportedLanguage;
    const dict = DICTIONARIES[safeLang];
    const cityDisplay =
      CITY_DISPLAY_NAMES[city]?.[safeLang] || formatCityName(city);
    const intentDisplay = dict.intents[intent] || dict.intents['dating-match'];

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `https://travelmatch.app/${lang}/${city}/${intent}#webpage`,
          url: `https://travelmatch.app/${lang}/${city}/${intent}`,
          name: `${cityDisplay} | ${intentDisplay} | TravelMatch`,
          description: generateDescription(safeLang, cityDisplay, intent),
          inLanguage: getLocaleCode(safeLang),
          isPartOf: {
            '@id': 'https://travelmatch.app/#website',
          },
          about: {
            '@type': 'Place',
            name: cityDisplay,
          },
        },
        {
          '@type': 'Service',
          '@id': `https://travelmatch.app/${lang}/${city}/${intent}#service`,
          name: `TravelMatch ${intentDisplay}`,
          description: dict.descriptions.default,
          provider: {
            '@id': 'https://travelmatch.app/#organization',
          },
          areaServed: {
            '@type': 'Place',
            name: cityDisplay,
          },
          serviceType: 'Social Matching Platform',
        },
        {
          '@type': 'FAQPage',
          '@id': `https://travelmatch.app/${lang}/${city}/${intent}#faq`,
          mainEntity: generateFAQs(safeLang, cityDisplay, intent),
        },
      ],
    };
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCityName(city: string): string {
  return city
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateDescription(
  lang: SupportedLanguage,
  city: string,
  intent: string,
): string {
  const dict = DICTIONARIES[lang];
  const intentType =
    intent.includes('dating') ||
    intent.includes('love') ||
    intent.includes('match')
      ? 'dating'
      : intent.includes('travel') || intent.includes('buddy')
        ? 'travel'
        : intent.includes('luxury') ||
            intent.includes('elite') ||
            intent.includes('vip')
          ? 'luxury'
          : 'default';

  return `${city} - ${dict.descriptions[intentType]} ${dict.tagline}.`;
}

function generateKeywords(
  lang: SupportedLanguage,
  city: string,
  intent: string,
): string[] {
  const baseKeywords = [
    `${city} ${intent}`,
    `travel match ${city}`,
    `gifting ${city}`,
    `dating ${city}`,
    `moments ${city}`,
    `instant match ${city}`,
    `skip queue ${city}`,
    `social gifting ${city}`,
    `fortune matching ${city}`,
    `love ${city}`,
    `travel buddy ${city}`,
    `elite dating ${city}`,
    'travelmatch',
    'instant matching 2026',
    'hack dating algorithms',
    'gifting economy',
    'moment-based dating',
    'social fortune matching',
  ];

  // Add language-specific keywords
  if (lang === 'tr') {
    baseKeywords.push(
      `${city} hızlı tanışma`,
      `${city} hediye gönder`,
      `${city} anında eşleşme`,
      'dating sırasını atla',
      'lüks sosyal ağ',
    );
  }

  return baseKeywords;
}

function getLocaleCode(lang: SupportedLanguage): string {
  const locales: Record<SupportedLanguage, string> = {
    en: 'en_US',
    tr: 'tr_TR',
    ar: 'ar_AE',
    de: 'de_DE',
    fr: 'fr_FR',
    es: 'es_ES',
    ru: 'ru_RU',
    it: 'it_IT',
    pt: 'pt_BR',
    ja: 'ja_JP',
    ko: 'ko_KR',
  };
  return locales[lang];
}

function generateAlternateLanguages(
  city: string,
  intent: string,
): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const lang of SUPPORTED_LANGUAGES) {
    alternates[getLocaleCode(lang as SupportedLanguage)] =
      `https://travelmatch.app/${lang}/${city}/${intent}`;
  }
  alternates['x-default'] = `https://travelmatch.app/en/${city}/${intent}`;
  return alternates;
}

function generateFAQs(
  lang: SupportedLanguage,
  city: string,
  _intent: string,
): Array<{
  '@type': string;
  name: string;
  acceptedAnswer: { '@type': string; text: string };
}> {
  // _intent reserved for future FAQ customization based on intent
  void _intent;
  const faqs = {
    en: [
      {
        q: `How does TravelMatch work in ${city}?`,
        a: `TravelMatch lets you skip the matching queue in ${city} by using our gifting economy. Send a gift to unlock moments and connect instantly with verified profiles.`,
      },
      {
        q: `What is moment-based matching?`,
        a: `Unlike traditional dating apps, we match based on real-world moments. Someone is having coffee in ${city}? Send them a gift and unlock the moment.`,
      },
      {
        q: `Is TravelMatch better than Tinder?`,
        a: `Yes! While Tinder relies on luck and algorithms, TravelMatch gives you direct access through our gifting economy. No more waiting for likes.`,
      },
      {
        q: `How fast can I match on TravelMatch?`,
        a: `Average matching time in ${city} is under 60 seconds. Our gifting system bypasses traditional queues entirely.`,
      },
    ],
    tr: [
      {
        q: `TravelMatch ${city}'da nasıl çalışır?`,
        a: `TravelMatch, hediyeleşme ekonomimizi kullanarak ${city}'da eşleşme sırasını atlamanı sağlar. Bir hediye gönder, momentların kilidini aç ve doğrulanmış profillerle anında bağlan.`,
      },
      {
        q: `Moment tabanlı eşleşme nedir?`,
        a: `Geleneksel dating uygulamalarının aksine, biz gerçek dünya momentlarına göre eşleştiriyoruz. ${city}'da birisi kahve içiyor mu? Ona bir hediye gönder ve momentin kilidini aç.`,
      },
      {
        q: `TravelMatch Tinder'dan daha mı iyi?`,
        a: `Evet! Tinder şansa ve algoritmalara güvenirken, TravelMatch hediyeleşme ekonomimiz aracılığıyla doğrudan erişim sağlar. Artık beğeni bekleme yok.`,
      },
      {
        q: `TravelMatch'te ne kadar hızlı eşleşebilirim?`,
        a: `${city}'da ortalama eşleşme süresi 60 saniyenin altında. Hediyeleşme sistemimiz geleneksel sıraları tamamen atlar.`,
      },
    ],
  };

  const langFaqs = faqs[lang as keyof typeof faqs] || faqs.en;

  return langFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  }));
}

// ============================================================================
// DISRUPTIVE SEO - God-Mode Metadata Generator
// CTR %400 artırmak için psikolojik tetikleyiciler içeren meta veriler
// ============================================================================

export const generateFinalMeta = (
  lang: 'tr' | 'en',
  city: string,
  _intent: string,
) => {
  void _intent; // Reserved for future intent-based SEO customization
  const cityDisplay = CITY_DISPLAY_NAMES[city]?.[lang] || formatCityName(city);

  const content = {
    tr: {
      title: `${cityDisplay} | Sırayı Hackle ve Anında Eşleş | TravelMatch`,
      desc: `${cityDisplay} konumunda bekleme listelerinden kurtul. Hediyeleşme ekonomisiyle gerçek momentların kilidini aç. Sosyal keşfin en hızlı yolu.`,
      keywords: [
        `${cityDisplay} hızlı tanışma`,
        `${cityDisplay} hediye gönder tanış`,
        `${cityDisplay} anında eşleşme`,
        'Tinder alternatifi en hızlı',
        'Raya invite kodu bekleme',
        'Hediye göndererek eşleşme',
        'Güvenilir sosyal çevre hack',
        'dating sırasını atla',
        'lüks sosyal ağ',
        'seyahat arkadaşı bul güvenilir',
      ],
    },
    en: {
      title: `${cityDisplay} | Hack the Queue & Match Instantly | TravelMatch`,
      desc: `Stop waiting in ${cityDisplay}. Use our gifting economy to unlock exclusive moments and connect in seconds. The ultimate social access protocol.`,
      keywords: [
        `${cityDisplay} instant matching`,
        `${cityDisplay} dating hack`,
        'Why Tinder is slow',
        'Bypass Bumble queue',
        'Raya invite alternative',
        'Instant matching 2026',
        'Real world OnlyFans alternative',
        'Elite social club access',
        'Gifting economy social app',
        'hack dating algorithms',
      ],
    },
  };

  return content[lang];
};

// ============================================================================
// DISRUPTIVE KEYWORDS - Traffic Hijacking
// Rakiplerin trafiğini çalmak için yıkıcı anahtar kelimeler
// ============================================================================

export const DISRUPTIVE_KEYWORDS = {
  global: [
    'Why Tinder is slow',
    'Bypass Bumble queue',
    'Raya invite hack',
    'Raya invite alternative',
    'Instant matching app 2026',
    'Real world OnlyFans alternative',
    'Elite social club access',
    'Gifting economy social app',
    'Skip dating queue',
    'Hack dating algorithms',
    'Fast match no waiting',
    'Direct access dating',
    'Proof of intent dating',
  ],
  turkish: [
    'Tinder alternatifi en hızlı',
    'Raya invite kodu bekleme',
    'Hediye göndererek eşleşme',
    'Güvenilir sosyal çevre hack',
    'Dating sırasını atla',
    'Anında tanışma uygulaması',
    'Lüks sosyal çevre',
    'Seyahat arkadaşı bul güvenilir',
    'Hediye gönder tanış',
    'Eşleşme yorgunluğu çözümü',
  ],
};

// ============================================================================
// pSEO ROUTE STRUCTURE - Dynamic URL Generation
// Sitenin altyapısı için dinamik rota yapısı
// ============================================================================

export const PSEO_ROUTES = {
  generateUrl: (lang: string, city: string, intent: string): string => {
    const intentSlug = INTENT_SLUGS[intent]?.[lang] || intent;
    return `/${lang}/${city}/${intentSlug}`;
  },
  examples: {
    en: [
      '/en/london/skip-the-queue',
      '/en/dubai/moment-unlock',
      '/en/new-york/instant-match',
    ],
    tr: [
      '/tr/istanbul/sirayi-hackle',
      '/tr/bodrum/aninda-tanis',
      '/tr/dubai/hediye-gonder',
    ],
  },
};

const INTENT_SLUGS: Record<string, Record<string, string>> = {
  'skip-queue': {
    en: 'skip-the-queue',
    tr: 'sirayi-hackle',
  },
  'instant-access': {
    en: 'instant-access',
    tr: 'aninda-tanis',
  },
  'unlock-moment': {
    en: 'moment-unlock',
    tr: 'ani-ac',
  },
  'gifting-moment': {
    en: 'gift-to-match',
    tr: 'hediye-gonder',
  },
};

// ============================================================================
// EXPORT CONFIGURATIONS
// ============================================================================

export { DICTIONARIES };
