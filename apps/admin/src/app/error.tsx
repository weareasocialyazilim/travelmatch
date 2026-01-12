'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  CanvaCard,
  CanvaCardBody,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
} from '@/components/canva/CanvaCard';
import { logger } from '@/lib/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('Application Error', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <CanvaCard className="max-w-md w-full">
        <CanvaCardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CanvaCardTitle className="text-2xl">Bir Hata Oluştu</CanvaCardTitle>
          <CanvaCardSubtitle>
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya
            dönün.
          </CanvaCardSubtitle>
        </CanvaCardHeader>
        <CanvaCardBody className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <CanvaButton onClick={reset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </CanvaButton>
            <CanvaButton
              variant="primary"
              onClick={() => (window.location.href = '/queue')}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfa
            </CanvaButton>
          </div>
        </CanvaCardBody>
      </CanvaCard>
    </div>
  );
}
