'use client';

import { motion } from 'framer-motion';
import {
  useExperienceAssistant,
  useTrustScore,
} from '@/hooks/useExperienceAssistant';

/**
 * ExperienceAssistant - Deneyim Asistanı UI Bileşeni
 * ML önerilerini kullanıcıya samimi bir dille sunar
 */

interface ExperienceAssistantProps {
  userId?: string;
  interests?: string[];
  className?: string;
}

export function ExperienceAssistant({
  userId,
  interests = [],
  className = '',
}: ExperienceAssistantProps) {
  const { insights, isLoading } = useExperienceAssistant(userId, interests);

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>💫</span>
        <h3
          className="font-syne font-bold text-white"
          style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }}
        >
          Deneyim Asistanı
        </h3>
      </div>

      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <motion.div
            whileHover={{ x: 5 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                {insight.icon}
              </span>
              <div>
                <h4
                  className="font-bold text-white mb-1"
                  style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                >
                  {insight.title}
                </h4>
                <p
                  className="text-gray-400"
                  style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
                >
                  {insight.description}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * TrustBadges - Güvenilirlik Rozetleri
 */
interface TrustBadgesProps {
  userId?: string;
  compact?: boolean;
  className?: string;
}

export function TrustBadges({
  userId,
  compact = false,
  className = '',
}: TrustBadgesProps) {
  const { score, badges, message, isLoading } = useTrustScore(userId);

  if (isLoading) {
    return (
      <div
        className={`animate-pulse h-8 bg-white/5 rounded-full w-32 ${className}`}
      />
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
          <span
            className="text-[#ccff00]"
            style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
          >
            {score}%
          </span>
          <span
            className="text-gray-400"
            style={{ fontSize: 'clamp(0.625rem, 1.25vw, 0.75rem)' }}
          >
            güvenilir
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }}>🛡️</span>
        <span
          className="font-bold text-white"
          style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
        >
          Güvenilirlik: <span className="text-[#ccff00]">{score}%</span>
        </span>
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {badges.map((badge, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 rounded-full text-sm"
              style={{ fontSize: 'clamp(0.625rem, 1.25vw, 0.75rem)' }}
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      <p
        className="text-gray-400"
        style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
      >
        {message}
      </p>
    </div>
  );
}

export default ExperienceAssistant;
