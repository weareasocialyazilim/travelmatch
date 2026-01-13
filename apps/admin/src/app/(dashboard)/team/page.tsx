'use client';

// Force dynamic rendering - this page has interactive components
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/supabase';
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Coffee,
  Laptop,
  Moon,
  Sun,
  BarChart3,
  Target,
  MessageSquare,
  Star,
  Loader2,
} from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Types
interface TeamStats {
  total_members: number;
  online_now: number;
  tasks_completed_today: number;
  avg_response_time: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  shift: string;
  tasks_today: number;
  rating: number;
  current_task: string | null;
}

interface Shift {
  name: string;
  time: string;
  icon: typeof Sun | typeof Coffee | typeof Moon;
  members: number;
  color: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  tasks: number;
  rating: number;
}

// Mock data fallbacks
const mockTeamStats: TeamStats = {
  total_members: 12,
  online_now: 5,
  tasks_completed_today: 47,
  avg_response_time: '4.2 min',
};

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet',
    status: 'online',
    shift: 'morning',
    tasks_today: 12,
    rating: 4.9,
    current_task: 'KYC onayları inceleniyor',
  },
  {
    id: '2',
    name: 'Fatma Demir',
    role: 'moderator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatma',
    status: 'online',
    shift: 'morning',
    tasks_today: 23,
    rating: 4.8,
    current_task: 'Moment moderasyonu',
  },
  {
    id: '3',
    name: 'Emre Kaya',
    role: 'support',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emre',
    status: 'online',
    shift: 'morning',
    tasks_today: 18,
    rating: 4.7,
    current_task: 'Destek talepleri',
  },
  {
    id: '4',
    name: 'Zeynep Arslan',
    role: 'finance',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
    status: 'away',
    shift: 'morning',
    tasks_today: 8,
    rating: 4.9,
    current_task: null,
  },
  {
    id: '5',
    name: 'Can Öztürk',
    role: 'moderator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can',
    status: 'online',
    shift: 'afternoon',
    tasks_today: 15,
    rating: 4.6,
    current_task: 'Şikayet incelemeleri',
  },
  {
    id: '6',
    name: 'Elif Şahin',
    role: 'support',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif',
    status: 'offline',
    shift: 'night',
    tasks_today: 0,
    rating: 4.8,
    current_task: null,
  },
];

const mockShifts: Shift[] = [
  {
    name: 'Sabah Vardiyası',
    time: '09:00 - 17:00',
    icon: Sun,
    members: 4,
    color: 'bg-yellow-500/10 dark:bg-yellow-500/20',
  },
  {
    name: 'Öğleden Sonra',
    time: '14:00 - 22:00',
    icon: Coffee,
    members: 3,
    color: 'bg-orange-500/10 dark:bg-orange-500/20',
  },
  {
    name: 'Gece Vardiyası',
    time: '22:00 - 06:00',
    icon: Moon,
    members: 2,
    color: 'bg-indigo-500/10 dark:bg-indigo-500/20',
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Fatma Demir', tasks: 156, rating: 4.8 },
  { rank: 2, name: 'Can Öztürk', tasks: 142, rating: 4.6 },
  { rank: 3, name: 'Emre Kaya', tasks: 138, rating: 4.7 },
  { rank: 4, name: 'Ahmet Yılmaz', tasks: 127, rating: 4.9 },
  { rank: 5, name: 'Zeynep Arslan', tasks: 98, rating: 4.9 },
];

// Fetch functions with Supabase + mock fallback
async function fetchTeamStats(): Promise<TeamStats> {
  try {
    const supabase = getClient();

    // Try to fetch from team_stats view or aggregate from profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, status')
      .eq('role', 'team_member');

    if (error) throw error;

    if (profiles && profiles.length > 0) {
      const onlineCount = profiles.filter((p: { status?: string }) => p.status === 'online').length;

      // Fetch tasks completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id')
        .gte('completed_at', today)
        .eq('status', 'completed');

      return {
        total_members: profiles.length,
        online_now: onlineCount,
        tasks_completed_today: tasks?.length || 0,
        avg_response_time: '4.2 min', // Would need dedicated metrics table
      };
    }

    return mockTeamStats;
  } catch {
    // Fall back to mock data in development or on error
    console.log('Using mock team stats data');
    return mockTeamStats;
  }
}

async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        id,
        full_name,
        role,
        avatar_url,
        status,
        shift,
        tasks_today,
        rating,
        current_task
      `)
      .order('rating', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((member: {
        id: string;
        full_name: string;
        role: string;
        avatar_url?: string;
        status?: string;
        shift?: string;
        tasks_today?: number;
        rating?: number;
        current_task?: string | null;
      }) => ({
        id: member.id,
        name: member.full_name,
        role: member.role || 'support',
        avatar: member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`,
        status: (member.status as 'online' | 'away' | 'offline') || 'offline',
        shift: member.shift || 'morning',
        tasks_today: member.tasks_today || 0,
        rating: member.rating || 4.5,
        current_task: member.current_task || null,
      }));
    }

    return mockTeamMembers;
  } catch {
    console.log('Using mock team members data');
    return mockTeamMembers;
  }
}

