export type Language = 'EN' | 'TR';

export interface Moment {
  id: string;
  creator: string;
  title: { EN: string; TR: string };
  price: number;
  location: string;
  image: string;
  altSuggestion: string;
}

export const TRANSLATIONS = {
  EN: {
    hero_title: 'STOP THE YAP.\nLOVE N DO.',
    hero_sub: 'Real experiences. Real people. Trusted.',
    nav_creator: 'CLAIM THE STAGE',
    manifesto_title: 'THE TRUTH HURTS',
    manifesto_txt:
      'We are done with the digital foreplay and the 3-week "hey" streaks. LOVENDO is for entities who actually show up. No 20 questions. No "vibing" behind a screen. Just bread, wine, and the laws of biology.',
    creator_cta_title: 'MAIN CHARACTER ENERGY WANTED.',
    creator_cta_sub:
      'WE NEED SOMEONE TO ACTUALLY LEAD THE SYNC. ARE YOU THE VIBE?',
    creator_cta_btn: 'CLAIM_THE_STAGE',
    form_header: 'PROVE_YOUR_EXISTENCE.',
    form_ig: '@your_social_proof',
    form_story:
      "Tell us a story that isn't mid, or 2 dream moments that justify your existence.",
    submit: 'SUBMIT_OR_WHATEVER',
    success_title: 'WE'RE STALKING YOU NOW.',
    success_msg:
      'Application received. We will check your profile. If you are not mid, you are in. Stay loud or get muted.',
    moments_title: 'CHOOSE YOUR POISON',
    moments_sub: 'CONSUME OR BE CONSUMED.',
    unlock: 'CREATE YOUR FIRST MOMENT',
    gift: 'PAY THE TAX',
    alternative: 'HOW IT WORKS',
    howitworks_title: 'SO WHAT THE F IS THIS?',
    howitworks_1_title: '1. CREATE A MOMENT',
    howitworks_1_desc: 'Share a dream, experience, or moment you want to happen. Set your goal.',
    howitworks_2_title: '2. GET SUPPORT',
    howitworks_2_desc: 'People who vibe with your vision send gifts. Money is locked in escrow.',
    howitworks_3_title: '3. MAKE IT HAPPEN',
    howitworks_3_desc: 'Once funded, you deliver. Proof goes to your supporters. They say thanks.',
    footer_tag: 'Stop the yapping. Sync the biology.',
    footer_rights: 'LOVENDO PROJECT. STOP SWIPING.',
    version: 'Engineered for Entities | v0.0.5-savage',
    nav_void: 'The Void',
    gift_success_title: 'MAIN CHARACTER MOMENT .',
    gift_success_msg_1:
      "Congrats. Your wallet just did what your personality couldn't.",
    gift_success_msg_2:
      'Hope that match actually happens, otherwise, that is a very expensive "read" receipt.',
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
    hero_title: 'BOS YAPMA.\nSEV. YAP.',
    hero_sub: 'Gercek anlar yarat, guvenle paylas.',
    nav_creator: 'SAHNE AL',
    manifesto_title: 'GERCEKLER ACITIR',
    manifesto_txt:
      'DIJITAL OYALAMALAR,UZAYAN SOHBETLER,YARIM PLANLAR.BUNLARI ZATEN DENEDIK.LOVENDO,GERCEKTEN GELENLER ICINDIR.UZUN UZUN YAZISMAK YOK.EKRAN ARKASINA SAKLANMAK YOK.GELIYORSAN GEL.GERISI KONUSULUR.',
    creator_cta_title: 'ANA KARAKTER ENERJISI ARANIYOR.',
    creator_cta_sub:
      'SENKRONIZASYONU YONETECEK BIRINE IHTIYACIMIZ VAR.O ENERJI SENDE VAR MI?',
    creator_cta_btn: 'SAHNE_AL',
    form_header: 'VARLIGINI_KANITLA.',
    form_ig: '@SOSYAL_KANITIN',
    form_story:
      'BIZE BAYIK OLMAYAN BIR HIKAYE YA DA BU MASAYA OTURMANI HAKLI CIKARAN 2 AN YAZ.',
    submit: 'GONDER_YA_DA_NEYSE',
    success_title: 'SIMDI SENI TAKIP EDIYORUZ.',
    success_msg:
      'BASVURU ALINDI.PROFILINE BAKACAGIZ.BAYIK DEGILSEN ICERDESIN.SESI KESILENLER DISARIDA KALIR.',
    moments_title: 'SECIM SIN',
    moments_sub: 'TUKET YA DA TUKEN.',
    unlock: 'ILK MOMENTI OLUSTUR',
    gift: 'BEDELINI ODE',
    alternative: 'NASIL CALISIR?',
    howitworks_title: 'PEKI BU NEDIR?',
    howitworks_1_title: '1. AN OLUSTUR',
    howitworks_1_desc: 'Gerçekleşmesini istediğin bir hayalı, deneyimi veya anı paylaş. Hedefini belirle.',
    howitworks_2_title: '2. DESTEK AL',
    howitworks_2_desc: 'Vibe ettiklerine hediye gönderiyor. Para escrowda kilitli kalıyor.',
    howitworks_3_title: '3. GERCEKLESTIR',
    howitworks_3_desc: 'Finansman sağlandığında, sen yap. Kanıt destekçilerine gidiyor. Onlar tesekkur diyor.',
    footer_tag: 'BOS MUHABBETI KES.BIYOLOJINI SENKRONIZE ET.',
    footer_rights: 'LOVENDO PROJECT.SWIPE YOK.',
    version: 'VARLIK ICIN TASARLANDI | v0.0.5-savage',
    nav_void: 'BOSLUK',
    gift_success_title: 'ANA KARAKTER ANI.',
    gift_success_msg_1: 'TEBRİKLER.CÜZDANIN,KARAKTERIN YAPAMADIGINI YAPTI.',
    gift_success_msg_2:
      "UMARIZ BU BULUSMA GERCEKLESIR.YOKSA BU,COK PAHALI BIR 'GORULDU' OLUR.",
    gift_success_msg_3:
      'BIR VARLIGI DESTEKLEDIN.UNUTMA:ONUN BIR HAYALI VARDI,SENIN BIR KREDI KARTIN.',
    gift_success_highlight: 'BEDEL ODENDI.',
    gift_success_btn: 'BEKLEME ODASINA DON',
    alt_success_title: 'VIZYONER_UYARISI.',
    alt_success_sub: 'SECMEN BULUTTA.',
    alt_success_msg:
      'ONERIN BAYIK DEGILSE EKRANINA DUSEBILEGILSE,BUNU DIGITAL BOSLUK SAY.ALGORITMA KARAR VERIRKEN EGOYU DUSUK TUT.',
    alt_success_footer: 'BIR DAHAKINE BAYIK OLMA.',
    alt_success_btn: 'TAMAM_PEKE',
  },
};

