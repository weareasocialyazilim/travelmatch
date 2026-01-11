/**
 * Ceremony Management Page
 *
 * Admin dashboard for managing Proof Ceremonies.
 * Shows metrics, pending reviews, and trust constellation stats.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/common/page-header';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { CanvaInput } from '@/components/canva/CanvaInput';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const handleApprove = () => {
    // TODO: Implement API call to approve proof
    void selectedProof.id;
  };

  const handleReject = (_reason: string) => {
    // TODO: Implement API call to reject proof with reason
    void selectedProof.id;
  };

  const handleRequestInfo = (_message: string) => {
    // TODO: Implement API call to request more info
    void selectedProof.id;
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Ceremony Management"
        description="Proof Ceremony metrikleri ve manuel inceleme yönetimi"
      />

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
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Bekleyen Prooflar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockPendingProofs.map((proof) => (
                    <button
                      key={proof.id}
                      onClick={() => setSelectedProof(proof)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedProof.id === proof.id
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {proof.userName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {proof.momentTitle}
                          </p>
                        </div>
                        <CanvaBadge
                          variant={
                            proof.aiAnalysis.confidence >= 0.7
                              ? 'primary'
                              : 'destructive'
                          }
                        >
                          {(proof.aiAnalysis.confidence * 100).toFixed(0)}%
                        </CanvaBadge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {proof.aiAnalysis.flags.slice(0, 2).map((flag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}

                  {mockPendingProofs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                      <p>Bekleyen inceleme yok!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
          <Card>
            <CardHeader>
              <CardTitle>İnceleme Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Geçmiş incelemeler burada listelenecek</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
