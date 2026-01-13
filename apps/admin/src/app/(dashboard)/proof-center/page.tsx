'use client';

/**
 * TravelMatch Proof Verification Center
 * AI destekli kanit dogrulama merkezi
 *
 * Proof queue, AI skorlari, manuel inceleme ve kalite metrikleri
 */

import { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Brain,
  MapPin,
  Calendar,
  User,
  Image as ImageIcon,
  Video,
  FileText,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Search,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  Shield,
  MoreHorizontal,
  ExternalLink,
  ZoomIn,
  Flag,
  MessageSquare,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, cn } from '@/lib/utils';
import {
  AdminAreaChart,
  AdminBarChart,
  CHART_COLORS,
} from '@/components/common/admin-chart';

// Proof Stats
const proofStats = {
  pendingReview: 89,
  reviewedToday: 234,
  approvedToday: 198,
  rejectedToday: 36,
  avgAIScore: 87.3,
  avgReviewTime: 2.4, // dakika
  aiAccuracy: 94.7,
  falsePositiveRate: 3.2,
  falseNegativeRate: 2.1,
  communityVerifications: 156,
};

// Proof Types
const proofTypes = [
  {
    type: 'photo',
    label: 'Fotograf',
    icon: Camera,
    count: 45,
    color: 'text-blue-500 dark:text-blue-400',
  },
  {
    type: 'receipt',
    label: 'Fis/Makbuz',
    icon: FileText,
    count: 12,
    color: 'text-emerald-500 dark:text-emerald-400',
  },
  {
    type: 'geo',
    label: 'Konum',
    icon: MapPin,
    count: 18,
    color: 'text-purple-500 dark:text-purple-400',
  },
  {
    type: 'ticket_qr',
    label: 'QR/Bilet',
    icon: FileText,
    count: 8,
    color: 'text-amber-500 dark:text-amber-400',
  },
  {
    type: 'video',
    label: 'Video',
    icon: Video,
    count: 6,
    color: 'text-pink-500 dark:text-pink-400',
  },
];

// AI Analysis Breakdown
const aiBreakdown = {
  faceMatching: 92,
  landmarkDetection: 88,
  exifVerification: 95,
  qualityScore: 84,
  authenticityScore: 91,
  deepfakeDetection: 98,
};

// Pending Proofs Queue
const pendingProofs = [
  {
    id: 'PRF-2024-001',
    transactionId: 'TXN-456',
    type: 'photo',
    submitter: 'Ahmet K.',
    moment: 'Kapadokya Balloon Tour',
    submittedAt: '2024-01-10 09:15',
    aiScore: 94,
    aiVerdict: 'approved',
    aiBreakdown: { face: 96, landmark: 92, quality: 94, authenticity: 95 },
    images: ['/proof1.jpg', '/proof2.jpg'],
    location: { name: 'Goreme, Kapadokya', verified: true },
    flags: [],
  },
  {
    id: 'PRF-2024-002',
    transactionId: 'TXN-457',
    type: 'photo',
    submitter: 'Ayse M.',
    moment: 'Bosphorus Dinner Cruise',
    submittedAt: '2024-01-10 08:45',
    aiScore: 72,
    aiVerdict: 'needs_review',
    aiBreakdown: { face: 85, landmark: 65, quality: 78, authenticity: 60 },
    images: ['/proof3.jpg'],
    location: { name: 'Bosphorus, Istanbul', verified: false },
    flags: ['low_landmark_confidence', 'metadata_mismatch'],
  },
  {
    id: 'PRF-2024-003',
    transactionId: 'TXN-458',
    type: 'geo',
    submitter: 'Can B.',
    moment: 'Private Istanbul Tour',
    submittedAt: '2024-01-10 08:30',
    aiScore: 88,
    aiVerdict: 'approved',
    aiBreakdown: { face: 90, landmark: 85, quality: 92, authenticity: 86 },
    images: ['/proof4.jpg', '/proof5.jpg', '/proof6.jpg'],
    location: { name: 'Sultanahmet, Istanbul', verified: true },
    flags: [],
  },
  {
    id: 'PRF-2024-004',
    transactionId: 'TXN-459',
    type: 'receipt',
    submitter: 'Deniz K.',
    moment: 'Luxury Restaurant Experience',
    submittedAt: '2024-01-10 08:00',
    aiScore: 45,
    aiVerdict: 'rejected',
    aiBreakdown: { face: 0, landmark: 0, quality: 65, authenticity: 25 },
    images: ['/proof7.jpg'],
    location: { name: 'Nisantasi, Istanbul', verified: true },
    flags: ['possible_fake', 'low_quality', 'no_face_detected'],
  },
  {
    id: 'PRF-2024-005',
    transactionId: 'TXN-460',
    type: 'video',
    submitter: 'Elif T.',
    moment: 'Paragliding Adventure',
    submittedAt: '2024-01-10 07:45',
    aiScore: 96,
    aiVerdict: 'approved',
    aiBreakdown: { face: 98, landmark: 94, quality: 96, authenticity: 97 },
    images: ['/proof8.jpg'],
    location: { name: 'Fethiye, Mugla', verified: true },
    flags: [],
  },
];

