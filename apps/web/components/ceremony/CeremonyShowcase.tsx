/**
 * CeremonyShowcase Component
 *
 * Marketing component for the landing page.
 * Showcases the Proof Ceremony features with animations.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Feature card data
const features = [
  {
    id: 'sunset',
    emoji: '🌅',
    title: 'Sunset Clock',
    description:
      'Deneyim deadline\'ınızı sinematik gün batımı animasyonuyla takip edin. Zaman azaldıkça gökyüzü değişir.',
    gradient: 'from-amber-400 to-orange-500',
    image: '/images/ceremony/sunset-preview.jpg',
  },
  {
    id: 'constellation',
    emoji: '⭐',
    title: 'Trust Constellation',
    description:
      'Güven skorunuz numerik rakamlar yerine yıldız haritasında parlasın. Her doğrulama yeni bir yıldız.',
    gradient: 'from-emerald-400 to-teal-500',
    image: '/images/ceremony/constellation-preview.jpg',
  },
  {
    id: 'sacred',
    emoji: '🔐',
    title: 'Sacred Moments',
    description:
      'Anılarınız şifreli kasada, sadece sizin kontrolünüzde. Screenshot koruması ile özel anlarınız güvende.',
    gradient: 'from-pink-400 to-rose-500',
    image: '/images/ceremony/sacred-preview.jpg',
  },
  {
    id: 'passport',
    emoji: '🛂',
    title: 'Digital Passport',
    description:
      'Doğrulamalarınız dijital pasaportunuzda vize damgaları olarak görünsün. Her damga bir başarı.',
    gradient: 'from-blue-400 to-indigo-500',
    image: '/images/ceremony/passport-preview.jpg',
  },
];

interface FeatureCardProps {
  feature: (typeof features)[0];
  isSelected: boolean;
  onClick: () => void;
}

function FeatureCard({ feature, isSelected, onClick }: FeatureCardProps) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
        isSelected
          ? 'bg-white shadow-xl ring-2 ring-amber-500'
          : 'bg-white/60 hover:bg-white hover:shadow-lg'
      }`}
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${feature.gradient}`}
      >
        {feature.emoji}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-4">{feature.title}</h3>

      <p className="text-gray-600 text-sm mt-2 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function CeremonyShowcase() {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);

  return (
    <section className="py-24 bg-gradient-to-b from-amber-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
            ✨ Proof Ceremony
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hediye Vermek Hiç Bu Kadar{' '}
            <span className="bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
              Özel
            </span>{' '}
            Olmamıştı
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Proof Ceremony ile her deneyim paylaşılabilir bir anıya dönüşür.
            Doğrulama sürecini duygusal bir yolculuğa çevirdik.
          </p>
        </motion.div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                isSelected={selectedFeature.id === feature.id}
                onClick={() => setSelectedFeature(feature)}
              />
            ))}
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            {/* Phone mockup */}
            <div className="relative mx-auto w-[280px] md:w-[320px]">
              {/* Phone frame */}
              <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />

                {/* Screen */}
                <div className="relative bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedFeature.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      {/* Preview content based on selected feature */}
                      <FeaturePreview feature={selectedFeature} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-amber-400 to-pink-500 rounded-full blur-3xl opacity-30" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl opacity-30" />
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '50K+', label: 'Tamamlanan Ceremony' },
            { value: '94%', label: 'AI Doğrulama Başarısı' },
            { value: '4dk', label: 'Ortalama Süre' },
            { value: '4.9★', label: 'Kullanıcı Puanı' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Feature preview component
function FeaturePreview({ feature }: { feature: (typeof features)[0] }) {
  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${feature.gradient} p-6 flex flex-col items-center justify-center text-white`}
    >
      <span className="text-6xl mb-4">{feature.emoji}</span>
      <h4 className="text-xl font-bold text-center">{feature.title}</h4>
      <p className="text-sm text-white/80 text-center mt-2 max-w-[200px]">
        {feature.description.slice(0, 80)}...
      </p>

      {/* Animated elements based on feature */}
      {feature.id === 'sunset' && (
        <motion.div
          className="absolute bottom-20 w-16 h-16 bg-yellow-300 rounded-full shadow-lg"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {feature.id === 'constellation' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                delay: Math.random(),
              }}
            />
          ))}
        </div>
      )}

      {feature.id === 'sacred' && (
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-4xl">🔒</span>
        </motion.div>
      )}

      {feature.id === 'passport' && (
        <motion.div
          className="absolute bottom-16 w-20 h-28 bg-blue-900 rounded-lg shadow-lg"
          animate={{ rotateY: [0, 180, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          style={{ transformStyle: 'preserve-3d' }}
        />
      )}
    </div>
  );
}

export default CeremonyShowcase;
