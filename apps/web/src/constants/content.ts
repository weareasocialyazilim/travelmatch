/**
 * TravelMatch V2 - Content Constants
 * "Anı Hediye Et" - Sıcak, samimi, jargonsuz içerikler
 *
 * YASAK KELİMELER: escrow, verification, algorithm, protocol, queue
 * HEDEF: Gen Z, samimi, duygusal, aksiyona teşvik eden
 */

export const HERO_CONTENT = {
  tr: {
    badge: '✨ Yeni Nesil Bağlantılar',
    headline: 'Anı Hediye Et',
    subheadline:
      'Bir kahve, bir çiçek, bir gülümseme... Gerçek bağlantılar sanal beğenilerle değil, samimi jestlerle başlar.',
    cta: {
      primary: 'Hemen Başla',
      secondary: 'Nasıl Çalışır?',
    },
    stats: {
      connections: 'Gerçek Buluşma',
      gifts: 'Hediye Gönderildi',
      cities: 'Şehirde Aktif',
    },
  },
  en: {
    badge: '✨ Next-Gen Connections',
    headline: 'Gift a Moment',
    subheadline:
      "A coffee, a flower, a smile... Real connections don't start with swipes, they start with genuine gestures.",
    cta: {
      primary: 'Get Started',
      secondary: 'How It Works',
    },
    stats: {
      connections: 'Real Meetups',
      gifts: 'Gifts Sent',
      cities: 'Active Cities',
    },
  },
} as const;

export const FEATURES_CONTENT = {
  tr: [
    {
      icon: '🎁',
      title: 'Anlamlı Jestler',
      description:
        'Bir kahve ısmarla, bir çiçek gönder. Gerçek hayatta tanışmadan önce samimiyetini göster.',
    },
    {
      icon: '📍',
      title: 'Yakınındakiler',
      description:
        'Aynı kafede, aynı parkta, aynı konserde... Anı paylaşmak için doğru yerde ol.',
    },
    {
      icon: '💫',
      title: 'Deneyim Asistanı',
      description:
        'Sana özel öneriler: "Bu kişi de senin gibi vintage plak seviyor"',
    },
    {
      icon: '🛡️',
      title: 'Güvenli Buluşma',
      description:
        'Her hediye, gerçek bir niyetin göstergesi. Spam yok, sahte profil yok.',
    },
  ],
  en: [
    {
      icon: '🎁',
      title: 'Meaningful Gestures',
      description:
        'Buy a coffee, send a flower. Show your genuine interest before meeting in real life.',
    },
    {
      icon: '📍',
      title: 'Nearby',
      description:
        'Same café, same park, same concert... Be in the right place to share the moment.',
    },
    {
      icon: '💫',
      title: 'Experience Assistant',
      description:
        'Personalized suggestions: "This person also loves vintage vinyl like you"',
    },
    {
      icon: '🛡️',
      title: 'Safe Meetups',
      description:
        'Every gift is a sign of genuine intent. No spam, no fake profiles.',
    },
  ],
} as const;

export const HOW_IT_WORKS_CONTENT = {
  tr: {
    title: 'Nasıl Çalışır?',
    steps: [
      {
        number: '01',
        title: 'Profilini Oluştur',
        description:
          'Kim olduğunu, nelerden hoşlandığını paylaş. Fotoğraflar değil, hikayeler öne çıksın.',
      },
      {
        number: '02',
        title: 'Anı Keşfet',
        description:
          'Yakınındaki kişileri gör. Ortak noktalarınızı bul, ilk adımı at.',
      },
      {
        number: '03',
        title: 'Hediye Gönder',
        description:
          'Bir kahve, bir tatlı, bir bilet... Samimi bir jestle tanışma isteğini göster.',
      },
      {
        number: '04',
        title: 'Gerçekte Buluş',
        description:
          'Kabul edilirse, gerçek hayatta buluşun. İlk sohbetin konusu hazır!',
      },
    ],
  },
  en: {
    title: 'How It Works',
    steps: [
      {
        number: '01',
        title: 'Create Your Profile',
        description:
          'Share who you are, what you love. Let stories shine, not just photos.',
      },
      {
        number: '02',
        title: 'Discover Moments',
        description:
          'See people nearby. Find common interests, take the first step.',
      },
      {
        number: '03',
        title: 'Send a Gift',
        description:
          'A coffee, a dessert, a ticket... Show your genuine interest with a gesture.',
      },
      {
        number: '04',
        title: 'Meet in Real Life',
        description:
          'If accepted, meet up! Your first conversation topic is ready.',
      },
    ],
  },
} as const;

