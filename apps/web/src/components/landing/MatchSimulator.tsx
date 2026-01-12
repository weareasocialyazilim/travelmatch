'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNeuralMatch, type MatchRecommendation } from '@/hooks/useNeuralMatch';

/**
 * MatchSimulator - Real ML/AI Interactive Demo
 *
 * Features:
 * - Multi-interest selection
 * - Real API connection to ML service
 * - Tesla Dashboard style visualization
 * - Neural network visual background
 * - Actual match recommendations
 */

const INTERESTS = [
  { id: 'culture', label: 'Culture', icon: '🎭' },
  { id: 'solitude', label: 'Solitude', icon: '🏔️' },
  { id: 'adrenaline', label: 'Adrenaline', icon: '⚡' },
  { id: 'human connection', label: 'Human Connection', icon: '💫' },
  { id: 'gastronomy', label: 'Gastronomy', icon: '🍽️' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌙' },
];

export function MatchSimulator() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { result, isLoading, analyze, reset: resetMatch } = useNeuralMatch();

  const toggleInterest = (interestId: string) => {
    if (isLoading) return;

    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const startAnalysis = async () => {
    if (selectedInterests.length === 0) return;
    await analyze(selectedInterests);
  };

  const handleReset = () => {
    setSelectedInterests([]);
    resetMatch();
  };

  const showResults = result !== null && !isLoading;
  const isIdle = selectedInterests.length === 0 && !result && !isLoading;

  return (
    <section className="section-padding border-y border-border relative overflow-hidden">
      {/* Neural Network Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-secondary text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
            Neural Nexus
          </span>
          <h2 className="font-clash text-fluid-display font-black text-foreground uppercase italic leading-[0.85] tracking-tighter">
            Find Your
            <br />
            <span className="text-secondary">Neural Match</span>
          </h2>
          <p className="text-muted max-w-lg mx-auto mt-6 text-sm leading-relaxed">
            Our ML engine processes millions of data points to find your perfect moment.
            Select your interests and watch the magic happen.
          </p>
        </motion.div>

        {/* Interest Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {INTERESTS.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-full border text-sm font-bold uppercase tracking-wider
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                         ${
                           selectedInterests.includes(interest.id)
                             ? 'bg-secondary text-background border-secondary shadow-glow-purple'
                             : 'border-border text-muted hover:border-secondary hover:text-secondary'
                         }`}
            >
              <span className="mr-2">{interest.icon}</span>
              {interest.label}
            </button>
          ))}
        </motion.div>

        {/* Analyze Button */}
        {selectedInterests.length > 0 && !showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mb-8"
          >
            <button
              onClick={startAnalysis}
              disabled={isLoading}
              className="px-8 py-3 rounded-full bg-primary text-background font-bold uppercase tracking-wider
                        text-sm shadow-glow transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? 'Analyzing...' : `Analyze ${selectedInterests.length} Interest${selectedInterests.length > 1 ? 's' : ''}`}
            </button>
          </motion.div>
        )}

        {/* Simulator Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-4xl mx-auto"
        >
          <div
            className="min-h-[400px] border border-border rounded-[2.5rem] bg-card/30
                       backdrop-blur-xl overflow-hidden relative"
          >
            <AnimatePresence mode="wait">
              {/* Idle State */}
              {isIdle && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-border flex items-center justify-center">
                      <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-muted font-bold uppercase tracking-widest text-xs">
                      Select interests to pulse the network
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Selection Preview (before analysis) */}
              {selectedInterests.length > 0 && !isLoading && !showResults && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="flex gap-2 justify-center mb-6">
                      {selectedInterests.map((id) => {
                        const interest = INTERESTS.find((i) => i.id === id);
                        return (
                          <span
                            key={id}
                            className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs"
                          >
                            {interest?.icon} {interest?.label}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-muted font-bold uppercase tracking-widest text-xs">
                      Click Analyze to start neural matching
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Analyzing State */}
              {isLoading && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  {/* Spinner */}
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-2 border-secondary/20 rounded-full" />
                    <div className="absolute inset-0 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-2 border border-primary/20 rounded-full" />
                    <div
                      className="absolute inset-2 border border-primary border-t-transparent rounded-full animate-spin"
                      style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                    />
                  </div>

                  {/* Status Text */}
                  <motion.p
                    className="font-mono text-[10px] text-secondary tracking-[0.5em] uppercase"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Connecting to Neural Nexus...
                  </motion.p>

                  {/* Progress Bar */}
                  <div className="w-48 h-1 bg-border rounded-full mt-6 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Results State */}
              {showResults && result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center p-8"
                >
                  <div className="w-full">
                    {/* Result Header */}
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-primary text-xs font-bold uppercase tracking-wider">
                          Neural Path {result.neuralPath}
                        </span>
                      </motion.div>

                      {/* Overall Score */}
                      <div className="mb-4">
                        <span className="font-clash text-6xl font-black text-primary">
                          {result.score}
                        </span>
                        <span className="text-primary text-2xl">%</span>
                      </div>

                      <h3 className="font-clash text-xl font-bold text-foreground uppercase italic">
                        Match Score
                      </h3>
                      <p className="text-muted text-xs uppercase tracking-widest mt-1">
                        Vibe: {result.vibe}
                      </p>
                    </div>

                    {/* Recommendation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {result.recommendations.map((rec, idx) => (
                        <RecommendationCard key={rec.id} recommendation={rec} delay={idx} />
                      ))}
                    </div>

                    {/* Reset Button */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-center mt-8"
                    >
                      <button
                        onClick={handleReset}
                        className="text-muted hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        ← Try Different Interests
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-border/50" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-border/50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface RecommendationCardProps {
  recommendation: MatchRecommendation;
  delay: number;
}

function RecommendationCard({ recommendation, delay }: RecommendationCardProps) {
  const typeColors = {
    moment: 'text-primary',
    experience: 'text-secondary',
    person: 'text-accent',
  };

  const typeLabels = {
    moment: 'Sacred Moment',
    experience: 'Experience',
    person: 'Soul Match',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay * 0.1 }}
      className="p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group"
    >
      {/* Type Badge */}
      <div className={`text-[9px] uppercase tracking-widest mb-3 ${typeColors[recommendation.type]}`}>
        {typeLabels[recommendation.type]}
      </div>

      {/* Name */}
      <h4 className="font-clash font-bold text-foreground text-sm leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
        {recommendation.name}
      </h4>

      {/* Score */}
      <div className="flex items-end gap-1 mb-3">
        <span className="text-3xl font-clash font-black text-primary">
          {recommendation.score}
        </span>
        <span className="text-primary text-sm mb-1">%</span>
      </div>

      {/* Common Interests */}
      {recommendation.commonInterests.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recommendation.commonInterests.slice(0, 2).map((interest, i) => (
            <span
              key={i}
              className="text-[8px] px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider"
            >
              {interest}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default MatchSimulator;
