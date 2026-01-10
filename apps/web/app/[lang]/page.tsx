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

// Translations - Disruptive Copy
const TRANSLATIONS: Record<
  string,
  {
    hero: string;
    heroLine2: string;
    subtitle: string;
    tagline: string;
    explore: string;
    popularCities: string;
    popularIntents: string;
    cta: string;
    pillars: {
      proofOfIntent: { title: string; desc: string };
      unbufferedMoments: { title: string; desc: string };
      engineeredLuck: { title: string; desc: string };
    };
  }
> = {
  en: {
    hero: 'STOP WAITING.',
    heroLine2: 'CONNECT INSTANTLY.',
    subtitle:
      'Quit the algorithm loop. Prove your intent with a gift, hack the queue, and teleport to the real world.',
    tagline: 'Not for the scrollers, but for those who live for the moment.',
    explore: 'Explore',
    popularCities: 'Popular Cities',
    popularIntents: 'Trending Categories',
    cta: 'Download App',
    pillars: {
      proofOfIntent: {
        title: 'Proof of Intent',
        desc: 'Skip the small talk. Move to the front of the line with a simple gesture. Show your intent, get noticed instantly.',
      },
      unbufferedMoments: {
        title: 'Unbuffered Moments',
        desc: 'Stop being a spectator. Real people sharing real moments in real places. Catch a moment and join the scene.',
      },
      engineeredLuck: {
        title: 'Engineered Luck',
        desc: "Luck isn't random; we control the velocity. The shortest path to meeting the right person at the right place.",
      },
    },
  },
  tr: {
    hero: 'BEKLEMEYİ BIRAK.',
    heroLine2: 'ANINDA BAĞ KUR.',
    subtitle:
      'Algoritma döngülerinden çık. Niyetini bir hediye ile kanıtla, bekleme sırasını hackle ve gerçek dünyaya ışınlan.',
    tagline: "Tinder'da kaybolanlar için değil, anı yaşayanlar için.",
    explore: 'Keşfet',
    popularCities: 'Popüler Şehirler',
    popularIntents: 'Trend Kategoriler',
    cta: 'Uygulamayı İndir',
    pillars: {
      proofOfIntent: {
        title: 'Niyetini Kanıtla',
        desc: 'Boş mesajlarla zaman kaybetme. Küçük bir jest ile etkileşim sırasının en önüne geç. Gerçek niyetini göster, anında fark edil.',
      },
      unbufferedMoments: {
        title: 'Filtresiz Gerçeklik',
        desc: 'Ekranın arkasına saklanma. Gerçek insanlar, gerçek mekanlarda, gerçek anlar paylaşıyor. Bir anı yakala ve o sahneye dahil ol.',
      },
      engineeredLuck: {
        title: 'Tasarlanmış Şans',
        desc: 'Şans tesadüf değildir, hızı biz ayarlarız. Doğru insanla doğru koordinatta karşılaşmanın en kestirme yolu.',
      },
    },
  },
  ar: {
    hero: 'توقف عن الانتظار.',
    heroLine2: 'اتصل فوراً.',
    subtitle: 'اخرج من حلقة الخوارزمية. أثبت نيتك بهدية، تخطى الطابور، وانتقل للعالم الحقيقي.',
    tagline: 'ليس للمتصفحين، بل لمن يعيشون اللحظة.',
    explore: 'استكشف',
    popularCities: 'المدن الشائعة',
    popularIntents: 'الفئات الرائجة',
    cta: 'تحميل التطبيق',
    pillars: {
      proofOfIntent: { title: 'إثبات النية', desc: 'تخطى الأحاديث الفارغة. انتقل إلى مقدمة الصف بإيماءة بسيطة.' },
      unbufferedMoments: { title: 'لحظات حقيقية', desc: 'توقف عن كونك متفرجاً. أناس حقيقيون يشاركون لحظات حقيقية.' },
      engineeredLuck: { title: 'حظ مهندس', desc: 'الحظ ليس عشوائياً؛ نحن نتحكم في السرعة.' },
    },
  },
  de: {
    hero: 'HÖR AUF ZU WARTEN.',
    heroLine2: 'VERBINDE DICH SOFORT.',
    subtitle: 'Verlasse die Algorithmus-Schleife. Beweise deine Absicht mit einem Geschenk, hacke die Warteschlange.',
    tagline: 'Nicht für Scroller, sondern für diejenigen, die den Moment leben.',
    explore: 'Entdecken',
    popularCities: 'Beliebte Städte',
    popularIntents: 'Trendkategorien',
    cta: 'App Herunterladen',
    pillars: {
      proofOfIntent: { title: 'Absichtsbeweis', desc: 'Überspringe den Smalltalk. Rücke mit einer einfachen Geste an die Spitze der Schlange.' },
      unbufferedMoments: { title: 'Ungefilterte Momente', desc: 'Hör auf, Zuschauer zu sein. Echte Menschen teilen echte Momente.' },
      engineeredLuck: { title: 'Konstruiertes Glück', desc: 'Glück ist nicht zufällig; wir kontrollieren die Geschwindigkeit.' },
    },
  },
  fr: {
    hero: 'ARRÊTE D\'ATTENDRE.',
    heroLine2: 'CONNECTE-TOI INSTANTANÉMENT.',
    subtitle: 'Quitte la boucle des algorithmes. Prouve ton intention avec un cadeau, hacke la file.',
    tagline: 'Pas pour les scrolleurs, mais pour ceux qui vivent l\'instant.',
    explore: 'Explorer',
    popularCities: 'Villes Populaires',
    popularIntents: 'Catégories Tendance',
    cta: 'Télécharger',
    pillars: {
      proofOfIntent: { title: 'Preuve d\'Intention', desc: 'Évite les bavardages. Passe devant avec un simple geste.' },
      unbufferedMoments: { title: 'Moments Non Filtrés', desc: 'Arrête d\'être spectateur. De vraies personnes partagent de vrais moments.' },
      engineeredLuck: { title: 'Chance Conçue', desc: 'La chance n\'est pas aléatoire ; nous contrôlons la vélocité.' },
    },
  },
  es: {
    hero: 'DEJA DE ESPERAR.',
    heroLine2: 'CONECTA AL INSTANTE.',
    subtitle: 'Sal del bucle de algoritmos. Demuestra tu intención con un regalo, hackea la cola.',
    tagline: 'No para los que scrollean, sino para los que viven el momento.',
    explore: 'Explorar',
    popularCities: 'Ciudades Populares',
    popularIntents: 'Categorías Trending',
    cta: 'Descargar App',
    pillars: {
      proofOfIntent: { title: 'Prueba de Intención', desc: 'Salta la charla vacía. Pasa al frente con un simple gesto.' },
      unbufferedMoments: { title: 'Momentos Sin Filtro', desc: 'Deja de ser espectador. Personas reales compartiendo momentos reales.' },
      engineeredLuck: { title: 'Suerte Diseñada', desc: 'La suerte no es aleatoria; controlamos la velocidad.' },
    },
  },
  ru: {
    hero: 'ХВАТИТ ЖДАТЬ.',
    heroLine2: 'ПОДКЛЮЧАЙСЯ МГНОВЕННО.',
    subtitle: 'Выйди из цикла алгоритмов. Докажи намерение подарком, взломай очередь.',
    tagline: 'Не для скроллеров, а для тех, кто живёт моментом.',
    explore: 'Исследовать',
    popularCities: 'Популярные Города',
    popularIntents: 'Трендовые Категории',
    cta: 'Скачать',
    pillars: {
      proofOfIntent: { title: 'Доказательство Намерения', desc: 'Пропусти пустую болтовню. Выйди вперёд простым жестом.' },
      unbufferedMoments: { title: 'Нефильтрованные Моменты', desc: 'Перестань быть зрителем. Реальные люди делятся реальными моментами.' },
      engineeredLuck: { title: 'Спроектированная Удача', desc: 'Удача не случайна; мы контролируем скорость.' },
    },
  },
  it: {
    hero: 'SMETTI DI ASPETTARE.',
    heroLine2: 'CONNETTITI ISTANTANEAMENTE.',
    subtitle: 'Esci dal loop degli algoritmi. Dimostra la tua intenzione con un regalo, hacka la coda.',
    tagline: 'Non per chi scrolla, ma per chi vive il momento.',
    explore: 'Esplora',
    popularCities: 'Città Popolari',
    popularIntents: 'Categorie di Tendenza',
    cta: 'Scarica App',
    pillars: {
      proofOfIntent: { title: 'Prova d\'Intenzione', desc: 'Salta le chiacchiere. Passa avanti con un semplice gesto.' },
      unbufferedMoments: { title: 'Momenti Non Filtrati', desc: 'Smetti di essere spettatore. Persone vere condividono momenti veri.' },
      engineeredLuck: { title: 'Fortuna Progettata', desc: 'La fortuna non è casuale; controlliamo la velocità.' },
    },
  },
  pt: {
    hero: 'PARE DE ESPERAR.',
    heroLine2: 'CONECTE-SE INSTANTANEAMENTE.',
    subtitle: 'Saia do loop de algoritmos. Prove sua intenção com um presente, hackeie a fila.',
    tagline: 'Não para quem scrolla, mas para quem vive o momento.',
    explore: 'Explorar',
    popularCities: 'Cidades Populares',
    popularIntents: 'Categorias em Alta',
    cta: 'Baixar App',
    pillars: {
      proofOfIntent: { title: 'Prova de Intenção', desc: 'Pule a conversa fiada. Vá para frente da fila com um simples gesto.' },
      unbufferedMoments: { title: 'Momentos Sem Filtro', desc: 'Pare de ser espectador. Pessoas reais compartilhando momentos reais.' },
      engineeredLuck: { title: 'Sorte Projetada', desc: 'Sorte não é aleatória; controlamos a velocidade.' },
    },
  },
  ja: {
    hero: '待つのをやめろ。',
    heroLine2: '今すぐ繋がれ。',
    subtitle: 'アルゴリズムのループから抜け出せ。ギフトで意図を証明し、列をハックしろ。',
    tagline: 'スクロラーのためではなく、今を生きる人のために。',
    explore: '探索',
    popularCities: '人気の都市',
    popularIntents: 'トレンドカテゴリ',
    cta: 'アプリをダウンロード',
    pillars: {
      proofOfIntent: { title: '意図の証明', desc: '無駄話をスキップ。シンプルなジェスチャーで列の先頭へ。' },
      unbufferedMoments: { title: 'フィルターなしの瞬間', desc: '傍観者をやめろ。本物の人が本物の瞬間を共有している。' },
      engineeredLuck: { title: '設計された運', desc: '運は偶然ではない。私たちが速度をコントロールする。' },
    },
  },
  ko: {
    hero: '기다리지 마.',
    heroLine2: '즉시 연결해.',
    subtitle: '알고리즘 루프에서 벗어나. 선물로 의도를 증명하고, 줄을 해킹해.',
    tagline: '스크롤러를 위한 것이 아닌, 순간을 사는 사람들을 위한 것.',
    explore: '탐색',
    popularCities: '인기 도시',
    popularIntents: '트렌드 카테고리',
    cta: '앱 다운로드',
    pillars: {
      proofOfIntent: { title: '의도의 증거', desc: '잡담을 건너뛰어. 간단한 제스처로 줄의 앞으로.' },
      unbufferedMoments: { title: '필터 없는 순간', desc: '구경꾼이 되지 마. 진짜 사람들이 진짜 순간을 공유해.' },
      engineeredLuck: { title: '설계된 행운', desc: '행운은 무작위가 아니야. 우리가 속도를 제어해.' },
    },
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
      {/* Hero Section - Disruptive Design */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black to-black" />
        {/* Animated Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-mono text-white/60">LIVE BETA V1.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 leading-[0.9]">
            <span className="block text-white">
              {t.hero}
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              {t.heroLine2}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-4 max-w-3xl mx-auto">
            {t.subtitle}
          </p>

          <p className="text-sm md:text-base font-mono text-purple-400 mb-10 tracking-wide">
            {t.tagline}
          </p>

          <Link
            href="/download"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-10 py-5 rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          >
            {t.cta}
            <span className="text-xl">→</span>
          </Link>
        </div>
      </section>

      {/* Power Pillars Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(t.pillars).map(([key, pillar]) => (
            <div
              key={key}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all"
            >
              <div className="text-4xl mb-4">
                {key === 'proofOfIntent' && '⚡'}
                {key === 'unbufferedMoments' && '🎯'}
                {key === 'engineeredLuck' && '🚀'}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
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