export const TESTIMONIALS_CONTENT = {
  tr: [
    {
      name: 'Elif',
      age: 24,
      city: 'İstanbul',
      text: 'Bana gönderdiği kahve hediyesi yüzünden tanıştık. Şimdi her sabah beraber kahvaltı yapıyoruz. 💕',
      avatar: '👩🏻',
    },
    {
      name: 'Burak',
      age: 28,
      city: 'Ankara',
      text: "Swipe'lamaktan bıkmıştım. Burada bir çiçek gönderdim, gerçek bir sohbet başladı.",
      avatar: '👨🏻',
    },
    {
      name: 'Zeynep',
      age: 26,
      city: 'İzmir',
      text: 'Hediye gönderen biri gerçekten ilgileniyor demek. Bu güven duygusu paha biçilemez.',
      avatar: '👩🏽',
    },
  ],
  en: [
    {
      name: 'Emma',
      age: 24,
      city: 'London',
      text: 'We met because of the coffee he sent me. Now we have breakfast together every morning. 💕',
      avatar: '👩🏼',
    },
    {
      name: 'James',
      age: 28,
      city: 'NYC',
      text: 'I was tired of swiping. Here I sent a flower, and a real conversation started.',
      avatar: '👨🏻',
    },
    {
      name: 'Sofia',
      age: 26,
      city: 'Barcelona',
      text: 'Someone who sends a gift is genuinely interested. That feeling of trust is priceless.',
      avatar: '👩🏽',
    },
  ],
} as const;

export const CTA_CONTENT = {
  tr: {
    title: 'İlk Adımı Atmaya Hazır mısın?',
    subtitle:
      'Binlerce kişi TravelMatch ile gerçek bağlantılar kuruyor. Sıra sende!',
    button: 'Uygulamayı İndir',
    note: 'Ücretsiz başla, hediye gönderirken öde.',
  },
  en: {
    title: 'Ready to Take the First Step?',
    subtitle:
      'Thousands are making real connections with TravelMatch. Your turn!',
    button: 'Download the App',
    note: 'Start free, pay only when sending gifts.',
  },
} as const;

export const FOOTER_CONTENT = {
  tr: {
    tagline: 'Gerçek bağlantılar, samimi jestlerle başlar.',
    motto: 'Gerçek bağlantılar, samimi jestlerle başlar.',
    links: {
      about: 'Hakkımızda',
      safety: 'Güvenlik',
      privacy: 'Gizlilik',
      terms: 'Kullanım Koşulları',
      support: 'Destek',
      contact: 'İletişim',
    },
    social: {
      instagram: '@travelmatchapp',
      twitter: '@travelmatch',
    },
    copyright: '© 2026 TravelMatch. Tüm hakları saklıdır.',
  },
  en: {
    tagline: 'Real connections start with genuine gestures.',
    motto: 'Real connections start with genuine gestures.',
    links: {
      about: 'About',
      safety: 'Safety',
      privacy: 'Privacy',
      terms: 'Terms',
      support: 'Support',
      contact: 'Contact',
    },
    social: {
      instagram: '@travelmatchapp',
      twitter: '@travelmatch',
    },
    copyright: '© 2026 TravelMatch. All rights reserved.',
  },
} as const;

// SEO Meta Content
export const SEO_CONTENT = {
  tr: {
    title: 'TravelMatch | Anı Hediye Et - Gerçek Bağlantılar Kur',
    description:
      "Swipe'lamayı bırak, samimi ol. Bir kahve gönder, gerçek hayatta tanış. TravelMatch ile anlamlı bağlantılar kur.",
    keywords: [
      'tanışma uygulaması',
      'hediye gönder',
      'gerçek buluşma',
      'samimi bağlantı',
      'kahve ısmarla',
    ],
  },
  en: {
    title: 'TravelMatch | Gift a Moment - Make Real Connections',
    description:
      'Stop swiping, be genuine. Send a coffee, meet in real life. Make meaningful connections with TravelMatch.',
    keywords: [
      'dating app',
      'send gift',
      'real meetup',
      'genuine connection',
      'buy a coffee',
    ],
  },
} as const;

export type Language = 'tr' | 'en';

