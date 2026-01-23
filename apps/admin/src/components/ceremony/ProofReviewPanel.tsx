/**
 * ProofReviewPanel Component
 *
 * Admin panel for AI-assisted proof review.
 * Shows proof media, AI analysis results, and approval actions.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AIAnalysis {
  confidence: number;
  locationMatch: boolean;
  dateMatch: boolean;
  sceneAnalysis: string;
  flags: string[];
}

interface Proof {
  id: string;
  userId: string;
  giftId: string;
  mediaUrls: string[];
  location?: { lat: number; lng: number; name: string };
  aiAnalysis: AIAnalysis;
  status: 'pending' | 'needs_review' | 'verified' | 'rejected';
  createdAt: Date;
}

interface ExpectedMoment {
  title: string;
  location?: string;
}

interface ProofReviewPanelProps {
  proof: Proof;
  expectedMoment: ExpectedMoment;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onRequestMoreInfo: (message: string) => void;
}

export function ProofReviewPanel({
  proof,
  expectedMoment,
  onApprove,
  onReject,
  onRequestMoreInfo,
}: ProofReviewPanelProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-500';
    if (confidence >= 0.5) return 'text-amber-500';
    return 'text-red-500';
  };

  const getStatusVariant = (status: Proof['status']) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'needs_review':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  const handleRequestInfo = () => {
    if (infoMessage.trim()) {
      onRequestMoreInfo(infoMessage);
      setShowInfoModal(false);
      setInfoMessage('');
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Kanıt İnceleme</h2>
        <CanvaBadge variant={getStatusVariant(proof.status) as any}>
          {proof.status === 'needs_review'
            ? 'İnceleme Bekliyor'
            : proof.status === 'verified'
              ? 'Onaylandı'
              : proof.status === 'rejected'
                ? 'Reddedildi'
                : 'Beklemede'}
        </CanvaBadge>
      </div>

      {/* Media gallery */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {proof.mediaUrls.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setLightboxImage(url)}
          >
            <Image
              src={url}
              alt={`Proof ${i + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* AI Analysis */}
      <div className="bg-muted rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-amber-500" />
          AI Analizi
        </h3>

        <div className="space-y-3">
          {/* Confidence Score */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Güven Skoru:</span>
            <span
              className={cn(
                'font-bold',
                getConfidenceColor(proof.aiAnalysis.confidence),
              )}
            >
              {(proof.aiAnalysis.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Location Match */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              Konum Eşleşmesi:
            </span>
            {proof.aiAnalysis.locationMatch ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500" />
            )}
          </div>

          {/* Date Match */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              Tarih Doğrulaması:
            </span>
            {proof.aiAnalysis.dateMatch ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500" />
            )}
          </div>

          {/* Scene Analysis */}
          <div className="pt-2 border-t border-border">
            <span className="text-muted-foreground text-sm">
              Sahne Analizi:
            </span>
            <p className="text-foreground mt-1">
              {proof.aiAnalysis.sceneAnalysis}
            </p>
          </div>

          {/* Flags */}
          {proof.aiAnalysis.flags.length > 0 && (
            <div className="mt-3 p-3 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
              <p className="text-red-700 dark:text-red-400 font-medium flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Uyarılar:
              </p>
              <ul className="text-red-600 dark:text-red-400 text-sm mt-1 space-y-1">
                {proof.aiAnalysis.flags.map((flag, i) => (
                  <li key={i}>• {flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Expected vs Actual */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
          <h4 className="font-medium text-blue-700 dark:text-blue-400 text-sm">
            Beklenen
          </h4>
          <p className="text-blue-900 dark:text-blue-300 font-medium mt-1">
            {expectedMoment.title}
          </p>
          {expectedMoment.location && (
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-1 flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              {expectedMoment.location}
            </p>
          )}
        </div>
        <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
          <h4 className="font-medium text-emerald-700 dark:text-emerald-400 text-sm">
            Tespit Edilen
          </h4>
          <p className="text-emerald-900 dark:text-emerald-300 font-medium mt-1">
            {proof.aiAnalysis.sceneAnalysis}
          </p>
          {proof.location && (
            <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-1 flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              {proof.location.name}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <CanvaButton
          variant="primary"
          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
          onClick={onApprove}
        >
          <CheckIcon className="w-5 h-5 mr-2" />
          Onayla
        </CanvaButton>
        <CanvaButton
          variant="outline"
          className="border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 dark:hover:bg-amber-500/20"
          onClick={() => setShowInfoModal(true)}
        >
          <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
          Ek Bilgi İste
        </CanvaButton>
        <CanvaButton variant="danger" onClick={() => setShowRejectModal(true)}>
          <XMarkIcon className="w-5 h-5 mr-2" />
          Reddet
        </CanvaButton>
      </div>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kanıtı Reddet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground">
              Ret Nedeni
            </label>
            <Textarea
              value={rejectReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRejectReason(e.target.value)
              }
              placeholder="Kullanıcıya net ve saygılı bir açıklama yazın..."
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <CanvaButton
              variant="outline"
              onClick={() => setShowRejectModal(false)}
            >
              İptal
            </CanvaButton>
            <CanvaButton variant="danger" onClick={handleReject}>
              Reddet
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ek Bilgi İste</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground">
              Mesajınız
            </label>
            <Textarea
              value={infoMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInfoMessage(e.target.value)
              }
              placeholder="Kullanıcıdan hangi bilgiyi istediğinizi açıkça belirtin..."
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <CanvaButton
              variant="outline"
              onClick={() => setShowInfoModal(false)}
            >
              İptal
            </CanvaButton>
            <CanvaButton onClick={handleRequestInfo}>Gönder</CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxImage && (
        <Dialog
          open={!!lightboxImage}
          onOpenChange={() => setLightboxImage(null)}
        >
          <DialogContent className="max-w-4xl">
            <div className="relative aspect-video">
              <Image
                src={lightboxImage}
                alt="Proof detail"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ProofReviewPanel;