async function fetchShifts(): Promise<Shift[]> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      const iconMap: Record<string, typeof Sun | typeof Coffee | typeof Moon> = {
        morning: Sun,
        afternoon: Coffee,
        night: Moon,
      };

      const colorMap: Record<string, string> = {
        morning: 'bg-yellow-500/10 dark:bg-yellow-500/20',
        afternoon: 'bg-orange-500/10 dark:bg-orange-500/20',
        night: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      };

      return data.map((shift: {
        name: string;
        time_range?: string;
        type?: string;
        member_count?: number;
      }) => ({
        name: shift.name,
        time: shift.time_range || '09:00 - 17:00',
        icon: iconMap[shift.type || 'morning'] || Sun,
        members: shift.member_count || 0,
        color: colorMap[shift.type || 'morning'] || 'bg-yellow-500/10 dark:bg-yellow-500/20',
      }));
    }

    return mockShifts;
  } catch {
    console.log('Using mock shifts data');
    return mockShifts;
  }
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('admin_users')
      .select('full_name, tasks_completed, rating')
      .order('tasks_completed', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((entry: {
        full_name: string;
        tasks_completed?: number;
        rating?: number;
      }, index: number) => ({
        rank: index + 1,
        name: entry.full_name,
        tasks: entry.tasks_completed || 0,
        rating: entry.rating || 4.5,
      }));
    }

    return mockLeaderboard;
  } catch {
    console.log('Using mock leaderboard data');
    return mockLeaderboard;
  }
}

// Custom hooks
function useTeamStats() {
  return useQuery({
    queryKey: ['team', 'stats'],
    queryFn: fetchTeamStats,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
    retry: 1,
  });
}

function useTeamMembers() {
  return useQuery({
    queryKey: ['team', 'members'],
    queryFn: fetchTeamMembers,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  });
}

function useShifts() {
  return useQuery({
    queryKey: ['team', 'shifts'],
    queryFn: fetchShifts,
    staleTime: 5 * 60 * 1000, // 5 minutes (shifts don't change often)
    retry: 1,
  });
}

