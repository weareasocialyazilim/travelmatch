'use client';

import { useState, useMemo } from 'react';
import {
  Flag,
  Plus,
  Search,
  Settings,
  Users,
  Percent,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  History,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  Shield,
  TrendingUp,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { CanvaInput } from '@/components/canva/CanvaInput';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import {
  useFeatureFlags,
  useCreateFeatureFlag,
  useUpdateFeatureFlag,
  useDeleteFeatureFlag,
  useToggleFeatureFlag,
} from '@/hooks/use-feature-flags';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  environment: 'production' | 'staging' | 'development';
  platforms: ('ios' | 'android' | 'web')[];
  targeting?: {
    type: 'all' | 'segment' | 'user_ids';
    value?: string[];
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  category: 'feature' | 'experiment' | 'operational' | 'kill_switch';
  tags: string[];
}

// Mock data
const mockFlags: FeatureFlag[] = [
  {
    id: 'ff_1',
    key: 'dark_mode',
    name: 'Dark Mode',
    description: 'Karanlık tema özelliğini etkinleştirir',
    enabled: true,
    rollout_percentage: 100,
    environment: 'production',
    platforms: ['ios', 'android', 'web'],
    targeting: { type: 'all' },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-18T08:00:00Z',
    created_by: 'Zeynep Arslan',
    category: 'feature',
    tags: ['ui', 'theme'],
  },
  {
    id: 'ff_2',
    key: 'new_matching_algorithm',
    name: 'Yeni Eşleşme Algoritması',
    description: 'ML tabanlı gelişmiş eşleşme algoritması',
    enabled: true,
    rollout_percentage: 25,
    environment: 'production',
    platforms: ['ios', 'android'],
    targeting: { type: 'segment', value: ['premium_users'] },
    created_at: '2024-11-01T10:00:00Z',
    updated_at: '2024-12-17T14:00:00Z',
    created_by: 'Ahmet Yılmaz',
    category: 'experiment',
    tags: ['ml', 'matching', 'core'],
  },
  {
    id: 'ff_3',
    key: 'video_calls',
    name: 'Video Görüşme',
    description: 'Uygulama içi video görüşme özelliği',
    enabled: false,
    rollout_percentage: 0,
    environment: 'staging',
    platforms: ['ios', 'android'],
    targeting: { type: 'all' },
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
    created_by: 'Fatma Demir',
    category: 'feature',
    tags: ['communication', 'video'],
  },
  {
    id: 'ff_4',
    key: 'maintenance_mode',
    name: 'Bakım Modu',
    description: 'Acil durumlarda tüm sistemi bakım moduna alır',
    enabled: false,
    rollout_percentage: 0,
    environment: 'production',
    platforms: ['ios', 'android', 'web'],
    targeting: { type: 'all' },
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-15T10:00:00Z',
    created_by: 'Zeynep Arslan',
    category: 'kill_switch',
    tags: ['emergency', 'system'],
  },
  {
    id: 'ff_5',
    key: 'disable_payments',
    name: 'Ödeme Sistemi Durdur',
    description: 'Acil durumlarda ödeme sistemini devre dışı bırakır',
    enabled: false,
    rollout_percentage: 0,
    environment: 'production',
    platforms: ['ios', 'android', 'web'],
    targeting: { type: 'all' },
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
    created_by: 'Zeynep Arslan',
    category: 'kill_switch',
    tags: ['emergency', 'payments'],
  },
  {
    id: 'ff_6',
    key: 'super_likes',
    name: 'Super Like',
    description: 'Günlük super like özelliği',
    enabled: true,
    rollout_percentage: 100,
    environment: 'production',
    platforms: ['ios', 'android', 'web'],
    targeting: { type: 'all' },
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
    created_by: 'Mehmet Kaya',
    category: 'feature',
    tags: ['engagement', 'premium'],
  },
  {
    id: 'ff_7',
    key: 'ai_bio_suggestions',
    name: 'AI Biyografi Önerileri',
    description: 'Yapay zeka destekli profil biyografisi önerileri',
    enabled: true,
    rollout_percentage: 50,
    environment: 'production',
    platforms: ['ios', 'android'],
    targeting: { type: 'all' },
    created_at: '2024-10-01T10:00:00Z',
    updated_at: '2024-12-10T10:00:00Z',
    created_by: 'Can Öztürk',
    category: 'experiment',
    tags: ['ai', 'profile'],
  },
  {
    id: 'ff_8',
    key: 'rate_limiting_strict',
    name: 'Sıkı Rate Limiting',
    description: 'API isteklerinde sıkı rate limiting uygular',
    enabled: true,
    rollout_percentage: 100,
    environment: 'production',
    platforms: ['ios', 'android', 'web'],
    targeting: { type: 'all' },
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
    created_by: 'Zeynep Arslan',
    category: 'operational',
    tags: ['security', 'performance'],
  },
];

const categoryLabels: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  feature: { label: 'Özellik', color: 'bg-blue-100 text-blue-800', icon: Zap },
  experiment: {
    label: 'Deney',
    color: 'bg-purple-100 text-purple-800',
    icon: TrendingUp,
  },
  operational: {
    label: 'Operasyonel',
    color: 'bg-muted text-foreground',
    icon: Settings,
  },
  kill_switch: {
    label: 'Kill Switch',
    color: 'bg-red-100 text-red-800',
    icon: Shield,
  },
};

