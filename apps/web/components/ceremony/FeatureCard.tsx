'use client';

import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
        {/* Gradient background on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
        />

        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} text-3xl mb-6 shadow-lg`}
        >
          {icon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-3 group-hover:text-amber-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>

        {/* Learn more link */}
        <a
          href="#"
          className="inline-flex items-center gap-1 mt-4 text-amber-500 font-medium hover:text-amber-600 transition-colors"
        >
          Daha fazla
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
