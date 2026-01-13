'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ns?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Translations
const translations = {
  tr: {
    hero: {
      line1_1: 'SADECE',
      line1_2: 'GEZME',
      line2_1: 'ORADA',
      line2_2: 'OL.',
      cta: 'CREATOR OLARAK BAŞVUR',
      subcta: 'Dünyayı Gezen İçerik Yaratıcılarına Katıl',
      soon: 'Yakında',
    },
    menu: {
      ritual: 'RİTÜEL MENÜSÜ',
    },
    manifesto: {
      loop1: 'SADECE GEZME, ORADA OL •',
      loop2: 'SADECE EŞLEŞME, BAĞLAN •',
      loop3: 'SADECE İZLEME, YAŞA •',
      loop4: 'UNUTULMAZ ANLAR HEDİYE ET •',
    },
    pulse: {
      t1: 'Sabah kahvesi 5400 km yol katetti.',
      t2: "Boğaz'dan K-Life'a bir çay fırlatıldı.",
      t3: 'Lezzet sınır tanımaz bir jest.',
      t4: 'Kutuplardan Sambaya serin bir dokunuş.',
      t5: 'Tatlı bir fısıltı çöl güneşine ulaştı.',
      c1: ['PARİS', 'DUBAİ'],
      c2: ['İSTANBUL', 'SEUL'],
      c3: ['TOKYO', 'NEW YORK'],
      c4: ['REYKJAVIK', 'RİO'],
      c5: ['ROMA', 'MARAKEŞ'],
    },
    cookie: {
      title: 'Çerez Tercihleri',
      description:
        'Deneyiminizi iyileştirmek için çerezler kullanıyoruz. Tercihlerinizi yönetebilirsiniz.',
      acceptAll: 'Tümünü Kabul Et',
      acceptNecessary: 'Sadece Gerekli',
      customize: 'Özelleştir',
      save: 'Kaydet',
      necessary: 'Gerekli Çerezler',
      necessaryDesc: 'Site işlevselliği için zorunlu',
      analytics: 'Analitik Çerezler',
      analyticsDesc: 'Site kullanımını anlamamıza yardımcı olur',
      marketing: 'Pazarlama Çerezleri',
      marketingDesc: 'Kişiselleştirilmiş içerik için kullanılır',
      privacyPolicy: 'Gizlilik Politikası',
    },
  },
  en: {
    hero: {
      line1_1: 'DONT JUST',
      line1_2: 'WANDER',
      line2_1: 'BE',
      line2_2: 'THERE.',
      cta: 'APPLY AS CREATOR',
      subcta: 'Join Content Creators Around The World',
      soon: 'Soon',
    },
    menu: {
      ritual: 'RITUAL MENU',
    },
    manifesto: {
      loop1: "DON'T JUST WANDER, BE THERE •",
      loop2: "DON'T JUST MATCH, CONNECT •",
      loop3: "DON'T JUST WATCH, LIVE IT •",
      loop4: 'GIFT MOMENTS THAT LAST •',
    },
    pulse: {
      t1: 'Morning coffee journeyed 5400 km.',
      t2: 'Tea from Bosphorus to K-Life.',
      t3: 'Flavor knows no borders.',
      t4: 'Arctic breeze meets Samba heat.',
      t5: 'Sweet whisper crossed the desert.',
      c1: ['PARIS', 'DUBAI'],
      c2: ['ISTANBUL', 'SEOUL'],
      c3: ['TOKYO', 'NEW YORK'],
      c4: ['REYKJAVIK', 'RIO'],
      c5: ['ROME', 'MARRAKESH'],
    },
    cookie: {
      title: 'Cookie Preferences',
      description:
        'We use cookies to enhance your experience. You can manage your preferences.',
      acceptAll: 'Accept All',
      acceptNecessary: 'Necessary Only',
      customize: 'Customize',
      save: 'Save',
      necessary: 'Necessary Cookies',
      necessaryDesc: 'Required for site functionality',
      analytics: 'Analytics Cookies',
      analyticsDesc: 'Help us understand site usage',
      marketing: 'Marketing Cookies',
      marketingDesc: 'Used for personalized content',
      privacyPolicy: 'Privacy Policy',
    },
  },
} as const;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('tr');

  const t = useCallback(
    (key: string): any => {
      const keys = key.split('.');
      let value: unknown = translations[language];

      for (const k of keys) {
        if (typeof value === 'object' && value !== null && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }

      return value;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