// Unified CONTENT object for components expecting single import
export const CONTENT = {
  tr: {
    hero: HERO_CONTENT.tr,
    features: FEATURES_CONTENT.tr,
    howItWorks: HOW_IT_WORKS_CONTENT.tr,
    testimonials: TESTIMONIALS_CONTENT.tr,
    cta: CTA_CONTENT.tr,
    footer: FOOTER_CONTENT.tr,
    seo: SEO_CONTENT.tr,
    nav: {
      works: 'Nasıl Çalışır',
      moments: 'Anlar',
      trust: 'Güvenlik',
      download: 'İndir',
      app: 'Uygulamayı İndir',
    },
    trust: {
      title: 'Güvenin Temeli',
      subtitle:
        'Her hediye, gerçek bir niyetin göstergesi. Spam yok, sahte profil yok.',
      items: [
        {
          title: 'Gerçek Niyetler',
          description:
            'Hediye göndermek, gerçek ilgi göstergesi. Boş mesajlar yerine somut jestler.',
        },
        {
          title: 'Güvenli Buluşma',
          description:
            'Her buluşma öncesi konum paylaşımı ve acil durum butonu.',
        },
        {
          title: 'Gizlilik Önceliği',
          description:
            'Kişisel bilgilerin sende kalır. Paylaşmak istediğini sen seçersin.',
        },
        {
          title: 'Doğrulanmış Profiller',
          description:
            'Sosyal medya ve telefon doğrulaması ile gerçek kişilerle tanış.',
        },
      ],
    },
    moments: {
      title: 'Paylaşılan Anlar',
      subtitle: 'Gerçek bağlantılar, gerçek hikayeler',
      items: [
        {
          id: '1',
          title: "Karaköy'de Kahve Buluşması",
          loc: 'İstanbul',
          img: '/images/moments/coffee.jpg',
          gift: '☕ Kahve',
          price: '₺45',
        },
        {
          id: '2',
          title: 'Sahil Yürüyüşü',
          loc: 'İzmir',
          img: '/images/moments/beach.jpg',
          gift: '🌸 Çiçek',
          price: '₺80',
        },
        {
          id: '3',
          title: 'Konser Gecesi',
          loc: 'Ankara',
          img: '/images/moments/concert.jpg',
          gift: '🎵 Bilet',
          price: '₺250',
        },
        {
          id: '4',
          title: 'Kitap Kulübü',
          loc: 'Bursa',
          img: '/images/moments/books.jpg',
          gift: '📚 Kitap',
          price: '₺65',
        },
      ],
    },
    download: {
      title: 'Hemen İndir',
      subtitle: "iOS ve Android'de ücretsiz",
      appStore: 'App Store',
      playStore: 'Google Play',
    },
  },
  en: {
    hero: HERO_CONTENT.en,
    features: FEATURES_CONTENT.en,
    howItWorks: HOW_IT_WORKS_CONTENT.en,
    testimonials: TESTIMONIALS_CONTENT.en,
    cta: CTA_CONTENT.en,
    footer: FOOTER_CONTENT.en,
    seo: SEO_CONTENT.en,
    nav: {
      works: 'How It Works',
      moments: 'Moments',
      trust: 'Trust',
      download: 'Download',
      app: 'Get the App',
    },
    trust: {
      title: 'Built on Trust',
      subtitle:
        'Every gift is a sign of genuine intent. No spam, no fake profiles.',
      items: [
        {
          title: 'Genuine Intent',
          description:
            'Sending a gift shows real interest. Concrete gestures, not empty messages.',
        },
        {
          title: 'Safe Meetups',
          description:
            'Location sharing and emergency button before every meetup.',
        },
        {
          title: 'Privacy First',
          description:
            'Your personal info stays with you. You choose what to share.',
        },
        {
          title: 'Verified Profiles',
          description:
            'Meet real people with social media and phone verification.',
        },
      ],
    },
    moments: {
      title: 'Shared Moments',
      subtitle: 'Real connections, real stories',
      items: [
        {
          id: '1',
          title: 'Coffee Date in Brooklyn',
          loc: 'New York',
          img: '/images/moments/coffee.jpg',
          gift: '☕ Coffee',
          price: '$8',
        },
        {
          id: '2',
          title: 'Beach Walk',
          loc: 'Miami',
          img: '/images/moments/beach.jpg',
          gift: '🌸 Flowers',
          price: '$15',
        },
        {
          id: '3',
          title: 'Concert Night',
          loc: 'Austin',
          img: '/images/moments/concert.jpg',
          gift: '🎵 Ticket',
          price: '$45',
        },
        {
          id: '4',
          title: 'Book Club',
          loc: 'Seattle',
          img: '/images/moments/books.jpg',
          gift: '📚 Book',
          price: '$12',
        },
      ],
    },
    download: {
      title: 'Download Now',
      subtitle: 'Free on iOS and Android',
      appStore: 'App Store',
      playStore: 'Google Play',
    },
  },
} as const;
