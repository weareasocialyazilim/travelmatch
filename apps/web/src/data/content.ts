export type Language = 'EN' | 'TR';

export const TRANSLATIONS: Record<Language, any> = {
  EN: {
    hero_title: 'STOP THE YAP.\nLOVE N DO.',
    hero_sub:
      'Because matching with a ghost won’t buy you dinner. Real chemistry requires actual physics.',
    nav_creator: 'CLAIM THE STAGE',
    manifesto_title: 'THE TRUTH HURTS',
    manifesto_txt:
      'We’re done with the digital foreplay and the 3-week "hey" streaks. LOVENDO is for entities who actually show up. No 20 questions. No "vibing" behind a screen. Just bread, wine, and the laws of biology.',
    creator_cta_title: 'MAIN CHARACTER ENERGY WANTED.',
    creator_cta_sub:
      'WE NEED SOMEONE TO ACTUALLY LEAD THE SYNC. ARE YOU THE VIBE?',
    creator_cta_btn: 'CLAIM_THE_STAGE',
    form_header: 'PROVE_YOUR_EXISTENCE.',
    form_ig: '@your_social_proof',
    form_story:
      "Tell us a story that isn't mid, or 2 dream moments that justify your existence.",
    submit: 'SUBMIT_OR_WHATEVER',
    success_title: 'WE’RE STALKING YOU NOW.',
    success_msg:
      'Application received. We’ll check your profile. If you’re not mid, you’re in. Stay loud or get muted.',
    moments_title: 'CHOOSE YOUR POISON',
    moments_sub: 'CONSUME OR BE CONSUMED.',
    unlock: 'UNLOCK THE VIBE',
    gift: 'PAY THE TAX',
    alternative: 'DO BETTER',
    footer_tag: 'Stop the yapping. Sync the biology.',
    footer_rights: 'LOVENDO PROJECT. STOP SWIPING.',
    version: 'Engineered for Entities | v0.0.5-savage',
    nav_void: 'The Void',
    gift_success_title: 'MAIN CHARACTER MOMENT .',
    gift_success_msg_1:
      "Congrats. Your wallet just did what your personality couldn't.",
    gift_success_msg_2:
      'Hope that match actually happens, otherwise, that’s a very expensive "read" receipt.',
    gift_success_msg_3:
      'You supported an entity. Remember: they had a dream, and you had a credit card.',
    gift_success_highlight: 'CONGRATS ON THE TAX.',
    gift_success_btn: 'BACK TO THE WAITING ROOM',
    alt_success_title: 'VISIONARY_ALERT.',
    alt_success_sub: 'YOUR AUDITION IS IN THE CLOUD.',
    alt_success_msg:
      "If your suggestion isn't basic, it might actually glitch onto their screen. If not, consider this a digital void. Keep your ego in check while the algorithm judges you.",
    alt_success_footer: "DON'T BE MID NEXT TIME.",
    alt_success_btn: 'COOL, WHATEVER',
  },
  TR: {
    hero_title: 'BOŞ YAPMA.\nSEV VE YAP.',
    hero_sub:
      'Çünkü bir hayaletle eşleşmek sana akşam yemeği ısmarlamaz. Gerçek kimya için fiziksel realite şart.',
    nav_creator: 'SAHNEYİ_AL',
    manifesto_title: 'GERÇEKLER ACITIR',
    manifesto_txt:
      'Dijital ön sevişmelerden ve 3 haftalık "selam, naber" seanslarından bıktık. LOVENDO, gerçekten orada olanlar içindir. 20 soru yok. Ekran arkasından "vibe" kasmak yok. Sadece yemek, şarap ve biyolojinin kanunları.',
    creator_cta_title: 'ANA KARAKTER ENERJİSİ ARANIYOR.',
    creator_cta_sub:
      'SENKRONİZASYONU YÖNETECEK BİRİNE İHTİYACIMIZ VAR. O ENERJİ SENDE VAR MI?',
    creator_cta_btn: 'SAHNEYİ_AL',
    form_header: 'VARLIĞINI_KANITLA.',
    form_ig: '@sosyal_referansın',
    form_story:
      'Bize "tırt" olmayan bir hikaye anlat ya da varlığını haklı çıkaracak 2 hayalindeki anı söyle.',
    submit: 'GÖNDER_GİTSİN_İŞTE',
    success_title: 'ŞU AN SENİ STALKLIYORUZ.',
    success_msg:
      'Başvuru alındı. Profilini inceleyeceğiz. Eğer "mid" değilsen içeridesin. Sesini çıkar ya da sessize alın.',
    moments_title: 'ZEHRİNİ SEÇ',
    moments_sub: 'TÜKET YA DA TÜKEN.',
    unlock: 'ENERJİYİ AÇ',
    gift: 'BEDELİNİ ÖDE',
    alternative: 'DAHA İYİSİNİ YAP',
    footer_tag: 'Boş muhabbeti kes. Biyolojini senkronize et.',
    footer_rights: 'LOVENDO PROJECT. KAYDIRMAYI BIRAK.',
    version: 'Varlıklar için tasarlandı | v0.0.5-savage',
    nav_void: 'Boşluk',
    gift_success_title: 'ANA KARAKTER ANI.',
    gift_success_msg_1:
      'Tebrikler. Cüzdanın, karakterinin beceremediğini az önce başardı.',
    gift_success_msg_2:
      'Umarız o eşleşme gerçekten olur, yoksa bu çok pahalı bir "görüldü" olacak.',
    gift_success_msg_3:
      'Bir varlığı destekledin. Unutma: Onların bir hayali vardı, senin ise kredi kartın.',
    gift_success_highlight: 'BEDELİ ÖDEDİĞİN İÇİN TEBRİKLER.',
    gift_success_btn: 'BEKLEME ODASINA DÖN',
    alt_success_title: 'VİZYONER_ALARM.',
    alt_success_sub: 'SEÇMELERİN BULUTTA.',
    alt_success_msg:
      "Eğer önerin basit değilse, karşı tarafın ekranında bir 'glitch' yaratabilir. Değilse, bunu dijital bir boşluk olarak gör. Algoritma seni yargılarken egona sahip çık.",
    alt_success_footer: 'BİR DAHAKİNE BU KADAR ORTALAMA OLMA.',
    alt_success_btn: 'TAMAM, NEYSE.',
  },
};