export const MOMENTS: Moment[] = [
  {
    id: 'LV-01',
    creator: 'Sandra Smith',
    title: { EN: 'CARETTE BREAKFAST', TR: 'CARETTE KAHVALTI' },
    price: 45,
    location: 'PARIS',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
    altSuggestion: 'Le Comptoir Breakfast',
  },
  {
    id: 'LV-02',
    creator: 'Ashton Jenner',
    title: { EN: 'MoMA ANNUAL PASS', TR: 'MoMA YILLIK PAS' },
    price: 110,
    location: 'NYC',
    image:
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    altSuggestion: 'Guggenheim VIP Tour',
  },
  {
    id: 'LV-03',
    creator: 'Jennifer Kardashian',
    title: { EN: 'VINTAGE CASIO WATCH', TR: 'VINTAGE CASIO SAAT' },
    price: 150,
    location: 'TOKYO',
    image:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
    altSuggestion: 'Seiko 5 Vintage',
  },
  {
    id: 'LV-04',
    creator: 'Kylie DiCaprio',
    title: { EN: 'ARKESTRA DINNER', TR: 'ARKESTRA AKSAM YEMEGI' },
    price: 180,
    location: 'ISTANBUL',
    image:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
    altSuggestion: 'Mikla Tasting Menu',
  },
  {
    id: 'LV-05',
    creator: 'Brad Delevingne',
    title: { EN: 'ACE & TATE GLASSES', TR: 'ACE & TATE GOZLUK' },
    price: 120,
    location: 'AMSTERDAM',
    image:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=800&auto=format&fit=crop',
    altSuggestion: 'Custom Frames Amsterdam',
  },
  {
    id: 'LV-06',
    creator: 'Margot Kutcher',
    title: { EN: 'ACROPOLIS PRIVATE DINING', TR: 'AKROPOL OZEL YEMEK' },
    price: 140,
    location: 'ATHENS',
    image:
      'https://images.unsplash.com/photo-1563299839-a9a797db244f?q=80&w=800&auto=format&fit=crop',
    altSuggestion: 'Plaka Tavern Night',
  },
];