function useLeaderboard() {
  return useQuery({
    queryKey: ['team', 'leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

export default function TeamPage() {
  const [selectedShift, setSelectedShift] = useState('all');

  // Use React Query hooks
  const { data: teamStats, isLoading: isLoadingStats, error: statsError } = useTeamStats();
  const { data: teamMembers, isLoading: isLoadingMembers, error: membersError } = useTeamMembers();
  const { data: shifts, isLoading: isLoadingShifts, error: shiftsError } = useShifts();
  const { data: leaderboard, isLoading: isLoadingLeaderboard, error: leaderboardError } = useLeaderboard();

  const isLoading = isLoadingStats || isLoadingMembers || isLoadingShifts || isLoadingLeaderboard;
  const hasError = statsError || membersError || shiftsError || leaderboardError;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager':
        return <CanvaBadge className="bg-purple-500">Yönetici</CanvaBadge>;
      case 'moderator':
        return <CanvaBadge className="bg-blue-500">Moderatör</CanvaBadge>;
      case 'support':
        return <CanvaBadge className="bg-green-500">Destek</CanvaBadge>;
      case 'finance':
        return <CanvaBadge className="bg-emerald-500">Finans</CanvaBadge>;
      default:
        return <CanvaBadge variant="default">{role}</CanvaBadge>;
    }
  };

  const filteredMembers = (teamMembers || []).filter(
    (m) => selectedShift === 'all' || m.shift === selectedShift,
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Ekip verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show error state (but still render with fallback data)
  if (hasError) {
    console.error('Team page data fetch error:', { statsError, membersError, shiftsError, leaderboardError });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ekip Merkezi</h1>
          <p className="text-muted-foreground">
            Ekip yönetimi ve performans takibi
          </p>
        </div>
        <CanvaButton>
          <Calendar className="mr-2 h-4 w-4" />
          Vardiya Planla
        </CanvaButton>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          title="Toplam Üye"
          value={teamStats?.total_members ?? 0}
          icon={<Users className="h-8 w-8 text-blue-500" />}
        />
        <CanvaStatCard
          title="Şu An Çevrimiçi"
          value={teamStats?.online_now ?? 0}
          valueClassName="text-green-600"
          icon={
            <div className="flex h-8 w-8 items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          }
        />
        <CanvaStatCard
          title="Bugün Tamamlanan"
          value={teamStats?.tasks_completed_today ?? 0}
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
        />
        <CanvaStatCard
          title="Ort. Yanıt Süresi"
          value={teamStats?.avg_response_time ?? '-'}
          icon={<Clock className="h-8 w-8 text-orange-500" />}
        />
      </div>

      {/* Shifts Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {(shifts || []).map((shift) => (
          <CanvaCard key={shift.name} className={shift.color}>
            <CanvaCardBody className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
                    <shift.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{shift.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {shift.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{shift.members}</p>
                  <p className="text-sm text-muted-foreground">kişi</p>
                </div>
              </div>
            </CanvaCardBody>
          </CanvaCard>
        ))}
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Ekip Üyeleri</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
          <TabsTrigger value="schedule">Vardiya Takvimi</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Vardiya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Vardiyalar</SelectItem>
                <SelectItem value="morning">Sabah</SelectItem>
                <SelectItem value="afternoon">Öğleden Sonra</SelectItem>
                <SelectItem value="night">Gece</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Members Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <CanvaCard key={member.id}>
                <CanvaCardBody className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      {member.rating}
                    </div>
                  </div>

                  {member.current_task && (
                    <div className="mt-4 rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Laptop className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Şu an:</span>
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {member.current_task}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bugün</span>
                    <span className="font-medium">
                      {member.tasks_today} görev
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <CanvaButton size="sm" variant="primary" className="flex-1" onClick={() => toast.success(`${member.name} kişisine mesaj gönderildi`)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Mesaj
                    </CanvaButton>
                    <CanvaButton size="sm" variant="primary" className="flex-1" onClick={() => toast.info(`${member.name} kişisinin istatistikleri yükleniyor`)}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      İstatistik
                    </CanvaButton>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Leaderboard */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Bu Hafta Liderlik Tablosu
                </CanvaCardTitle>
                <CanvaCardSubtitle>
                  En çok görev tamamlayan ekip üyeleri
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-4">
                  {(leaderboard || []).map((item) => (
                    <div
                      key={item.rank}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            item.rank === 1
                              ? 'bg-yellow-500/20 dark:bg-yellow-500/30 text-yellow-600 dark:text-yellow-400'
                              : item.rank === 2
                                ? 'bg-muted text-muted-foreground'
                                : item.rank === 3
                                  ? 'bg-orange-500/20 dark:bg-orange-500/30 text-orange-600 dark:text-orange-400'
                                  : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.rank}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.tasks} görev
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{item.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CanvaCardBody>
            </CanvaCard>

            {/* Team Goals */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Haftalık Hedefler
                </CanvaCardTitle>
                <CanvaCardSubtitle>Ekip performans hedefleri</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Görev Tamamlama
                      </span>
                      <span className="text-sm text-muted-foreground">
                        324 / 400
                      </span>
                    </div>
                    <Progress value={81} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      %81 tamamlandı
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Yanıt Süresi Hedefi
                      </span>
                      <span className="text-sm text-muted-foreground">
                        4.2 dk / 5 dk
                      </span>
                    </div>
                    <Progress value={92} className="h-2" />
                    <p className="mt-1 text-xs text-green-600">
                      Hedefin altında!
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Müşteri Memnuniyeti
                      </span>
                      <span className="text-sm text-muted-foreground">
                        4.7 / 5.0
                      </span>
                    </div>
                    <Progress value={94} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      %94 memnuniyet
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        İlk Yanıt Çözümü
                      </span>
                      <span className="text-sm text-muted-foreground">
                        68% / 75%
                      </span>
                    </div>
                    <Progress value={68} className="h-2" />
                    <p className="mt-1 text-xs text-orange-600">
                      Hedefe yaklaşılıyor
                    </p>
                  </div>
                </div>
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Vardiya Takvimi</CanvaCardTitle>
              <CanvaCardSubtitle>
                Bu hafta için planlanan vardiyalar
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="rounded-lg border">
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 font-medium text-muted-foreground"></div>
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(
                    (day) => (
                      <div key={day} className="p-3 text-center font-medium">
                        {day}
                      </div>
                    ),
                  )}
                </div>
                {(shifts || []).map((shift) => (
                  <div
                    key={shift.name}
                    className="grid grid-cols-8 border-b last:border-0"
                  >
                    <div className="p-3 flex items-center gap-2">
                      <shift.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {shift.name.split(' ')[0]}
                      </span>
                    </div>
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="p-3 text-center">
                        <div className="flex -space-x-2 justify-center">
                          {(teamMembers || [])
                            .filter(
                              (m) =>
                                m.shift ===
                                shift.name.toLowerCase().split(' ')[0],
                            )
                            .slice(0, 3)
                            .map((m) => (
                              <Avatar
                                key={m.id}
                                className="h-6 w-6 border-2 border-background"
                              >
                                <AvatarImage src={m.avatar} />
                                <AvatarFallback className="text-xs">
                                  {m.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
