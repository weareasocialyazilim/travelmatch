'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type DemoStep = 'gift' | 'experience' | 'proof' | 'celebrate';

export function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState<DemoStep>('gift');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const steps: { id: DemoStep; title: string; description: string }[] = [
    { id: 'gift', title: 'Hediye Gönder', description: 'Sevdiklerinize deneyim hediye edin' },
    { id: 'experience', title: 'Deneyimle', description: 'Alıcı deneyimi yaşar' },
    { id: 'proof', title: 'Anı Paylaş', description: 'Proof Ceremony ile belgele' },
    { id: 'celebrate', title: 'Kutla', description: 'Para aktarılır, anılar kalır' },
  ];

  // Auto-advance demo
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setActiveStep(prev => {
        const currentIndex = steps.findIndex(s => s.id === prev);
        const nextIndex = (currentIndex + 1) % steps.length;
        return steps[nextIndex].id;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, steps]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Section header */}
      <div className="text-center mb-12">
        <h3 className="text-2xl font-bold mb-2">Nasıl Çalışır?</h3>
        <p className="text-gray-600">4 adımda hediye deneyimi</p>
      </div>

      {/* Demo container */}
      <div className="max-w-4xl mx-auto">
        {/* Phone mockup */}
        <div className="relative mx-auto w-72 md:w-80">
          {/* Phone frame */}
          <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
            {/* Screen */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
              {/* Status bar */}
              <div className="h-6 bg-gray-100 flex items-center justify-center">
                <div className="w-20 h-4 bg-gray-900 rounded-full" />
              </div>

              {/* Content */}
              <div className="p-4 h-full">
                <AnimatePresence mode="wait">
                  {activeStep === 'gift' && (
                    <DemoScreen key="gift">
                      <div className="text-center pt-8">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-pink-500 rounded-full flex items-center justify-center text-4xl mb-4">
                          🎁
                        </div>
                        <h4 className="font-bold text-lg">Kapadokya Balonu</h4>
                        <p className="text-gray-500 text-sm mt-1">₺2,500</p>
                        <div className="mt-6 bg-gradient-to-r from-amber-500 to-pink-500 text-white py-3 px-6 rounded-full text-sm font-medium">
                          Hediye Et
                        </div>
                      </div>
                    </DemoScreen>
                  )}

                  {activeStep === 'experience' && (
                    <DemoScreen key="experience">
                      <div className="relative h-full">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 rounded-lg flex items-center justify-center">
                          <span className="text-6xl">🎈</span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-xl p-3">
                          <p className="font-medium text-sm">Ayşe deneyimi yaşıyor! 🎈</p>
                          <p className="text-xs text-gray-500 mt-1">Kapadokya, Türkiye</p>
                        </div>
                      </div>
                    </DemoScreen>
                  )}

                  {activeStep === 'proof' && (
                    <DemoScreen key="proof">
                      <div className="pt-4">
                        {/* Sunset clock mini */}
                        <div className="w-full h-24 bg-gradient-to-b from-amber-200 via-orange-300 to-orange-400 rounded-xl mb-4 flex items-end justify-center pb-2">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-lg" />
                        </div>

                        {/* Camera button */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                          <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-2xl mb-2">
                            📸
                          </div>
                          <p className="text-sm text-gray-600">Anınızı yakalayın</p>
                        </div>

                        {/* AI analyzing */}
                        <div className="mt-4 flex items-center gap-2 justify-center text-sm text-emerald-600">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          AI doğruluyor...
                        </div>
                      </div>
                    </DemoScreen>
                  )}

                  {activeStep === 'celebrate' && (
                    <DemoScreen key="celebrate">
                      <div className="text-center pt-8">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-4xl mb-4">
                          ✨
                        </div>
                        <h4 className="font-bold text-lg">Harika! 🎉</h4>
                        <p className="text-gray-500 text-sm mt-1">Deneyim onaylandı</p>

                        <div className="mt-4 bg-emerald-50 text-emerald-700 py-2 px-4 rounded-lg text-sm">
                          💰 ₺2,500 hesaba aktarılıyor
                        </div>

                        <div className="mt-4 border rounded-lg p-3">
                          <p className="text-xs text-gray-500">Teşekkür Kartı</p>
                          <p className="text-sm font-medium mt-1">&quot;Harika bir hediyeydi! 💝&quot;</p>
                        </div>
                      </div>
                    </DemoScreen>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-200/50 to-pink-200/50 rounded-full blur-3xl" />
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-4 mt-12">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setActiveStep(step.id);
                setIsAutoPlaying(false);
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                activeStep === step.id
                  ? 'bg-amber-50 border-2 border-amber-500'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                activeStep === step.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className={`text-sm font-medium ${
                activeStep === step.id ? 'text-amber-700' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </button>
          ))}
        </div>

        {/* Current step description */}
        <p className="text-center text-gray-600 mt-4">
          {steps.find(s => s.id === activeStep)?.description}
        </p>
      </div>
    </motion.div>
  );
}

// Helper component for animated screen transitions
function DemoScreen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
