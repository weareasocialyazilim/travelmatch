'use client';

import { motion } from 'framer-motion';
import { FeatureCard } from './FeatureCard';
import { InteractiveDemo } from './InteractiveDemo';

export function CeremonyShowcase() {
  return (
    <section className="py-24 bg-gradient-to-b from-amber-50 via-white to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            ✨ Yeni Özellik
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Hediye Vermek Hiç Bu Kadar{' '}
            <span className="bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
              Özel
            </span>{' '}
            Olmamıştı
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Proof Ceremony ile her deneyim paylaşılabilir bir anıya dönüşür.
            Sıradan doğrulamayı unutun, kutlamaya hazır olun!
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon="🌅"
            title="Sunset Clock"
            description="Deneyim deadline'ınızı sinematik gün batımı ile takip edin. Her an değerli."
            gradient="from-amber-400 to-orange-500"
            delay={0}
          />
          <FeatureCard
            icon="⭐"
            title="Trust Constellation"
            description="Güven skorunuz yıldız haritasında parlasın. Her doğrulama yeni bir yıldız."
            gradient="from-emerald-400 to-teal-500"
            delay={0.1}
          />
          <FeatureCard
            icon="🔐"
            title="Sacred Moments"
            description="Anılarınız şifreli kasada, sadece sizin kontrolünüzde. Paylaşmak size kalmış."
            gradient="from-pink-400 to-rose-500"
            delay={0.2}
          />
        </div>

        {/* Interactive Demo */}
        <InteractiveDemo />

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="/download"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            <span>Uygulamayı İndir</span>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
