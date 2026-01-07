import type { Metadata } from 'next';
import { CeremonyShowcase } from '@/components/ceremony/CeremonyShowcase';
import { TrustBadgeDisplay } from '@/components/ceremony/TrustBadgeDisplay';

// Pre-generate star positions to avoid calling Math.random() during render
const starPositions = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: `${(i * 17 + 7) % 100}%`,
  left: `${(i * 23 + 11) % 100}%`,
  delay: `${(i * 0.1) % 2}s`,
}));

export const metadata: Metadata = {
  title: 'Proof Ceremony - TravelMatch',
  description:
    'Hediye deneyimlerinizi unutulmaz anılara dönüştürün. AI destekli doğrulama, Sunset Clock ve daha fazlası.',
};

export default function ProofCeremonyPage() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Proof Ceremony
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Hediye doğrulamasını sıkıcı bir işlemden kutlanacak bir ana
            dönüştürdük.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/download"
              className="px-8 py-4 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-600 transition"
            >
              Hemen Dene
            </a>
            <a
              href="#features"
              className="px-8 py-4 border-2 border-gray-300 font-semibold rounded-full hover:border-gray-400 transition"
            >
              Özellikleri Gör
            </a>
          </div>
        </div>
      </section>

      {/* Main Showcase */}
      <CeremonyShowcase />

      {/* Trust Stats */}
      <TrustBadgeDisplay
        stats={{
          totalGifts: 15000,
          verifiedProofs: 12000,
          happyUsers: 8500,
          countriesReached: 23,
        }}
      />

      {/* Detailed Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          {/* Sunset Clock detail */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h3 className="text-3xl font-bold mb-4">🌅 Sunset Clock</h3>
              <p className="text-gray-600 mb-6">
                Proof deadline&apos;ınız yaklaştıkça, gökyüzü renk değiştirir.
                Altın saatten alacakaranlığa, her an bir hatırlatma.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Sinematik animasyonlar
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Haptic bildirimler
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Premium süre uzatma
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-b from-amber-200 via-orange-300 to-purple-400 rounded-2xl h-64 flex items-end justify-center pb-8">
              <div className="w-16 h-16 bg-yellow-400 rounded-full shadow-2xl" />
            </div>
          </div>

          {/* Trust Constellation detail */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 md:order-1 bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl h-64 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0">
                {starPositions.map((star) => (
                  <div
                    key={star.id}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      top: star.top,
                      left: star.left,
                      animationDelay: star.delay,
                    }}
                  />
                ))}
              </div>
              <div className="text-6xl">⭐</div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold mb-4">
                ⭐ Trust Constellation
              </h3>
              <p className="text-gray-600 mb-6">
                Güven skorunuz sayısal olmaktan çıkıp görsel bir yıldız
                haritasına dönüşür. Her başarılı doğrulama yeni bir yıldız
                ekler.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Kişiselleştirilmiş yıldız haritası
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Başarı rozetleri
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Paylaşılabilir profil kartı
                </li>
              </ul>
            </div>
          </div>

          {/* Sacred Moments detail */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">🔐 Sacred Moments</h3>
              <p className="text-gray-600 mb-6">
                En özel anlarınız uçtan uca şifreleme ile korunur. Sadece siz
                kontrol edersiniz - kiminle, ne zaman paylaşacağınızı.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Uçtan uca şifreleme
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Screenshot koruması
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Süreli paylaşım linkleri
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl h-64 flex items-center justify-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <span className="text-5xl">🔐</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-500 to-pink-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Hediye Deneyimini Yeniden Keşfet
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Proof Ceremony ile her deneyim unutulmaz bir anıya dönüşür. Hemen
            uygulamayı indir ve farkı yaşa.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/download"
              className="px-8 py-4 bg-white text-amber-600 font-semibold rounded-full hover:bg-gray-100 transition shadow-lg"
            >
              App Store
            </a>
            <a
              href="/download"
              className="px-8 py-4 bg-white text-amber-600 font-semibold rounded-full hover:bg-gray-100 transition shadow-lg"
            >
              Google Play
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
