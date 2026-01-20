export type Language = 'EN' | 'TR';

export const TRANSLATIONS = {
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
    hero_title: 'BOŞ YAPMA.\nSEV. YAP.',
    hero_sub:
      'GELMEYENLER İÇİN MASA KURMUYORUZ. GERÇEK KİMYA İÇİN FİZİKSEL VARLIK ŞART.',
    nav_creator: 'SAHNE AL',
    manifesto_title: 'GERÇEKLER ACITIR',
    manifesto_txt:
      'DİJİTAL OYALAMALAR, UZAYAN SOHBETLER, YARIM PLANLAR. BUNLARI ZATEN DENEDİK. LOVENDO, GERÇEKTEN GELENLER İÇİNDİR. UZUN UZUN YAZIŞMAK YOK. EKRAN ARKASINA SAKLANMAK YOK. GELİYORSAN GEL. GERİSİ KONUŞULUR.',
    creator_cta_title: 'ANA KARAKTER ENERJİSİ ARANIYOR.',
    creator_cta_sub:
      'SENKRONİZASYONU YÖNETECEK BİRİNE İHTİYACIMIZ VAR. O ENERJİ SENDE VAR MI?',
    creator_cta_btn: 'SAHNE_AL',
    form_header: 'VARLIĞINI_KANITLA.',
    form_ig: '@SOSYAL_KANITIN',
    form_story:
      'BİZE BAYIK OLMAYAN BİR HİKAYE YA DA BU MASAYA OTURMANI HAKLI ÇIKARAN 2 AN YAZ.',
    submit: 'GÖNDER_YA_DA_NEYSE',
    success_title: 'ŞİMDİ SENİ TAKİP EDİYORUZ.',
    success_msg:
      'BAŞVURU ALINDI. PROFİLİNE BAKACAĞIZ. BAYIK DEĞİLSEN İÇERDESİN. SESİ KESİLENLER DIŞARIDA KALIR.',
    moments_title: 'SEÇİM SENİN',
    moments_sub: 'TÜKET YA DA TÜKEN.',
    unlock: 'ERİŞİMİ AÇ',
    gift: 'BEDELİNİ ÖDE',
    alternative: 'DAHA İYİSİNİ ÖNER',
    footer_tag: 'BOŞ MUHABBETİ KES. BİYOLOJİNİ SENKRONİZE ET.',
    footer_rights: 'LOVENDO PROJECT. SWIPE YOK.',
    version: 'VARLIK İÇİN TASARLANDI | v0.0.5-savage',
    nav_void: 'BOŞLUK',
    gift_success_title: 'ANA KARAKTER ANI.',
    gift_success_msg_1: 'TEBRİKLER. CÜZDANIN, KARAKTERİNİN YAPAMADIĞINI YAPTI.',
    gift_success_msg_2:
      "UMARIZ BU BULUŞMA GERÇEKLEŞİR. YOKSA BU, ÇOK PAHALI BİR 'GÖRÜLDÜ' OLUR.",
    gift_success_msg_3:
      'BİR VARLIĞI DESTEKLEDİN. UNUTMA: ONUN BİR HAYALİ VARDI, SENİN BİR KREDİ KARTIN.',
    gift_success_highlight: 'BEDEL ÖDENDİ.',
    gift_success_btn: 'BEKLEME_ODASINA_DÖN',
    alt_success_title: 'VİZYONER_UYARISI.',
    alt_success_sub: 'SEÇMEN BULUTTA.',
    alt_success_msg:
      'ÖNERİN BAYIK DEĞİLSE EKRANINA DÜŞEBİLİR. DEĞİLSE, BUNU DİJİTAL BOŞLUK SAY. ALGORİTMA KARAR VERİRKEN EGOYU DÜŞÜK TUT.',
    alt_success_footer: 'BİR DAHAKİNE BAYIK OLMA.',
    alt_success_btn: 'TAMAM_PEKE',
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
    title: { EN: 'MoMA ANNUAL PASS', TR: 'MoMA YILLIK PAS' },
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
