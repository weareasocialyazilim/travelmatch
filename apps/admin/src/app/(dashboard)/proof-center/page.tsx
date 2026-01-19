'use client';

/**
 * Lovendo Proof Verification Center
 * AI destekli kanit dogrulama merkezi
 *
 * Proof queue, AI skorlari, manuel inceleme ve kalite metrikleri
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
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

// Database types extension for Joined Data
interface ProofWithDetails {
  id: string;
  name: string; // File name
  owner: string; // User ID
  bucket_id: string;
  created_at: string;
  updated_at: string;
  moderation_status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'unreviewed'
    | 'pending_review'
    | 'needs_review';
  moderation_score: number;
  moderation_labels: any[];
  moderation_details: any;
  metadata: any;
  publicUrl?: string; // Generated on client
  aiMode?: string;
  momentId?: string;

  // Mapped fields for UI compatibility
  transactionId?: string;
  type?: string;
  submitter?: string;
  moment?: string;
  submittedAt?: string;
  aiScore?: number;
  aiVerdict?: string;
  aiBreakdown?: any;
  images?: string[];
  location?: any;
  flags?: string[];
}

// Proof Stats (Mock for now, could be real later)
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
  const [selectedProof, setSelectedProof] = useState<ProofWithDetails | null>(
    null,
  );
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const supabase = createClient();

  // Fetch Real Data from Supabase
  const {
    data: proofs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['proofs'],
    queryFn: async () => {
      // Fetch uploads from 'proofs' bucket recorded in 'uploaded_images' table
      const { data, error } = await supabase
        .from('uploaded_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform and add Public URL & UI Compatible fields
      return data.map((item: any) => {
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.bucket_id}/${item.name}`;
        const score = item.moderation_score
          ? Math.round(item.moderation_score * 100)
          : 0;

        // Normalize status
        let verdict = item.moderation_status;
        if (verdict === 'pending') verdict = 'needs_review';
        if (verdict === 'unreviewed') verdict = 'needs_review';

        return {
          ...item,
          publicUrl,
          // Mapped Fields for UI
          id: item.id.substring(0, 8), // Short ID
          transactionId: item.id,
          type: item.metadata?.type || 'photo',
          submitter: item.owner || 'Unknown User',
          moment: item.metadata?.momentId || 'Upload',
          submittedAt: new Date(item.created_at).toLocaleString('tr-TR'),
          aiScore: score,
          aiVerdict: verdict,
          aiBreakdown: {
            face: item.moderation_details?.face || 0,
            landmark: item.moderation_details?.landmark || 0,
            quality: item.moderation_details?.quality || 0,
            authenticity: item.moderation_details?.authenticity || 0,
          },
          images: [publicUrl],
          location: { name: 'Unknown Location', verified: false },
          flags: item.moderation_labels || [],
        };
      }) as ProofWithDetails[];
    },
  });

  const pendingProofs = proofs; // Use fetched data

  // Stats calculation from real data
  const realStats = {
    total: proofs.length,
    pending: proofs.filter(
      (p) =>
        p.moderation_status === 'pending' ||
        p.moderation_status === 'pending_review' ||
        p.moderation_status === 'unreviewed',
    ).length,
    approved: proofs.filter((p) => p.moderation_status === 'approved').length,
    rejected: proofs.filter((p) => p.moderation_status === 'rejected').length,
  };

  const getVerdictBadge = (verdict: string, score: number = 0) => {
    if (verdict === 'approved' || score >= 85) {
      return (
        <CanvaBadge className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          AI Onayladi
        </CanvaBadge>
      );
    } else if (
      verdict === 'needs_review' ||
      verdict === 'pending' ||
      verdict === 'unreviewed' ||
      (score >= 60 && score < 85)
    ) {
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

  const handleApprove = async (proof: ProofWithDetails) => {
    setSelectedProof(proof);
    if (!proof.transactionId) return;

    // Update moderation status in DB
    // Note: uploaded_images table not in generated types, using type assertion
    const { error } = await (supabase as any)
      .from('uploaded_images')
      .update({ moderation_status: 'approved' })
      .eq('id', proof.transactionId);

    if (!error) {
      refetch(); // Refresh list
    }
    setReviewDialog(true);
  };

  const handleReject = async (proof: ProofWithDetails) => {
    setSelectedProof(proof);
    if (!proof.transactionId) return;

    // Update moderation status in DB
    // Note: uploaded_images table not in generated types, using type assertion
    const { error } = await (supabase as any)
      .from('uploaded_images')
      .update({ moderation_status: 'rejected' })
      .eq('id', proof.transactionId);

    if (!error) {
      refetch(); // Refresh list
    }
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
            AI destekli kanit dogrulama ve kalite kontrol merkezi (
            {proofs.length} kayit)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CanvaButton variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor
          </CanvaButton>
          <CanvaButton size="sm" onClick={() => refetch()}>
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')}
            />
            Yenile
          </CanvaButton>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <CanvaStatCard
          title="Bekleyen"
          value={realStats.pending}
          icon={<Clock className="h-4 w-4" />}
          subtitle="Inceleme bekliyor"
          accentColor="#f59e0b"
        />
        <CanvaStatCard
          title="Onaylanan"
          value={realStats.approved}
          icon={<CheckCircle2 className="h-4 w-4" />}
          subtitle="Toplam onay"
          accentColor="#10b981"
        />
        <CanvaStatCard
          title="Reddedilen"
          value={realStats.rejected}
          icon={<XCircle className="h-4 w-4" />}
          subtitle="Toplam red"
          accentColor="#ef4444"
        />
        <CanvaStatCard
          title="AI Skoru"
          value={`%${proofStats.avgAIScore}`}
          icon={<Brain className="h-4 w-4" />}
          subtitle="Ortalama skor"
          accentColor="#3b82f6"
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
          accentColor="#3b82f6"
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
            {isLoading && (
              <div className="col-span-3 text-center py-10">
                <p className="text-muted-foreground animate-pulse">
                  Yukleniyor...
                </p>
              </div>
            )}

            {!isLoading && pendingProofs.length === 0 && (
              <div className="col-span-3 text-center py-10 text-muted-foreground">
                Hicbir kayit bulunamadi.
              </div>
            )}

            {pendingProofs.map((proof) => (
              <CanvaCard
                key={proof.id}
                className={cn(
                  'cursor-pointer hover:shadow-md transition-all',
                  proof.aiVerdict === 'rejected' && 'border-red-500/30',
                  (proof.aiVerdict === 'needs_review' ||
                    proof.aiVerdict === 'pending') &&
                    'border-amber-500/30',
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
                      {proof.flags && proof.flags.length > 0 && (
                        <CanvaBadge variant="error" className="text-xs">
                          <Flag className="h-3 w-3 mr-1" />
                          {proof.flags.length}
                        </CanvaBadge>
                      )}
                    </div>
                    {getVerdictBadge(
                      proof.aiVerdict || 'needs_review',
                      proof.aiScore,
                    )}
                  </div>
                </CanvaCardHeader>
                <CanvaCardBody className="space-y-4">
                  {/* Proof Preview */}
                  <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {proof.images && proof.images[0] ? (
                      <img
                        src={proof.images[0]}
                        alt="Proof"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback for failed images
                          (e.target as HTMLImageElement).style.display = 'none';
                          (
                            e.target as HTMLImageElement
                          ).parentElement?.classList.add(
                            'flex',
                            'items-center',
                            'justify-center',
                          );
                        }}
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    )}

                    {(!proof.images || !proof.images[0]) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    <CanvaButton
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-2 right-2"
                    >
                      <ZoomIn className="h-3 w-3 mr-1" />
                      {proof.images?.length || 0} gorsel
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
                      <span className="font-medium truncate max-w-[150px]">
                        {proof.submitter}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Konum:</span>
                      <span
                        className={cn(
                          'font-medium flex items-center gap-1',
                          proof.location?.verified
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400',
                        )}
                      >
                        {proof.location?.verified ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {proof.location?.name?.split(',')[0]}
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
                          getScoreColor(proof.aiScore || 0),
                        )}
                      >
                        %{proof.aiScore}
                      </span>
                    </div>
                    <Progress value={proof.aiScore} className="h-2" />

                    {/* Score Breakdown */}
                    {proof.aiBreakdown && (
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
                          <p className="text-xs text-muted-foreground">
                            Kalite
                          </p>
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
                    )}
                  </div>

                  {/* Flags */}
                  {proof.flags && proof.flags.length > 0 && (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(proof);
                      }}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Onayla
                    </CanvaButton>
                    <CanvaButton
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(proof);
                      }}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Reddet
                    </CanvaButton>
                    {proof.publicUrl && (
                      <a
                        href={proof.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CanvaButton size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </CanvaButton>
                      </a>
                    )}
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
              {selectedProof?.transactionId} - {selectedProof?.moment}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProof?.publicUrl && (
              <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                <img
                  src={selectedProof.publicUrl}
                  className="object-contain w-full h-full"
                  alt="Review"
                />
              </div>
            )}

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
              {selectedProof?.flags && selectedProof.flags.length > 0 ? (
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
              variant="danger"
              onClick={() => {
                if (selectedProof) handleReject(selectedProof);
              }}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Reddet
            </CanvaButton>
            <CanvaButton
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                if (selectedProof) handleApprove(selectedProof);
              }}
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
