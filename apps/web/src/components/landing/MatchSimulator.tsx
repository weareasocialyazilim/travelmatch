'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MatchSimulator - ML/AI Interactive Demo
 *
 * Features:
 * - Interest selection buttons
 * - Fake "analyzing" animation (Tesla Dashboard style)
 * - Result cards with match scores
 * - Neural network visual background
 */

const INTERESTS = [
  { id: 'culture', label: 'Culture', icon: '🎭' },
  { id: 'solitude', label: 'Solitude', icon: '🏔️' },
  { id: 'adrenaline', label: 'Adrenaline', icon: '⚡' },
  { id: 'connection', label: 'Human Connection', icon: '💫' },
];

const MOCK_RESULTS = [
  { score: 94, label: 'Sacred Match', verified: true },
  { score: 87, label: 'Soul Alignment', verified: true },
  { score: 92, label: 'Energy Sync', verified: false },
];

export function MatchSimulator() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const startAnalysis = (interest: string) => {
    setSelected(interest);
    setIsAnalyzing(true);
    setShowResults(false);

    // Simulate ML processing time
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  const reset = () => {
    setSelected(null);
    setShowResults(false);
  };

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
            Select an interest and watch the magic happen.
          </p>
        </motion.div>

        {/* Interest Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {INTERESTS.map((interest) => (
            <button
              key={interest.id}
              onClick={() => startAnalysis(interest.id)}
              disabled={isAnalyzing}
              className={`px-6 py-3 rounded-full border text-sm font-bold uppercase tracking-wider
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                         ${
                           selected === interest.id
                             ? 'bg-secondary text-background border-secondary shadow-glow-purple'
                             : 'border-border text-muted hover:border-secondary hover:text-secondary'
                         }`}
            >
              <span className="mr-2">{interest.icon}</span>
              {interest.label}
            </button>
          ))}
        </motion.div>

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
              {!selected && !isAnalyzing && !showResults && (
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
                      Select an interest to pulse the network
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Analyzing State */}
              {isAnalyzing && (
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
                    Analyzing Sacred Data...
                  </motion.p>

                  {/* Progress Bar */}
                  <div className="w-48 h-1 bg-border rounded-full mt-6 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Results State */}
              {showResults && (
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
                          Match Found
                        </span>
                      </motion.div>
                      <h3 className="font-clash text-2xl font-bold text-foreground uppercase italic">
                        Your Sacred Alignment
                      </h3>
                    </div>

                    {/* Result Cards - Tesla Dashboard Style */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {MOCK_RESULTS.map((result, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="text-[10px] text-muted uppercase tracking-widest mb-2">
                            {result.label}
                          </div>
                          <div className="flex items-end gap-1">
                            <span className="text-4xl font-clash font-black text-primary">
                              {result.score}
                            </span>
                            <span className="text-primary text-lg mb-1">%</span>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            {result.verified && (
                              <span className="text-[9px] text-primary/70 uppercase tracking-wider">
                                Identity Pulse Verified
                              </span>
                            )}
                          </div>
                        </motion.div>
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
                        onClick={reset}
                        className="text-muted hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        ← Try Another Interest
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

export default MatchSimulator;
