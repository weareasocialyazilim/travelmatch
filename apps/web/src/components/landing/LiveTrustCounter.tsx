'use client';

import { motion } from 'framer-motion';
import {
  useRealtimeStats,
  useAnimatedNumber,
  formatCurrency,
  formatCompact,
} from '@/hooks/useRealtimeStats';

/**
 * LiveTrustCounter - Real-time platform statistics display
 *
 * Shows live data from Supabase:
 * - Escrow secured amount
 * - Active moments
 * - Verified users
 * - Gifts exchanged today
 * - Trust index
 *
 * Nvidia-style data visualization with glow effects
 */

export function LiveTrustCounter() {
  const { stats, isLoading } = useRealtimeStats({ refreshInterval: 30000 });

  // Animated numbers
  const animatedEscrow = useAnimatedNumber(stats.escrowSecured, 2000);
  const animatedMoments = useAnimatedNumber(stats.activeMoments, 1500);
  const animatedUsers = useAnimatedNumber(stats.verifiedUsers, 1500);
  const animatedGifts = useAnimatedNumber(stats.giftsToday, 1000);
  const animatedTrust = useAnimatedNumber(stats.trustIndex, 1000);

  return (
    <section
      className="section-padding relative overflow-hidden bg-card/30"
      id="trust-stats"
    >
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-secondary text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
            Live Protocol Status
          </span>
          <h2 className="font-clash text-fluid-lg font-black text-foreground uppercase italic tracking-tighter">
            Trust <span className="text-primary">Index</span>
          </h2>
        </motion.div>

        {/* Main Trust Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-16"
        >
          <div className="relative">
            {/* Circular gauge */}
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              className="transform -rotate-90"
            >
              {/* Background arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-border"
                strokeDasharray="502.65"
                strokeDashoffset="125.66" // 75% arc
              />
              {/* Progress arc */}
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="url(#trustGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="502.65"
                initial={{ strokeDashoffset: 502.65 }}
                animate={{
                  strokeDashoffset:
                    502.65 - (animatedTrust / 100) * 376.99 + 125.66,
                }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient
                  id="trustGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#00FF88" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-clash text-5xl font-black text-foreground">
                {animatedTrust}
              </span>
              <span className="text-[10px] text-muted uppercase tracking-widest mt-1">
                Trust Score
              </span>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 blur-2xl opacity-30">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-primary/50 to-secondary/50" />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            label="Escrow Secured"
            value={formatCurrency(animatedEscrow)}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            highlight
            delay={0}
            isLoading={isLoading}
          />

          <StatCard
            label="Active Moments"
            value={formatCompact(animatedMoments)}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            delay={0.1}
            isLoading={isLoading}
          />

          <StatCard
            label="Verified Users"
            value={formatCompact(animatedUsers)}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
            delay={0.2}
            isLoading={isLoading}
          />

          <StatCard
            label="Gifts Today"
            value={animatedGifts.toString()}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            }
            delay={0.3}
            isLoading={isLoading}
          />
        </div>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-8"
        >
          <div className="flex items-center gap-2 text-[10px] text-muted uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Live Data
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
  delay: number;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  icon,
  highlight,
  delay,
  isLoading,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative p-6 rounded-2xl border ${
        highlight
          ? 'bg-primary/5 border-primary/30'
          : 'bg-card/50 border-border'
      } backdrop-blur-sm group hover:border-primary/50 transition-colors`}
    >
      {/* Icon */}
      <div
        className={`mb-4 ${highlight ? 'text-primary' : 'text-muted'} group-hover:text-primary transition-colors`}
      >
        {icon}
      </div>

      {/* Value */}
      <div
        className={`font-clash text-2xl md:text-3xl font-black ${
          highlight ? 'text-primary' : 'text-foreground'
        } ${isLoading ? 'animate-pulse' : ''}`}
      >
        {value}
      </div>

      {/* Label */}
      <div className="text-[10px] text-muted uppercase tracking-widest mt-2">
        {label}
      </div>

      {/* Corner decoration */}
      {highlight && (
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-primary/30" />
      )}
    </motion.div>
  );
}

export default LiveTrustCounter;
