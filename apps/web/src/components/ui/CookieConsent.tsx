'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'tm_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'tm_cookie_preferences';

export function CookieConsent() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  // Check if user has already consented
  useEffect(() => {
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsented) {
      // Small delay to let page load first
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  const saveConsent = useCallback((prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowCustomize(false);

    // Dispatch event for analytics/marketing scripts
    window.dispatchEvent(
      new CustomEvent('cookieConsentChanged', { detail: prefs }),
    );
  }, []);

  const handleAcceptAll = useCallback(() => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  }, [saveConsent]);

  const handleAcceptNecessary = useCallback(() => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  }, [saveConsent]);

  const handleSavePreferences = useCallback(() => {
    saveConsent(preferences);
  }, [saveConsent, preferences]);

  const togglePreference = (key: keyof Omit<CookiePreferences, 'necessary'>) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[420px] z-50"
        >
          <div className="glass-card rounded-2xl p-5 shadow-2xl border border-white/10">
            {/* Main Banner */}
            {!showCustomize ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--neon-purple)]/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[var(--neon-purple)]"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="8" cy="9" r="1.5" fill="currentColor" />
                      <circle cx="15" cy="8" r="1" fill="currentColor" />
                      <circle cx="10" cy="14" r="1" fill="currentColor" />
                      <circle cx="16" cy="13" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="11" r="0.5" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base mb-1">
                      {t('cookie.title')}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t('cookie.description')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--neon-purple)] text-white font-medium text-sm
                             hover:bg-[var(--neon-purple)]/80 transition-all duration-200
                             focus:outline-none focus:ring-2 focus:ring-[var(--neon-purple)] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                  >
                    {t('cookie.acceptAll')}
                  </button>
                  <button
                    onClick={handleAcceptNecessary}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white font-medium text-sm
                             hover:bg-white/10 transition-all duration-200 border border-white/10
                             focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                  >
                    {t('cookie.acceptNecessary')}
                  </button>
                </div>

                <button
                  onClick={() => setShowCustomize(true)}
                  className="w-full text-white/40 text-xs hover:text-white/60 transition-colors underline underline-offset-2"
                >
                  {t('cookie.customize')}
                </button>
              </div>
            ) : (
              /* Customize Panel */
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-base">
                  {t('cookie.customize')}
                </h3>

                {/* Necessary Cookies - Always on */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {t('cookie.necessary')}
                    </p>
                    <p className="text-white/40 text-xs">
                      {t('cookie.necessaryDesc')}
                    </p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-[var(--neon-purple)] flex items-center justify-end px-1 opacity-50 cursor-not-allowed">
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {t('cookie.analytics')}
                    </p>
                    <p className="text-white/40 text-xs">
                      {t('cookie.analyticsDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-all duration-200 ${
                      preferences.analytics
                        ? 'bg-[var(--neon-purple)] justify-end'
                        : 'bg-white/20 justify-start'
                    }`}
                    aria-label="Toggle analytics cookies"
                  >
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {t('cookie.marketing')}
                    </p>
                    <p className="text-white/40 text-xs">
                      {t('cookie.marketingDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-all duration-200 ${
                      preferences.marketing
                        ? 'bg-[var(--neon-purple)] justify-end'
                        : 'bg-white/20 justify-start'
                    }`}
                    aria-label="Toggle marketing cookies"
                  >
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white font-medium text-sm
                             hover:bg-white/10 transition-all duration-200 border border-white/10"
                  >
                    ←
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="flex-[3] px-4 py-2.5 rounded-xl bg-[var(--neon-purple)] text-white font-medium text-sm
                             hover:bg-[var(--neon-purple)]/80 transition-all duration-200"
                  >
                    {t('cookie.save')}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Policy Link */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <a
                href="/privacy"
                className="text-white/30 text-xs hover:text-white/50 transition-colors flex items-center gap-1"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {t('cookie.privacyPolicy')}
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;
