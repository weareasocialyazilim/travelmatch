'use client';

import { useState, useEffect, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SmoothScrollProvider } from '@/providers/SmoothScroll';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Navbar } from '@/components/layout/Navbar';
import { Preloader } from '@/components/ui/Preloader';

/**
 * AppProvider - Client-side wrapper for all providers and UI elements
 *
 * Features:
 * - Preloader management
 * - Smooth scroll provider
 * - Custom cursor
 * - Navbar
 */

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent scroll during loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  // Don't render anything on server
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Preloader */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader
            onComplete={() => setIsLoading(false)}
            minDuration={2500}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      {!isLoading && (
        <SmoothScrollProvider>
          <CustomCursor />
          <Navbar />
          <main className="relative z-10">{children}</main>
        </SmoothScrollProvider>
      )}
    </>
  );
}

export default AppProvider;
