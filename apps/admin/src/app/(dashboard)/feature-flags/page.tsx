'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const categoryLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  feature: { label: 'Özellik', color: 'bg-blue-100 text-blue-800', icon: Zap },
  experiment: { label: 'Deney', color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
  operational: { label: 'Operasyonel', color: 'bg-gray-100 text-gray-800', icon: Settings },
  kill_switch: { label: 'Kill Switch', color: 'bg-red-100 text-red-800', icon: Shield },
};

const platformIcons: Record<string, React.ElementType> = {
  ios: Smartphone,
  android: Smartphone,
  web: Monitor,
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

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

    const matchesCategory = categoryFilter === 'all' || flag.category === categoryFilter;
    const matchesEnvironment = environmentFilter === 'all' || flag.environment === environmentFilter;

    return matchesSearch && matchesCategory && matchesEnvironment;
  });

  // Stats
  const stats = {
    total: flags.length,
    enabled: flags.filter((f) => f.enabled).length,
    experiments: flags.filter((f) => f.category === 'experiment').length,
    killSwitches: flags.filter((f) => f.category === 'kill_switch').length,
  };

  // Toggle flag
  const handleToggle = (flagId: string, enabled: boolean) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? { ...f, enabled, updated_at: new Date().toISOString() }
          : f
      )
    );
    const flag = flags.find((f) => f.id === flagId);
    toast.success(
      `${flag?.name} ${enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`
    );
  };

  // Update rollout percentage
  const handleRolloutChange = (flagId: string, percentage: number) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? { ...f, rollout_percentage: percentage, updated_at: new Date().toISOString() }
          : f
      )
    );
  };

  // Create new flag
  const handleCreateFlag = () => {
    const flag: FeatureFlag = {
      id: `ff_${Date.now()}`,
      ...newFlag,
      enabled: false,
      targeting: { type: 'all' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'Current Admin',
      tags: [],
    };
    setFlags((prev) => [flag, ...prev]);
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
  };

  // Delete flag
  const handleDeleteFlag = (flagId: string) => {
    setFlags((prev) => prev.filter((f) => f.id !== flagId));
    toast.success('Feature flag silindi');
  };

  // Copy flag key
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Key kopyalandı');
  };

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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni Feature Flag</DialogTitle>
              <DialogDescription>
                Yeni bir feature flag oluşturun
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  placeholder="feature_key"
                  value={newFlag.key}
                  onChange={(e) =>
                    setNewFlag({ ...newFlag, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Kodda kullanılacak benzersiz tanımlayıcı
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">İsim</Label>
                <Input
                  id="name"
                  placeholder="Özellik Adı"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Bu özellik ne yapar?"
                  value={newFlag.description}
                  onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={newFlag.category}
                    onValueChange={(v) => setNewFlag({ ...newFlag, category: v as FeatureFlag['category'] })}
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
                    onValueChange={(v) => setNewFlag({ ...newFlag, environment: v as FeatureFlag['environment'] })}
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
                <Label>Başlangıç Rollout: {newFlag.rollout_percentage}%</Label>
                <Slider
                  value={[newFlag.rollout_percentage]}
                  onValueChange={([v]) => setNewFlag({ ...newFlag, rollout_percentage: v })}
                  max={100}
                  step={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateFlag} disabled={!newFlag.key || !newFlag.name}>
                Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Flag</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enabled}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.enabled / stats.total) * 100)}% etkin
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deneyler</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.experiments}</div>
            <p className="text-xs text-muted-foreground">A/B test devam ediyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kill Switches</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.killSwitches}</div>
            <p className="text-xs text-muted-foreground">Acil durum kontrolleri</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Flag ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
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
            <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
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
        </CardContent>
      </Card>

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
    <Card className={flag.category === 'kill_switch' ? 'border-red-200' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{flag.name}</h3>
              <Badge className={categoryInfo.color} variant="secondary">
                <CategoryIcon className="mr-1 h-3 w-3" />
                {categoryInfo.label}
              </Badge>
              <Badge
                variant="outline"
                className={
                  flag.environment === 'production'
                    ? 'border-green-500 text-green-700'
                    : flag.environment === 'staging'
                    ? 'border-yellow-500 text-yellow-700'
                    : 'border-gray-500 text-gray-700'
                }
              >
                {flag.environment}
              </Badge>
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
                  <span className="text-xs font-medium">{flag.rollout_percentage}%</span>
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
              className={flag.category === 'kill_switch' ? 'data-[state=checked]:bg-red-600' : ''}
            />

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
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
                        <strong>{flag.name}</strong> flag&apos;ini silmek istediğinizden emin misiniz?
                        Bu işlem geri alınamaz ve kodda hatalara yol açabilir.
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
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Kullanıcı Dağılımı</span>
              <span>
                ~{Math.round((flag.rollout_percentage / 100) * 125000).toLocaleString('tr-TR')}{' '}
                kullanıcı
              </span>
            </div>
            <Progress value={flag.rollout_percentage} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
