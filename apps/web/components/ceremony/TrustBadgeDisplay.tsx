'use client';

import { motion } from 'framer-motion';

interface TrustBadgeDisplayProps {
  stats: {
    totalGifts: number;
    verifiedProofs: number;
    happyUsers: number;
    countriesReached: number;
  };
}

export function TrustBadgeDisplay({ stats }: TrustBadgeDisplayProps) {
  const badges = [
    {
      value: `${(stats.totalGifts / 1000).toFixed(0)}K+`,
      label: 'Hediye Gönderildi',
      icon: '🎁',
    },
    {
      value: `${(stats.verifiedProofs / 1000).toFixed(0)}K+`,
      label: 'Anı Onaylandı',
      icon: '✨',
    },
    {
      value: `${stats.happyUsers.toLocaleString()}+`,
      label: 'Mutlu Kullanıcı',
      icon: '😊',
    },
    {
      value: `${stats.countriesReached}+`,
      label: 'Ülkeye Ulaştı',
      icon: '🌍',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {badge.value}
              </div>
              <div className="text-gray-400 text-sm">{badge.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
