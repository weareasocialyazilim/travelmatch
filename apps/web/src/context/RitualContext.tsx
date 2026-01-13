'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'tr' | 'en';

type Dictionary = {
  hero: {
    title_line1: string;
    title_line2: string;
    cta: string;
    beta_note: string;
  };
  assistant: {
    intro: string;
    coffee: string;
    aura: string;
  };
  global: {
    origin: string;
    destination: string;
  };
  manifesto: {
    title: string;
    title_line2: string;
    content: string;
    sub_content: string;
  };
};

const DICTIONARIES: Record<Language, Dictionary> = {
  tr: {
    hero: {
      title_line1: 'SADECE GEZME',
      title_line2: 'ORADA OL',
      cta: 'ERİŞİM TALEP ET',
      beta_note: 'RİTÜEL İÇİN SINIRLI KONTENJAN',
    },
    assistant: {
      intro:
        'Seni tanımak üzereyim... Gece yürüyüşlerini mi seversin, yoksa gün doğumu keşiflerini mi?',
      coffee:
        'Harika. Bir yabancıya kahve ikram etmek sence bir jest midir, yoksa bir başlangıç mı?',
      aura: "Aura'n TravelMatch ruhuna %94 uyumlu. Demo listesinde ön sıraya geçmek ister misin?",
    },
    global: {
      origin: 'BAŞLANGIÇ',
      destination: 'VARIŞ',
    },
    manifesto: {
      title: 'PASAPORT YOK SADECE RİTÜEL',
      title_line2: 'KUTSAL ANLARIN TAKASI',
      content:
        'Haritalardan sınırları sildik.\nŞimdi onları kalp atışlarına geri döndürüyoruz.',
      sub_content:
        'TravelMatch bir uygulama değil. Bir ritüel. Bir an. Dünyanın bir yerinde, birinin seni imkansız mesafelerin ötesinden bir hediye—bir an—gönderecek kadar düşündüğüne dair bir söz.',
    },
  },
  en: {
    hero: {
      title_line1: "DON'T JUST TRAVEL",
      title_line2: 'BE THERE',
      cta: 'REQUEST ACCESS',
      beta_note: 'LIMITED SLOTS FOR RITUAL',
    },
    assistant: {
      intro:
        'Getting to know you... Do you prefer night walks or sunrise discoveries?',
      coffee:
        'Excellent. is offering coffee to a stranger a gesture, or a beginning?',
      aura: 'Your Aura matches 94% with TravelMatch spirit. Want priority access?',
    },
    global: {
      origin: 'ORIGIN',
      destination: 'DESTINATION',
    },
    manifesto: {
      title: 'NO PASSPORTS JUST RITUALS',
      title_line2: 'SACRED MOMENTS EXCHANGE',
      content:
        'We erased borders from maps.\nNow we return them to heartbeats.',
      sub_content:
        "TravelMatch isn't an app. It's a ritual. A moment. A promise that somewhere in the world, someone is thinking of you enough to send a gift—a moment—across impossible distances.",
    },
  },
};

interface RitualContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  auraColor: string;
  setAuraColor: (color: string) => void;
  t: Dictionary;
}

const RitualContext = createContext<RitualContextType | undefined>(undefined);

export function RitualProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en'); // Default to EN for international vibe
  const [auraColor, setAuraColor] = useState<string>('#ff007a'); // Default Neon Pink

  const value = {
    language,
    setLanguage,
    auraColor,
    setAuraColor,
    t: DICTIONARIES[language],
  };

  return (
    <RitualContext.Provider value={value}>{children}</RitualContext.Provider>
  );
}

export function useRitual() {
  const context = useContext(RitualContext);
  if (context === undefined) {
    throw new Error('useRitual must be used within a RitualProvider');
  }
  return context;
}