// Daily Performance Data
const dailyPerformanceData = [
  { date: 'Pzt', submitted: 156, approved: 132, rejected: 24, aiScore: 86 },
  { date: 'Sal', submitted: 178, approved: 152, rejected: 26, aiScore: 87 },
  { date: 'Car', submitted: 145, approved: 121, rejected: 24, aiScore: 85 },
  { date: 'Per', submitted: 192, approved: 168, rejected: 24, aiScore: 88 },
  { date: 'Cum', submitted: 223, approved: 189, rejected: 34, aiScore: 86 },
  { date: 'Cmt', submitted: 267, approved: 231, rejected: 36, aiScore: 89 },
  { date: 'Paz', submitted: 234, approved: 198, rejected: 36, aiScore: 87 },
];

// Turkish Landmarks for Detection
const turkishLandmarks = [
  { name: 'Kapadokya Balonlari', detections: 234, accuracy: 96 },
  { name: 'Ayasofya', detections: 189, accuracy: 94 },
  { name: 'Sultan Ahmet Camii', detections: 167, accuracy: 95 },
  { name: 'Bogazici Koprusu', detections: 145, accuracy: 92 },
  { name: 'Pamukkale', detections: 98, accuracy: 93 },
  { name: 'Efes Antik Kenti', detections: 87, accuracy: 91 },
];

