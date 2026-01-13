'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  CanvaCard,
  CanvaCardBody,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
} from '@/components/canva/CanvaCard';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <CanvaCard className="max-w-md w-full">
        <CanvaCardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CanvaCardTitle className="text-4xl font-bold">404</CanvaCardTitle>
          <CanvaCardSubtitle className="text-lg">
            Sayfa Bulunamadı
          </CanvaCardSubtitle>
        </CanvaCardHeader>
        <CanvaCardBody className="space-y-4">
          <p className="text-center text-muted-foreground">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <div className="flex gap-2">
            <Link href="/queue" className="flex-1">
              <CanvaButton className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfa
              </CanvaButton>
            </Link>
            <CanvaButton
              variant="primary"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </CanvaButton>
          </div>
        </CanvaCardBody>
      </CanvaCard>
    </div>
  );
}
