'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Users,
  Image,
  AlertTriangle,
  DollarSign,
  Settings,
  LayoutDashboard,
  ListTodo,
  LogOut,
  BarChart3,
  Shield,
  Globe,
  Wallet,
  MessageSquare,
  Flag,
  Activity,
  Zap,
  Brain,
  Target,
  Award,
  FileText,
  Calendar,
  Bell,
  Headphones,
  Tag,
  TrendingUp,
  Search,
  Loader2,
  User,
  CreditCard,
  Hash,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface NavCommandItem {
  id: string;
  title: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

interface SearchResult {
  type: 'user' | 'transaction' | 'moment';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  href: string;
}

const navigationItems: NavCommandItem[] = [
  {
    id: 'queue',
    title: 'İş Kuyruğu',
    icon: ListTodo,
    href: '/queue',
    shortcut: '⌘1',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    shortcut: '⌘D',
  },
  {
    id: 'users',
    title: 'Kullanıcılar',
    icon: Users,
    href: '/users',
    shortcut: '⌘U',
  },
  { id: 'moments', title: 'Momentler', icon: Image, href: '/moments' },
  {
    id: 'disputes',
    title: 'Anlaşmazlıklar',
    icon: AlertTriangle,
    href: '/disputes',
  },
  {
    id: 'finance',
    title: 'Finans',
    icon: DollarSign,
    href: '/finance',
    shortcut: '⌘F',
  },
  {
    id: 'analytics',
    title: 'Analitik',
    icon: BarChart3,
    href: '/analytics',
    shortcut: '⌘A',
  },
  { id: 'revenue', title: 'Gelir', icon: TrendingUp, href: '/revenue' },
  {
    id: 'geographic',
    title: 'Coğrafi Analiz',
    icon: Globe,
    href: '/geographic',
  },
  {
    id: 'wallet-operations',
    title: 'Cüzdan İşlemleri',
    icon: Wallet,
    href: '/wallet-operations',
  },
  { id: 'support', title: 'Destek', icon: Headphones, href: '/support' },
  { id: 'campaigns', title: 'Kampanyalar', icon: Target, href: '/campaigns' },
  { id: 'promos', title: 'Promosyonlar', icon: Tag, href: '/promos' },
  {
    id: 'creators',
    title: 'İçerik Üreticileri',
    icon: Award,
    href: '/creators',
  },
  { id: 'moderation', title: 'Moderasyon', icon: Shield, href: '/moderation' },
  {
    id: 'safety-hub',
    title: 'Güvenlik Merkezi',
    icon: Shield,
    href: '/safety-hub',
  },
  { id: 'compliance', title: 'Uyumluluk', icon: FileText, href: '/compliance' },
  {
    id: 'audit-trail',
    title: 'Denetim Kaydı',
    icon: Activity,
    href: '/audit-trail',
  },
  {
    id: 'feature-flags',
    title: 'Feature Flags',
    icon: Flag,
    href: '/feature-flags',
  },
  { id: 'ai-center', title: 'AI Merkezi', icon: Brain, href: '/ai-center' },
  { id: 'ai-insights', title: 'AI Insights', icon: Zap, href: '/ai-insights' },
  {
    id: 'command-center',
    title: 'Komuta Merkezi',
    icon: Activity,
    href: '/command-center',
  },
  {
    id: 'ceo-briefing',
    title: 'CEO Brifing',
    icon: BarChart3,
    href: '/ceo-briefing',
  },
  { id: 'team', title: 'Ekip', icon: Users, href: '/team' },
  { id: 'alerts', title: 'Uyarılar', icon: Bell, href: '/alerts' },
  {
    id: 'settings',
    title: 'Ayarlar',
    icon: Settings,
    href: '/settings',
    shortcut: '⌘,',
  },
];

// Quick actions for common tasks
const quickActions: NavCommandItem[] = [
  {
    id: 'new-campaign',
    title: 'Yeni Kampanya Oluştur',
    icon: Target,
    href: '/campaign-builder',
  },
  {
    id: 'view-queue',
    title: 'Bekleyen Görevleri Gör',
    icon: ListTodo,
    href: '/queue?status=pending',
  },
  {
    id: 'export-report',
    title: 'Rapor İndir',
    icon: FileText,
    href: '/analytics',
  },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Reset search when dialog closes
  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [commandPaletteOpen]);

  // Search API when query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchData = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchData();
  }, [debouncedQuery]);

  // Filter navigation items based on query
  const filteredNavItems = useMemo(() => {
    if (!searchQuery) return navigationItems;
    const query = searchQuery.toLowerCase();
    return navigationItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = useCallback(
    (item: NavCommandItem) => {
      setCommandPaletteOpen(false);

      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [router, setCommandPaletteOpen],
  );

  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      setCommandPaletteOpen(false);
      router.push(result.href);
    },
    [router, setCommandPaletteOpen],
  );

  const actionItems: NavCommandItem[] = [
    {
      id: 'logout',
      title: 'Çıkış Yap',
      icon: LogOut,
      action: logout,
    },
  ];

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return User;
      case 'transaction':
        return CreditCard;
      case 'moment':
        return Image;
      default:
        return Hash;
    }
  };

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput
        placeholder="Kullanıcı, işlem veya sayfa ara..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {isSearching && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isSearching && searchQuery && searchResults.length === 0 && filteredNavItems.length === 0 && (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p>"{searchQuery}" için sonuç bulunamadı</p>
              <p className="text-xs text-muted-foreground">
                Farklı bir arama terimi deneyin
              </p>
            </div>
          </CommandEmpty>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <>
            <CommandGroup heading="Arama Sonuçları">
              {searchResults.map((result) => {
                const ResultIcon = getResultIcon(result.type);
                return (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    value={`${result.type}-${result.title}`}
                    onSelect={() => handleResultSelect(result)}
                    className="flex items-center gap-3 py-3"
                  >
                    {result.type === 'user' && result.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={result.avatar} />
                        <AvatarFallback>{getInitials(result.title)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <ResultIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                      )}
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground capitalize">
                      {result.type === 'user' ? 'Kullanıcı' :
                       result.type === 'transaction' ? 'İşlem' :
                       result.type === 'moment' ? 'Moment' : result.type}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Quick Actions - Only show when not searching */}
        {!searchQuery && (
          <>
            <CommandGroup heading="Hızlı İşlemler">
              {quickActions.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => handleSelect(item)}
                >
                  <item.icon className="mr-2 h-4 w-4 text-primary" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Navigation */}
        {filteredNavItems.length > 0 && (
          <CommandGroup heading="Sayfalar">
            {filteredNavItems.slice(0, searchQuery ? 10 : 8).map((item) => (
              <CommandItem
                key={item.id}
                value={item.title}
                onSelect={() => handleSelect(item)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
                {item.shortcut && (
                  <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                    {item.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="İşlemler">
          {actionItems.map((item) => (
            <CommandItem
              key={item.id}
              value={item.title}
              onSelect={() => handleSelect(item)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