export default function ProofCenterPage() {
  const [selectedTab, setSelectedTab] = useState('queue');
  const [selectedProof, setSelectedProof] = useState<
    (typeof pendingProofs)[0] | null
  >(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const getVerdictBadge = (verdict: string, score: number) => {
    if (verdict === 'approved' || score >= 85) {
      return (
        <CanvaBadge className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          AI Onayladi
        </CanvaBadge>
      );
    } else if (verdict === 'needs_review' || (score >= 60 && score < 85)) {
      return (
        <CanvaBadge className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
          <Eye className="h-3 w-3 mr-1" />
          Inceleme Gerekli
        </CanvaBadge>
      );
    } else {
      return (
        <CanvaBadge className="bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
          <XCircle className="h-3 w-3 mr-1" />
          AI Reddetti
        </CanvaBadge>
      );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleApprove = (proof: (typeof pendingProofs)[0]) => {
    setSelectedProof(proof);
    setReviewDialog(true);
  };

  const handleReject = (proof: (typeof pendingProofs)[0]) => {
    setSelectedProof(proof);
    setReviewDialog(true);
  };

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Camera className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            Proof Verification Center
          </h1>
          <p className="text-muted-foreground">
            AI destekli kanit dogrulama ve kalite kontrol merkezi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CanvaButton variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor
          </CanvaButton>
          <CanvaButton size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </CanvaButton>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <CanvaStatCard
          title="Bekleyen"
          value={proofStats.pendingReview}
          icon={<Clock className="h-4 w-4" />}
          subtitle="Inceleme bekliyor"
          variant="warning"
        />
        <CanvaStatCard
          title="Onaylanan"
          value={proofStats.approvedToday}
          icon={<CheckCircle2 className="h-4 w-4" />}
          subtitle="Bugun onaylandi"
          variant="success"
        />
        <CanvaStatCard
          title="Reddedilen"
          value={proofStats.rejectedToday}
          icon={<XCircle className="h-4 w-4" />}
          subtitle="Bugun reddedildi"
          variant="error"
        />
        <CanvaStatCard
          title="AI Skoru"
          value={`%${proofStats.avgAIScore}`}
          icon={<Brain className="h-4 w-4" />}
          subtitle="Ortalama skor"
          variant="info"
        />
        <CanvaStatCard
          title="AI Dogruluk"
          value={`%${proofStats.aiAccuracy}`}
          icon={<Target className="h-4 w-4" />}
          subtitle="Dogrulama orani"
        />
        <CanvaStatCard
          title="Ort. Sure"
          value={`${proofStats.avgReviewTime} dk`}
          icon={<Zap className="h-4 w-4" />}
          subtitle="Inceleme suresi"
          variant="info"
        />
      </div>

      {/* Proof Types Distribution */}
      <CanvaCard>
        <CanvaCardHeader className="pb-3">
          <CanvaCardTitle className="text-base">
            Bekleyen Proof Turleri
          </CanvaCardTitle>
        </CanvaCardHeader>
        <CanvaCardBody>
          <div className="flex gap-4 flex-wrap">
            {proofTypes.map((type) => (
              <div
                key={type.type}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 min-w-[150px]"
              >
                <div className={cn('p-2 rounded-lg bg-background', type.color)}>
                  <type.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{type.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {type.count} bekliyor
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CanvaCardBody>
      </CanvaCard>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="queue">Inceleme Kuyrugu</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analiz</TabsTrigger>
          <TabsTrigger value="landmarks">Landmark Tespiti</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
        </TabsList>

        {/* Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Proof ID, kullanici ara..."
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Proof turu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Turler</SelectItem>
                <SelectItem value="photo">Fotograf</SelectItem>
                <SelectItem value="receipt">Fis/Makbuz</SelectItem>
                <SelectItem value="geo">Konum</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="needs_review">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="AI Sonucu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tumunu Goster</SelectItem>
                <SelectItem value="needs_review">Inceleme Gerekli</SelectItem>
                <SelectItem value="approved">AI Onayladi</SelectItem>
                <SelectItem value="rejected">AI Reddetti</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Proof Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingProofs.map((proof) => (
              <CanvaCard
                key={proof.id}
                className={cn(
                  'cursor-pointer hover:shadow-md transition-all',
                  proof.aiVerdict === 'rejected' && 'border-red-500/30',
                  proof.aiVerdict === 'needs_review' && 'border-amber-500/30',
                )}
              >
                <CanvaCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CanvaBadge
                        variant="outline"
                        className="text-xs font-mono"
                      >
                        {proof.id}
                      </CanvaBadge>
                      {proof.flags.length > 0 && (
                        <CanvaBadge variant="destructive" className="text-xs">
                          <Flag className="h-3 w-3 mr-1" />
                          {proof.flags.length}
                        </CanvaBadge>
                      )}
                    </div>
                    {getVerdictBadge(proof.aiVerdict, proof.aiScore)}
                  </div>
                </CanvaCardHeader>
                <CanvaCardBody className="space-y-4">
                  {/* Proof Preview */}
                  <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <CanvaButton
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-2 right-2"
                    >
                      <ZoomIn className="h-3 w-3 mr-1" />
                      {proof.images.length} gorsel
                    </CanvaButton>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Moment:</span>
                      <span className="font-medium truncate max-w-[150px]">
                        {proof.moment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gonderen:</span>
                      <span className="font-medium">{proof.submitter}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Konum:</span>
                      <span
                        className={cn(
                          'font-medium flex items-center gap-1',
                          proof.location.verified
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400',
                        )}
                      >
                        {proof.location.verified ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {proof.location.name.split(',')[0]}
                      </span>
                    </div>
                  </div>

                  {/* AI Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Skoru</span>
                      <span
                        className={cn(
                          'text-lg font-bold',
                          getScoreColor(proof.aiScore),
                        )}
                      >
                        %{proof.aiScore}
                      </span>
                    </div>
                    <Progress value={proof.aiScore} className="h-2" />

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Yuz</p>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            getScoreColor(proof.aiBreakdown.face),
                          )}
                        >
                          {proof.aiBreakdown.face}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Mekan</p>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            getScoreColor(proof.aiBreakdown.landmark),
                          )}
                        >
                          {proof.aiBreakdown.landmark}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Kalite</p>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            getScoreColor(proof.aiBreakdown.quality),
                          )}
                        >
                          {proof.aiBreakdown.quality}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Orijinal
                        </p>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            getScoreColor(proof.aiBreakdown.authenticity),
                          )}
                        >
                          {proof.aiBreakdown.authenticity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Flags */}
                  {proof.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proof.flags.map((flag) => (
                        <CanvaBadge
                          key={flag}
                          variant="outline"
                          className="text-xs bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"
                        >
                          {flag.replace(/_/g, ' ')}
                        </CanvaBadge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <CanvaButton
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApprove(proof)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Onayla
                    </CanvaButton>
                    <CanvaButton
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(proof)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Reddet
                    </CanvaButton>
                    <CanvaButton size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </CanvaButton>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Components Performance */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                  AI Bilesenleri Performansi
                </CanvaCardTitle>
                <CanvaCardSubtitle>
                  Proof dogrulama AI modellerinin basari oranlari
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody className="space-y-4">
                {Object.entries(aiBreakdown).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={cn('font-bold', getScoreColor(value))}>
                        %{value}
                      </span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </CanvaCardBody>
            </CanvaCard>

            {/* Error Rates */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                  Hata Oranlari
                </CanvaCardTitle>
                <CanvaCardSubtitle>
                  False positive ve false negative oranlari
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        False Positive (Yanlis Onay)
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        %{proofStats.falsePositiveRate}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI'in yanlis olarak onayladigi proof orani
                    </p>
                    <Progress
                      value={proofStats.falsePositiveRate}
                      className="h-1 mt-2"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        False Negative (Yanlis Red)
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-bold">
                        %{proofStats.falseNegativeRate}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI'in yanlis olarak reddettigi gecerli proof orani
                    </p>
                    <Progress
                      value={proofStats.falseNegativeRate}
                      className="h-1 mt-2"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Genel Dogruluk</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        %{proofStats.aiAccuracy}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI modelinin genel basari orani
                    </p>
                    <Progress
                      value={proofStats.aiAccuracy}
                      className="h-1 mt-2"
                    />
                  </div>
                </div>
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>

        {/* Landmarks Tab */}
        <TabsContent value="landmarks" className="space-y-6">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                Turkiye Landmark Tespiti
              </CanvaCardTitle>
              <CanvaCardSubtitle>
                AI'in tespit ettigi Turkiye'deki onemli mekanlar
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {turkishLandmarks.map((landmark) => (
                  <div
                    key={landmark.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">{landmark.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {landmark.detections} tespit
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-lg font-bold',
                          getScoreColor(landmark.accuracy),
                        )}
                      >
                        %{landmark.accuracy}
                      </p>
                      <p className="text-xs text-muted-foreground">Dogruluk</p>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Haftalik Proof Performansi</CanvaCardTitle>
              <CanvaCardSubtitle>
                Son 7 gunluk proof islem istatistikleri
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <AdminAreaChart
                data={dailyPerformanceData}
                xAxisKey="date"
                height={300}
                areas={[
                  {
                    dataKey: 'approved',
                    name: 'Onaylanan',
                    color: CHART_COLORS.trust,
                  },
                  {
                    dataKey: 'rejected',
                    name: 'Reddedilen',
                    color: CHART_COLORS.secondary,
                  },
                ]}
                formatter={(value, name) => [`${value} proof`, name]}
              />
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Proof Inceleme</DialogTitle>
            <DialogDescription>
              {selectedProof?.id} - {selectedProof?.moment}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">AI Skoru</span>
                <span
                  className={cn(
                    'font-bold',
                    getScoreColor(selectedProof?.aiScore || 0),
                  )}
                >
                  %{selectedProof?.aiScore}
                </span>
              </div>
              {selectedProof?.flags.length ? (
                <div className="flex flex-wrap gap-1">
                  {selectedProof.flags.map((flag) => (
                    <CanvaBadge
                      key={flag}
                      variant="outline"
                      className="text-xs bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                    >
                      {flag.replace(/_/g, ' ')}
                    </CanvaBadge>
                  ))}
                </div>
              ) : null}
            </div>
            <div>
              <label className="text-sm font-medium">Inceleme Notu</label>
              <Textarea
                placeholder="Onay veya red sebebini yazin..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <CanvaButton
              variant="outline"
              onClick={() => setReviewDialog(false)}
            >
              Iptal
            </CanvaButton>
            <CanvaButton
              variant="destructive"
              onClick={() => setReviewDialog(false)}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Reddet
            </CanvaButton>
            <CanvaButton
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setReviewDialog(false)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Onayla
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