export const MOMENTS = [
  {
    id: 'LV-01',
    creator: 'Sandra Smith',
    title: { EN: 'CARETTE BREAKFAST', TR: 'CARETTE KAHVALTI' },
    price: 45,
    location: 'PARIS',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop', // Parisian Cafe / Coffee / Raw
    altSuggestion: 'Le Comptoir Breakfast',
  },
  {
    id: 'LV-02',
    creator: 'Ashton Jenner',
    title: { EN: 'MoMA ANNUAL PASS', TR: 'MoMA YILLIK PASS' },
    price: 110,
    location: 'NYC',
    image:
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop', // Modern Art / Flash
    altSuggestion: 'Guggenheim VIP Tour',
  },
  {
    id: 'LV-03',
    creator: 'Jennifer Kardashian',
    title: { EN: 'VINTAGE CASIO WATCH', TR: 'VINTAGE CASIO SAAT' },
    price: 150,
    location: 'TOKYO',
    image:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop', // Gold Casio / Direct Flash
    altSuggestion: 'Seiko 5 Vintage',
  },
  {
    id: 'LV-04',
    creator: 'Kylie DiCaprio',
    title: { EN: 'ARKESTRA DINNER', TR: 'ARKESTRA AKŞAM YEMEĞİ' },
    price: 180,
    location: 'ISTANBUL',
    image:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop', // Dim Dinner / Flash Party
    altSuggestion: 'Mikla Tasting Menu',
  },
  {
    id: 'LV-05',
    creator: 'Brad Delevingne',
    title: { EN: 'ACE & TATE GLASSES', TR: 'ACE & TATE GÖZLÜK' },
    price: 120,
    location: 'AMSTERDAM',
    image:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=800&auto=format&fit=crop', // Stylish Glasses / Flash
    altSuggestion: 'Custom Frames Amsterdam',
  },
  {
    id: 'LV-06',
    creator: 'Margot Kutcher',
    title: { EN: 'ACROPOLIS PRIVATE DINING', TR: 'AKROPOL ÖZEL YEMEK' },
    price: 140,
    location: 'ATHENS',
    image:
      'https://images.unsplash.com/photo-1563299839-a9a797db244f?q=80&w=800&auto=format&fit=crop', // Night / Grainy
    altSuggestion: 'Plaka Tavern Night',
  },
];
