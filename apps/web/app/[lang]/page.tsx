/**
 * Language Hub Page
 *
 * Landing page for each language (e.g., /en, /tr, /ar)
 * Shows featured cities and intents for that market.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  SUPPORTED_LANGUAGES,
  TM_STRATEGY,
  type SupportedLanguage,
} from '@/lib/seo-engine';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

// Featured cities per language/market
const FEATURED_CITIES: Record<string, string[]> = {
  en: ['london', 'new-york', 'dubai', 'singapore', 'miami', 'los-angeles'],
  tr: ['istanbul', 'dubai', 'london', 'paris', 'berlin', 'miami'],
  ar: ['dubai', 'abu-dhabi', 'doha', 'riyadh', 'cairo', 'london'],
  de: ['berlin', 'munich', 'vienna', 'zurich', 'amsterdam', 'paris'],
  fr: ['paris', 'london', 'barcelona', 'rome', 'amsterdam', 'dubai'],
  es: ['barcelona', 'madrid', 'miami', 'mexico-city', 'ibiza', 'paris'],
  ru: ['dubai', 'paris', 'london', 'istanbul', 'berlin', 'miami'],
  it: ['rome', 'milan', 'paris', 'barcelona', 'london', 'dubai'],
  pt: ['sao-paulo', 'rio-de-janeiro', 'lisbon', 'miami', 'paris', 'london'],
  ja: ['tokyo', 'osaka', 'seoul', 'singapore', 'paris', 'new-york'],
  ko: ['seoul', 'tokyo', 'singapore', 'paris', 'london', 'new-york'],
};

const FEATURED_INTENTS = [
  'dating-match',
  'love-fortune',
  'gifting-moment',
  'travel-match',
];

// Translations
const TRANSLATIONS: Record<
  string,
  {
    hero: string;
    subtitle: string;
    explore: string;
    popularCities: string;
    popularIntents: string;
    cta: string;
  }
> = {
  en: {
    hero: 'Hack the Queue',
    subtitle:
      'Unlock exclusive moments through our gifting economy. Match instantly.',
    explore: 'Explore',
    popularCities: 'Popular Cities',
    popularIntents: 'Trending Categories',
    cta: 'Download App',
  },
  tr: {
    hero: 'Sırayı Hackle',
    subtitle:
      'Hediyeleşme ekonomisiyle özel momentların kilidini aç. Anında eşleş.',
    explore: 'Keşfet',
    popularCities: 'Popüler Şehirler',
    popularIntents: 'Trend Kategoriler',
    cta: 'Uygulamayı İndir',
  },
  ar: {
    hero: 'تخطى الطابور',
    subtitle: 'افتح اللحظات الحصرية من خلال اقتصاد الهدايا. تطابق فوراً.',
    explore: 'استكشف',
    popularCities: 'المدن الشائعة',
    popularIntents: 'الفئات الرائجة',
    cta: 'تحميل التطبيق',
  },
  de: {
    hero: 'Überspringe die Warteschlange',
    subtitle: 'Schalte exklusive Momente durch unsere Geschenk-Ökonomie frei.',
    explore: 'Entdecken',
    popularCities: 'Beliebte Städte',
    popularIntents: 'Trendkategorien',
    cta: 'App Herunterladen',
  },
  fr: {
    hero: 'Passe la File',
    subtitle:
      'Débloque des moments exclusifs grâce à notre économie de cadeaux.',
    explore: 'Explorer',
    popularCities: 'Villes Populaires',
    popularIntents: 'Catégories Tendance',
    cta: 'Télécharger',
  },
  es: {
    hero: 'Salta la Cola',
    subtitle:
      'Desbloquea momentos exclusivos a través de nuestra economía de regalos.',
    explore: 'Explorar',
    popularCities: 'Ciudades Populares',
    popularIntents: 'Categorías Trending',
    cta: 'Descargar App',
  },
  ru: {
    hero: 'Пропусти Очередь',
    subtitle: 'Разблокируй эксклюзивные моменты через экономику подарков.',
    explore: 'Исследовать',
    popularCities: 'Популярные Города',
    popularIntents: 'Трендовые Категории',
    cta: 'Скачать',
  },
  it: {
    hero: 'Salta la Coda',
    subtitle:
      'Sblocca momenti esclusivi attraverso la nostra economia dei regali.',
    explore: 'Esplora',
    popularCities: 'Città Popolari',
    popularIntents: 'Categorie di Tendenza',
    cta: 'Scarica App',
  },
  pt: {
    hero: 'Pule a Fila',
    subtitle:
      'Desbloqueie momentos exclusivos através da nossa economia de presentes.',
    explore: 'Explorar',
    popularCities: 'Cidades Populares',
    popularIntents: 'Categorias em Alta',
    cta: 'Baixar App',
  },
  ja: {
    hero: '列をスキップ',
    subtitle:
      'ギフトエコノミーで限定モーメントをアンロック。即座にマッチング。',
    explore: '探索',
    popularCities: '人気の都市',
    popularIntents: 'トレンドカテゴリ',
    cta: 'アプリをダウンロード',
  },
  ko: {
    hero: '줄 건너뛰기',
    subtitle: '선물 경제를 통해 독점 모먼트를 잠금 해제하세요. 즉시 매칭.',
    explore: '탐색',
    popularCities: '인기 도시',
    popularIntents: '트렌드 카테고리',
    cta: '앱 다운로드',
  },
};

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;

  if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    return { title: 'Not Found' };
  }

  const dict = TM_STRATEGY.getDictionary(lang);

  return {
    title: `TravelMatch | ${dict.tagline}`,
    description: dict.descriptions.default,
    alternates: {
      canonical: `https://travelmatch.app/${lang}`,
    },
  };
}

export default async function LanguageHubPage({ params }: PageProps) {
  const { lang } = await params;

  if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    notFound();
  }

  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.en;
  const dict = TM_STRATEGY.getDictionary(lang);
  const cities = FEATURED_CITIES[lang] ?? FEATURED_CITIES.en;

  if (!t || !cities) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black to-black" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              {t.hero}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          <Link
            href="/download"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform"
          >
            {t.cta}
          </Link>
        </div>
      </section>

      {/* Popular Cities Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {t.popularCities}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city) => (
            <Link
              key={city}
              href={`/${lang}/${city}/dating-match`}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 to-pink-600/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white group-hover:scale-110 transition-transform">
                  {TM_STRATEGY.getCityName(city, lang)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Intents */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {t.popularIntents}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURED_INTENTS.map((intent) => (
            <Link
              key={intent}
              href={`/${lang}/${cities[0]}/${intent}`}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all text-center"
            >
              <span className="text-3xl mb-3 block">
                {intent === 'dating-match' && '💕'}
                {intent === 'love-fortune' && '✨'}
                {intent === 'gifting-moment' && '🎁'}
                {intent === 'travel-match' && '✈️'}
              </span>
              <span className="font-semibold text-white/90">
                {dict.intents[intent]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            {lang === 'tr' ? 'Şimdi Başla' : 'Start Now'}
          </h2>
          <p className="text-white/60 mb-8">{dict.descriptions.default}</p>
          <Link
            href="/download"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-colors"
          >
            {t.cta}
          </Link>
        </div>
      </section>

      {/* Hidden SEO Content */}
      <div className="sr-only" aria-hidden="true">
        <article>
          <h3>TravelMatch - {dict.tagline}</h3>
          <p>{dict.descriptions.default}</p>
          <p>{dict.descriptions.dating}</p>
          <p>{dict.descriptions.travel}</p>
          <p>{dict.descriptions.luxury}</p>
        </article>
      </div>
    </main>
  );
}
