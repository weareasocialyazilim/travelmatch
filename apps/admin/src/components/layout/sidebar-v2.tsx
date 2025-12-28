'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Image,
  AlertTriangle,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Plug,
  Bell,
  Megaphone,
  Brain,
  Zap,
  Gift,
  UserCog,
  Globe,
  TrendingUp,
  Activity,
  Siren,
  Bug,
  Star,
  HeartHandshake,
  UsersRound,
  Code,
  BookOpen,
  Lightbulb,
  CalendarDays,
  Building2,
  Languages,
  Trophy,
  Wallet,
  Accessibility,
  Heart,
  FileEdit,
  History,
  Flag,
  LogOut,
  User,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/stores/ui-store';
import { usePermission } from '@/hooks/use-permission';
import { useAuth } from '@/hooks/use-auth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  resource?: string;
}

const mainNavItems: NavItem[] = [
  {
    title: 'İş Kuyruğu',
    href: '/queue',
    icon: ListTodo,
    badge: 0,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
];

const managementNavItems: NavItem[] = [
  {
    title: 'Kullanıcılar',
    href: '/users',
    icon: Users,
    resource: 'users',
  },
  {
    title: 'Momentler',
    href: '/moments',
    icon: Image,
    resource: 'moments',
  },
  {
    title: 'Anlaşmazlıklar',
    href: '/disputes',
    icon: AlertTriangle,
    resource: 'disputes',
  },
  {
    title: 'Creators',
    href: '/creators',
    icon: Star,
    resource: 'users',
  },
];

const operationsNavItems: NavItem[] = [
  {
    title: 'Finans',
    href: '/finance',
    icon: DollarSign,
    resource: 'transactions',
  },
  {
    title: 'Gelir Analizi',
    href: '/revenue',
    icon: TrendingUp,
    resource: 'transactions',
  },
  {
    title: 'Fiyatlandırma',
    href: '/pricing',
    icon: Wallet,
    resource: 'transactions',
  },
  {
    title: 'Güvenlik',
    href: '/trust-safety',
    icon: Shield,
    resource: 'reports',
  },
  {
    title: 'Güvenlik Merkezi',
    href: '/safety-center',
    icon: HeartHandshake,
    resource: 'reports',
  },
  {
    title: 'Destek',
    href: '/support',
    icon: MessageSquare,
    resource: 'reports',
  },
  {
    title: 'Müşteri Başarısı',
    href: '/customer-success',
    icon: Heart,
    resource: 'users',
  },
];

const analyticsNavItems: NavItem[] = [
  {
    title: 'Analitik',
    href: '/analytics',
    icon: BarChart3,
    resource: 'analytics',
  },
  {
    title: 'Coğrafya',
    href: '/geographic',
    icon: Globe,
    resource: 'analytics',
  },
  {
    title: 'Ops Merkezi',
    href: '/ops-center',
    icon: Activity,
    resource: 'analytics',
  },
  {
    title: 'Olaylar',
    href: '/incidents',
    icon: Siren,
    resource: 'settings',
  },
  {
    title: 'Hatalar',
    href: '/errors',
    icon: Bug,
    resource: 'settings',
  },
];

const growthNavItems: NavItem[] = [
  {
    title: 'Bildirimler',
    href: '/notifications',
    icon: Bell,
    resource: 'users',
  },
  {
    title: 'Kampanyalar',
    href: '/campaigns',
    icon: Megaphone,
    resource: 'users',
  },
  {
    title: 'Etkinlikler',
    href: '/events',
    icon: CalendarDays,
    resource: 'users',
  },
  {
    title: 'Gamification',
    href: '/gamification',
    icon: Trophy,
    resource: 'users',
  },
  {
    title: 'Promosyonlar',
    href: '/promos',
    icon: Gift,
    resource: 'users',
  },
  {
    title: 'Partnerler',
    href: '/partners',
    icon: Building2,
    resource: 'users',
  },
];

const contentNavItems: NavItem[] = [
  {
    title: 'Editorial',
    href: '/editorial',
    icon: FileEdit,
    resource: 'moments',
  },
  {
    title: 'Bilgi Bankası',
    href: '/knowledge-base',
    icon: BookOpen,
    resource: 'settings',
  },
  {
    title: 'Geri Bildirim',
    href: '/feedback',
    icon: Lightbulb,
    resource: 'users',
  },
  {
    title: 'Yerelleştirme',
    href: '/localization',
    icon: Languages,
    resource: 'settings',
  },
  {
    title: 'Erişilebilirlik',
    href: '/accessibility',
    icon: Accessibility,
    resource: 'settings',
  },
];

const techNavItems: NavItem[] = [
  {
    title: 'AI Center',
    href: '/ai-center',
    icon: Brain,
    resource: 'analytics',
  },
  {
    title: 'Otomasyon',
    href: '/automation',
    icon: Zap,
    resource: 'settings',
  },
  {
    title: 'Entegrasyonlar',
    href: '/integrations',
    icon: Plug,
    resource: 'integrations',
  },
  {
    title: 'Dev Tools',
    href: '/dev-tools',
    icon: Code,
    resource: 'settings',
  },
  {
    title: 'Feature Flags',
    href: '/feature-flags',
    icon: Flag,
    resource: 'settings',
  },
];

const settingsNavItems: NavItem[] = [
  {
    title: 'Ekip',
    href: '/team',
    icon: UsersRound,
    resource: 'admin_users',
  },
  {
    title: 'Admin Kullanıcıları',
    href: '/admin-users',
    icon: UserCog,
    resource: 'admin_users',
  },
  {
    title: 'Audit Logs',
    href: '/audit-logs',
    icon: History,
    resource: 'admin_users',
  },
  {
    title: 'Ayarlar',
    href: '/settings',
    icon: Settings,
    resource: 'settings',
  },
];

export function SidebarV2() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { can } = usePermission();
  const { user, logout } = useAuth();

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

    // Check permission if resource is specified
    if (item.resource && !can(item.resource as never, 'view')) {
      return null;
    }

    const content = (
      <Link
        href={item.href}
        className={cn(
          'sidebar-v2-nav-item group relative',
          isActive && 'sidebar-v2-nav-item-active',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        {/* Gradient accent indicator for active state */}
        {isActive && (
          <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-400 to-amber-600" />
        )}
        <item.icon className={cn(
          'h-4.5 w-4.5 shrink-0 transition-colors',
          isActive ? 'text-amber-600 dark:text-amber-400' : 'group-hover:text-foreground'
        )} />
        {!sidebarCollapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-1.5 text-xs font-medium text-white shadow-sm">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => {
    const visibleItems = items.filter(
      (item) => !item.resource || can(item.resource as never, 'view')
    );

    if (visibleItems.length === 0) return null;

    return (
      <div className="space-y-1">
        {!sidebarCollapsed && (
          <h4 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            {title}
          </h4>
        )}
        {visibleItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'sidebar-v2',
        sidebarCollapsed ? 'w-[64px]' : 'w-[260px]'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        {!sidebarCollapsed && (
          <Link href="/queue" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-md">
              <span className="text-sm font-bold text-white">TM</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">TravelMatch</span>
              <span className="text-[10px] text-muted-foreground">Admin Panel</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 hover:bg-sidebar-active',
            sidebarCollapsed && 'mx-auto'
          )}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          <NavSection title="Ana Menü" items={mainNavItems} />
          <Separator className="bg-sidebar-border" />
          <NavSection title="Yönetim" items={managementNavItems} />
          <Separator className="bg-sidebar-border" />
          <NavSection title="Operasyon" items={operationsNavItems} />
          <Separator className="bg-sidebar-border" />
          <NavSection title="Analitik" items={analyticsNavItems} />
          <Separator className="bg-sidebar-border" />
          <NavSection title="Büyüme" items={growthNavItems} />
          <Separator className="bg-sidebar-border" />
          <NavSection title="İçerik" items={contentNavItems} />
          <Separator className="bg-sidebar-border" />
          <NavSection title="Teknoloji" items={techNavItems} />
          <Separator className="bg-sidebar-border" />
          <NavSection title="Sistem" items={settingsNavItems} />
        </div>
      </ScrollArea>

      {/* User Section with Trust Ring */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-active',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <div className="relative">
                <Avatar className="h-9 w-9 ring-2 ring-emerald-500 ring-offset-2 ring-offset-sidebar">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                {/* Verified badge */}
                <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-sidebar">
                  <CheckCircle className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{user?.role || 'Super Admin'}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side={sidebarCollapsed ? 'right' : 'top'}>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name || 'Admin User'}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email || 'admin@travelmatch.com'}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
