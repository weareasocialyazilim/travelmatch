'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie-consent-accepted';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasAccepted) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
    // Disable analytics if declined
    if (typeof window !== 'undefined') {
      (window as any).analyticsDisabled = true;
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-4 animate-in slide-in-from-bottom">
      <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Bu site, deneyiminizi iyileştirmek için çerezler kullanmaktadır.
            Siteyi kullanmaya devam ederek{' '}
            <a href="/privacy" className="underline hover:text-primary">
              Gizlilik Politikamızı
            </a>{' '}
            ve{' '}
            <a href="/terms" className="underline hover:text-primary">
              Kullanım Koşullarımızı
            </a>{' '}
            kabul etmiş olursunuz.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={declineCookies}>
            Reddet
          </Button>
          <Button size="sm" onClick={acceptCookies}>
            Kabul Et
          </Button>
          <button
            onClick={declineCookies}
            className="p-1 hover:bg-muted rounded-full"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
