/**
 * Ceremony Management Page
 *
 * Admin dashboard for managing Proof Ceremonies.
 * Shows metrics, pending reviews, and trust constellation stats.
 */

'use client';

import React, { useState } from 'react';
import {
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { toast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/common/page-header';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardBody,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProofReviewPanel } from '@/components/ceremony/ProofReviewPanel';
import { CeremonyAnalytics } from '@/components/ceremony/CeremonyAnalytics';

// Mock data - In production, this would come from Supabase
const mockStats = {
  verifiedToday: 47,
  verifiedChange: 12,
  pendingReview: 8,
  aiSuccessRate: 94,
  aiSuccessChange: 3,
  avgCeremonyTime: 4,
  totalCeremonies: 1234,
  rejectionRate: 6,
};

const mockTrustDistribution = {
  platinum: 234,
  gold: 567,
  silver: 890,
  bronze: 1456,
};

const mockPendingProofs = [
  {
    id: 'proof_1',
    userId: 'user_1',
    giftId: 'gift_1',
    userName: 'Ahmet Yılmaz',
    momentTitle: 'Kapadokya Balon Turu',
    mediaUrls: ['/api/placeholder/400/400', '/api/placeholder/400/400'],
    location: { lat: 38.6431, lng: 34.8289, name: 'Göreme, Kapadokya' },
    aiAnalysis: {
      confidence: 0.72,
      locationMatch: true,
      dateMatch: true,
      sceneAnalysis: 'Sıcak hava balonu ve kayalık oluşumlar tespit edildi',
      flags: ['Düşük ışık koşulları', 'Yüz tespit edilemedi'],
    },
    status: 'needs_review' as const,
    createdAt: new Date(),
  },
  {
    id: 'proof_2',
    userId: 'user_2',
    giftId: 'gift_2',
    userName: 'Zeynep Kaya',
    momentTitle: 'İstanbul Boğaz Turu',
    mediaUrls: ['/api/placeholder/400/400'],
    location: { lat: 41.0082, lng: 28.9784, name: 'Boğaziçi, İstanbul' },
    aiAnalysis: {
      confidence: 0.45,
      locationMatch: false,
      dateMatch: true,
      sceneAnalysis: 'Tekne ve deniz manzarası',
      flags: ['Konum eşleşmiyor', 'Olası stock fotoğraf'],
    },
    status: 'needs_review' as const,
    createdAt: new Date(),
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'verified' as const,
    userName: 'Mehmet Öz',
    momentTitle: 'Antalya Dalış',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'pending' as const,
    userName: 'Ayşe Demir',
    momentTitle: 'Pamukkale Gezi',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '3',
    type: 'rejected' as const,
    userName: 'Can Yücel',
    momentTitle: 'Efes Turu',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
];

export default function CeremonyManagementPage() {
  const [selectedProof, setSelectedProof] = useState(mockPendingProofs[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Mutation for approving a proof
  const approveMutation = useMutation({
    mutationFn: async (proofId: string) => {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('proof_ceremonies')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          reviewed_by: 'admin', // In production, use actual admin user ID
        })
        .eq('id', proofId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceremony-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-proofs'] });
      toast({
        title: 'Basarili',
        description: 'Proof basariyla onaylandi',
      });
    },
    onError: (error: Error) => {
      logger.error('Approve proof error', error);
      toast({
        title: 'Hata',
        description: error.message || 'Proof onaylanamadi',
        variant: 'destructive',
      });
    },
  });

  // Mutation for rejecting a proof
  const rejectMutation = useMutation({
    mutationFn: async ({
      proofId,
      reason,
    }: {
      proofId: string;
      reason: string;
    }) => {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('proof_ceremonies')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          reviewed_by: 'admin', // In production, use actual admin user ID
        })
        .eq('id', proofId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceremony-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-proofs'] });
      toast({
        title: 'Basarili',
        description: 'Proof reddedildi',
      });
    },
    onError: (error: Error) => {
      logger.error('Reject proof error', error);
      toast({
        title: 'Hata',
        description: error.message || 'Proof reddedilemedi',
        variant: 'destructive',
      });
    },
  });

  // Mutation for requesting more information
  const requestInfoMutation = useMutation({
    mutationFn: async ({
      proofId,
      message,
    }: {
      proofId: string;
      message: string;
    }) => {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('proof_ceremonies')
        .update({
          status: 'info_requested',
          info_request_message: message,
          info_requested_at: new Date().toISOString(),
          reviewed_by: 'admin', // In production, use actual admin user ID
        })
        .eq('id', proofId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceremony-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-proofs'] });
      toast({
        title: 'Basarili',
        description: 'Bilgi talebi gonderildi',
      });
    },
    onError: (error: Error) => {
      logger.error('Request info error', error);
      toast({
        title: 'Hata',
        description: error.message || 'Bilgi talebi gonderilemedi',
        variant: 'destructive',
      });
    },
  });

  const handleApprove = () => {
    if (!selectedProof?.id) return;
    approveMutation.mutate(selectedProof.id);
  };

  const handleReject = (reason: string) => {
    if (!selectedProof?.id) return;
    rejectMutation.mutate({ proofId: selectedProof.id, reason });
  };

  const handleRequestInfo = (message: string) => {
    if (!selectedProof?.id) return;
    requestInfoMutation.mutate({ proofId: selectedProof.id, message });
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Ceremony Management"
        description="Proof Ceremony metrikleri ve manuel inceleme yönetimi"
      />

      {/* Development Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
        <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Geliştirme Aşamasında
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Bu sayfa şu anda örnek verilerle çalışmaktadır. API entegrasyonu
            yakında eklenecektir.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <SparklesIcon className="w-4 h-4" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <ClockIcon className="w-4 h-4" />
            Bekleyen İncelemeler
            {mockPendingProofs.length > 0 && (
              <CanvaBadge variant="default" className="ml-1">
                {mockPendingProofs.length}
              </CanvaBadge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            Geçmiş
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CeremonyAnalytics
            stats={mockStats}
            trustDistribution={mockTrustDistribution}
            recentActivity={mockRecentActivity}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending list */}
            <CanvaCard className="lg:col-span-1">
              <CanvaCardHeader>
                <CanvaCardTitle className="text-lg">
                  Bekleyen Prooflar
                </CanvaCardTitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-2">
                  {mockPendingProofs.map((proof) => (
                    <button
                      key={proof.id}
                      onClick={() => setSelectedProof(proof)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedProof.id === proof.id
                          ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20'
                          : 'border-border hover:border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {proof.userName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {proof.momentTitle}
                          </p>
                        </div>
                        <CanvaBadge
                          variant={
                            proof.aiAnalysis.confidence >= 0.7
                              ? 'primary'
                              : 'error'
                          }
                        >
                          {(proof.aiAnalysis.confidence * 100).toFixed(0)}%
                        </CanvaBadge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {proof.aiAnalysis.flags.slice(0, 2).map((flag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}

                  {mockPendingProofs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                      <p>Bekleyen inceleme yok!</p>
                    </div>
                  )}
                </div>
              </CanvaCardBody>
            </CanvaCard>

            {/* Review panel */}
            <div className="lg:col-span-2">
              {selectedProof && (
                <ProofReviewPanel
                  proof={selectedProof}
                  expectedMoment={{
                    title: selectedProof.momentTitle,
                    location: selectedProof.location?.name,
                  }}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRequestMoreInfo={handleRequestInfo}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>İnceleme Geçmişi</CanvaCardTitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="text-center py-8 text-muted-foreground">
                <p>Geçmiş incelemeler burada listelenecek</p>
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