const platformIcons: Record<string, React.ElementType> = {
  ios: Smartphone,
  android: Smartphone,
  web: Monitor,
};

export default function FeatureFlagsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  // Use real API data
  const { data, isLoading, error, refetch } = useFeatureFlags();
  const createFlag = useCreateFeatureFlag();
  const updateFlag = useUpdateFeatureFlag();
  const deleteFlag = useDeleteFeatureFlag();
  const toggleFlag = useToggleFeatureFlag();

  // Use API data if available, otherwise fall back to mock data
  const flags = useMemo(() => {
    if (data?.flags && data.flags.length > 0) {
      return data.flags.map((flag) => ({
        id: flag.id,
        key: flag.name.toLowerCase().replace(/\s+/g, '_'),
        name: flag.name,
        description: flag.description || '',
        enabled: flag.enabled,
        rollout_percentage: flag.rollout_percentage,
        environment: (flag.environments?.[0] || 'production') as
          | 'production'
          | 'staging'
          | 'development',
        platforms: ['ios', 'android', 'web'] as ('ios' | 'android' | 'web')[],
        targeting: { type: 'all' as const },
        created_at: flag.created_at,
        updated_at: flag.updated_at,
        created_by: 'Admin',
        category: flag.category as FeatureFlag['category'],
        tags: [],
      }));
    }
    return mockFlags;
  }, [data?.flags]);

  const apiStats = data?.stats;

  // New flag form state
  const [newFlag, setNewFlag] = useState({
    key: '',
    name: '',
    description: '',
    category: 'feature' as FeatureFlag['category'],
    environment: 'staging' as FeatureFlag['environment'],
    platforms: ['ios', 'android', 'web'] as FeatureFlag['platforms'],
    rollout_percentage: 0,
  });

  // Filter flags
  const filteredFlags = flags.filter((flag) => {
    const matchesSearch =
      searchQuery === '' ||
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || flag.category === categoryFilter;
    const matchesEnvironment =
      environmentFilter === 'all' || flag.environment === environmentFilter;

    return matchesSearch && matchesCategory && matchesEnvironment;
  });

  // Stats
  const stats = apiStats || {
    total: flags.length,
    enabled: flags.filter((f) => f.enabled).length,
    disabled: flags.filter((f) => !f.enabled).length,
    beta: 0,
  };

  const experiments = flags.filter((f) => f.category === 'experiment').length;
  const killSwitches = flags.filter((f) => f.category === 'kill_switch').length;

  // Toggle flag
  const handleToggle = (flagId: string, enabled: boolean) => {
    toggleFlag.mutate(flagId, enabled);
    const flag = flags.find((f) => f.id === flagId);
    toast.success(
      `${flag?.name} ${enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`,
    );
  };

  // Update rollout percentage
  const handleRolloutChange = (flagId: string, percentage: number) => {
    updateFlag.mutate(
      { id: flagId, rollout_percentage: percentage },
      {
        onError: () => {
          toast.error('Rollout güncellenemedi');
        },
      },
    );
  };

  // Create new flag
  const handleCreateFlag = () => {
    createFlag.mutate(
      {
        name: newFlag.name,
        description: newFlag.description,
        enabled: false,
        category: newFlag.category,
        rollout_percentage: newFlag.rollout_percentage,
        environments: [newFlag.environment],
      },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
          setNewFlag({
            key: '',
            name: '',
            description: '',
            category: 'feature',
            environment: 'staging',
            platforms: ['ios', 'android', 'web'],
            rollout_percentage: 0,
          });
          toast.success('Feature flag oluşturuldu');
        },
        onError: () => {
          toast.error('Flag oluşturulamadı');
        },
      },
    );
  };

  // Delete flag
  const handleDeleteFlag = (flagId: string) => {
    deleteFlag.mutate(flagId, {
      onSuccess: () => {
        toast.success('Feature flag silindi');
      },
      onError: () => {
        toast.error('Flag silinemedi');
      },
    });
  };

  // Copy flag key
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Key kopyalandı');
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted rounded" />
          <div className="h-10 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-16 bg-muted rounded-lg" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );

  // Error State
  const ErrorState = () => (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Bir hata oluştu</h2>
        <p className="text-muted-foreground max-w-md">
          Feature flag verileri yüklenemedi. Lütfen tekrar deneyin.
        </p>
        <CanvaButton
          variant="primary"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Tekrar Dene
        </CanvaButton>
      </div>
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Flag className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          Henüz feature flag yok
        </h3>
        <p className="text-sm text-muted-foreground">
          İlk feature flag'inizi oluşturarak başlayın.
        </p>
        <CanvaButton
          variant="primary"
          onClick={() => setIsCreateDialogOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Yeni Flag Oluştur
        </CanvaButton>
      </div>
    </div>
  );

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            Özellikleri kontrollü şekilde yayınlayın ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <CanvaButton
            variant="primary"
            onClick={() => refetch()}
            loading={isLoading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Yenile
          </CanvaButton>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <CanvaButton
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Yeni Flag
              </CanvaButton>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Yeni Feature Flag</DialogTitle>
                <DialogDescription>
                  Yeni bir feature flag oluşturun
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <CanvaInput
                  label="Key"
                  placeholder="feature_key"
                  value={newFlag.key}
                  onChange={(e) =>
                    setNewFlag({
                      ...newFlag,
                      key: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                    })
                  }
                  helperText="Kodda kullanılacak benzersiz tanımlayıcı"
                />
                <CanvaInput
                  label="İsim"
                  placeholder="Özellik Adı"
                  value={newFlag.name}
                  onChange={(e) =>
                    setNewFlag({ ...newFlag, name: e.target.value })
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    placeholder="Bu özellik ne yapar?"
                    value={newFlag.description}
                    onChange={(e) =>
                      setNewFlag({ ...newFlag, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select
                      value={newFlag.category}
                      onValueChange={(v) =>
                        setNewFlag({
                          ...newFlag,
                          category: v as FeatureFlag['category'],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">Özellik</SelectItem>
                        <SelectItem value="experiment">Deney</SelectItem>
                        <SelectItem value="operational">Operasyonel</SelectItem>
                        <SelectItem value="kill_switch">Kill Switch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Select
                      value={newFlag.environment}
                      onValueChange={(v) =>
                        setNewFlag({
                          ...newFlag,
                          environment: v as FeatureFlag['environment'],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    Başlangıç Rollout: {newFlag.rollout_percentage}%
                  </Label>
                  <Slider
                    value={[newFlag.rollout_percentage]}
                    onValueChange={([v]) =>
                      setNewFlag({ ...newFlag, rollout_percentage: v })
                    }
                    max={100}
                    step={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <CanvaButton
                  variant="primary"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  İptal
                </CanvaButton>
                <CanvaButton
                  variant="primary"
                  onClick={handleCreateFlag}
                  disabled={!newFlag.key || !newFlag.name}
                >
                  Oluştur
                </CanvaButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          label="Toplam Flag"
          value={stats.total}
          icon={<Flag className="h-4 w-4" />}
        />
        <CanvaStatCard
          label="Aktif"
          value={stats.enabled}
          icon={<CheckCircle className="h-4 w-4" />}
          change={{
            value:
              stats.total > 0
                ? Math.round((stats.enabled / stats.total) * 100)
                : 0,
            label: 'etkin',
          }}
        />
        <CanvaStatCard
          label="Deneyler"
          value={experiments}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <CanvaStatCard
          label="Kill Switches"
          value={killSwitches}
          icon={<Shield className="h-4 w-4" />}
        />
      </div>

      {/* Filters */}
      <CanvaCard padding="md">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <CanvaInput
              placeholder="Flag ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              <SelectItem value="feature">Özellik</SelectItem>
              <SelectItem value="experiment">Deney</SelectItem>
              <SelectItem value="operational">Operasyonel</SelectItem>
              <SelectItem value="kill_switch">Kill Switch</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={environmentFilter}
            onValueChange={setEnvironmentFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Env</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CanvaCard>

      {/* Flags List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tümü ({filteredFlags.length})</TabsTrigger>
          <TabsTrigger value="enabled">
            Aktif ({filteredFlags.filter((f) => f.enabled).length})
          </TabsTrigger>
          <TabsTrigger value="disabled">
            Pasif ({filteredFlags.filter((f) => !f.enabled).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredFlags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onToggle={handleToggle}
              onRolloutChange={handleRolloutChange}
              onDelete={handleDeleteFlag}
              onCopyKey={handleCopyKey}
            />
          ))}
        </TabsContent>

        <TabsContent value="enabled" className="space-y-4">
          {filteredFlags
            .filter((f) => f.enabled)
            .map((flag) => (
              <FlagCard
                key={flag.id}
                flag={flag}
                onToggle={handleToggle}
                onRolloutChange={handleRolloutChange}
                onDelete={handleDeleteFlag}
                onCopyKey={handleCopyKey}
              />
            ))}
        </TabsContent>

        <TabsContent value="disabled" className="space-y-4">
          {filteredFlags
            .filter((f) => !f.enabled)
            .map((flag) => (
              <FlagCard
                key={flag.id}
                flag={flag}
                onToggle={handleToggle}
                onRolloutChange={handleRolloutChange}
                onDelete={handleDeleteFlag}
                onCopyKey={handleCopyKey}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Flag Card Component
function FlagCard({
  flag,
  onToggle,
  onRolloutChange,
  onDelete,
  onCopyKey,
}: {
  flag: FeatureFlag;
  onToggle: (id: string, enabled: boolean) => void;
  onRolloutChange: (id: string, percentage: number) => void;
  onDelete: (id: string) => void;
  onCopyKey: (key: string) => void;
}) {
  const categoryInfo = categoryLabels[flag.category];
  const CategoryIcon = categoryInfo.icon;

  return (
    <CanvaCard
      className={flag.category === 'kill_switch' ? 'border-red-200' : ''}
      padding="md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{flag.name}</h3>
            <CanvaBadge
              className={categoryInfo.color}
              icon={<CategoryIcon className="h-3 w-3" />}
            >
              {categoryInfo.label}
            </CanvaBadge>
            <CanvaBadge
              variant={
                flag.environment === 'production'
                  ? 'success'
                  : flag.environment === 'staging'
                    ? 'warning'
                    : 'primary'
              }
            >
              {flag.environment}
            </CanvaBadge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{flag.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => onCopyKey(flag.key)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                {flag.key}
              </code>
              <Copy className="h-3 w-3" />
            </button>
            <div className="flex items-center gap-1 text-muted-foreground">
              {flag.platforms.map((platform) => {
                const Icon = platformIcons[platform];
                return <Icon key={platform} className="h-4 w-4" />;
              })}
            </div>
            <span className="text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" />
              {formatDate(flag.updated_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Rollout Percentage */}
          {flag.enabled && (
            <div className="w-32">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Rollout</span>
                <span className="text-xs font-medium">
                  {flag.rollout_percentage}%
                </span>
              </div>
              <Slider
                value={[flag.rollout_percentage]}
                onValueChange={([v]) => onRolloutChange(flag.id, v)}
                max={100}
                step={5}
                className="cursor-pointer"
              />
            </div>
          )}

          {/* Toggle */}
          <Switch
            checked={flag.enabled}
            onCheckedChange={(checked) => onToggle(flag.id, checked)}
            className={
              flag.category === 'kill_switch'
                ? 'data-[state=checked]:bg-red-600'
                : ''
            }
          />

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CanvaButton variant="ghost" size="sm" iconOnly>
                <MoreHorizontal className="h-4 w-4" />
              </CanvaButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCopyKey(flag.key)}>
                <Copy className="mr-2 h-4 w-4" />
                Key Kopyala
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="mr-2 h-4 w-4" />
                Geçmiş
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Feature Flag Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong>{flag.name}</strong> flag&apos;ini silmek
                      istediğinizden emin misiniz? Bu işlem geri alınamaz ve
                      kodda hatalara yol açabilir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(flag.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress bar for rollout */}
      {flag.enabled && flag.rollout_percentage < 100 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Kullanıcı Dağılımı</span>
            <span className="text-foreground">
              ~
              {Math.round(
                (flag.rollout_percentage / 100) * 125000,
              ).toLocaleString('tr-TR')}{' '}
              kullanıcı
            </span>
          </div>
          <Progress value={flag.rollout_percentage} className="h-2" />
        </div>
      )}
    </CanvaCard>
  );
}
