'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NeuralChat - Neural Nexus Chatbot UI
 *
 * GenZ-friendly vibe check assistant
 * "Don't tell us where you want to go, tell us how you want to feel"
 *
 * Features:
 * - Minimalist floating button
 * - Smooth overlay animation
 * - Quick vibe suggestions
 * - AI-powered responses (connected to ML service)
 */

const VIBE_SUGGESTIONS = [
  { emoji: '⚡', label: 'Adrenaline', vibe: 'adrenaline' },
  { emoji: '🌙', label: 'Serenity', vibe: 'solitude' },
  { emoji: '💫', label: 'Connection', vibe: 'connection' },
  { emoji: '🎭', label: 'Culture', vibe: 'culture' },
];

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
}

export function NeuralChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content:
        "Hey! I'm your Neural Nexus guide. What vibe are you chasing today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (vibeOrMessage: string) => {
    if (!vibeOrMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: vibeOrMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (connect to ML service in production)
    setTimeout(() => {
      const responses: Record<string, string> = {
        adrenaline:
          "Sick choice! I'm sensing you need something that gets your heart racing. Skydiving in Cappadocia or midnight motorsport in Dubai?",
        solitude:
          'I feel that. Sometimes you need to disappear. A silent retreat in Bali or stargazing in the Sahara hits different.',
        connection:
          "Real ones only! Let's find you a soul that matches your frequency. Cultural exchange in Tokyo or volunteer vibes in Costa Rica?",
        culture:
          'Cultured king/queen! Hidden art galleries in Paris or underground jazz in New Orleans await.',
      };

      const isVibe = Object.keys(responses).includes(
        vibeOrMessage.toLowerCase(),
      );
      const responseContent = isVibe
        ? responses[vibeOrMessage.toLowerCase()]
        : "Interesting vibe! Let me process that through the Neural Nexus... Based on your energy, I'd recommend checking out our curated Sacred Moments. What draws you more - adventure or tranquility?";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent || 'No response available',
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleVibeClick = (vibe: string) => {
    handleSend(vibe);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 left-0 w-80 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-black text-xs font-bold">NN</span>
                </div>
                <div>
                  <h5 className="text-white font-clash font-bold text-sm">
                    Neural Nexus
                  </h5>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/40">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-primary text-black rounded-br-sm'
                        : 'bg-white/5 text-white/80 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                          className="w-1.5 h-1.5 bg-white/40 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Vibes */}
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {VIBE_SUGGESTIONS.map((vibe) => (
                  <button
                    key={vibe.vibe}
                    onClick={() => handleVibeClick(vibe.vibe)}
                    className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-white/60 hover:text-white transition-colors"
                  >
                    {vibe.emoji} {vibe.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  placeholder="Type your vibe..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className="w-9 h-9 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-white/10 border border-white/20'
            : 'bg-primary shadow-[0_0_30px_rgba(0,255,136,0.4)]'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </motion.svg>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-black rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification dot when closed */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-background"
        />
      )}
    </div>
  );
}

export default NeuralChat;
