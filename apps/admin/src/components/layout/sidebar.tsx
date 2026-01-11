'use client';

/**
 * TravelMatch Admin Sidebar
 * "Cinematic Travel + Trust Jewelry" Design
 */

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
  Bell,
  Megaphone,
  Brain,
  Gift,
  UserCog,
  Globe,
  TrendingUp,
  Activity,
  Star,
  UsersRound,
  Code,
  History,
  Flag,
  MapPin,
  LogOut,
  Moon,
  Sparkles,
  Zap,
  Lock,
  Camera,
  Compass,
  Heart,
  Wifi,
  Wallet,
  CreditCard,
  Send,
  ShieldCheck,
  UserCheck,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/stores/ui-store';
import { usePermission } from '@/hooks/use-permission';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  resource?: string;
}

// Navigation sections
const mainNavItems: NavItem[] = [
  { title: 'Command Center', href: '/command-center', icon: Zap },
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Is Kuyrugu', href: '/queue', icon: ListTodo, badge: 0 },
];

const managementNavItems: NavItem[] = [
  { title: 'Kullanicilar', href: '/users', icon: Users, resource: 'users' },
  { title: 'Momentler', href: '/moments', icon: Image, resource: 'moments' },
  {
    title: 'Anlasmazliklar',
    href: '/disputes',
    icon: AlertTriangle,
    resource: 'disputes',
  },
  { title: 'Creators', href: '/creators', icon: Star, resource: 'users' },
  {
    title: 'Ceremony',
    href: '/ceremony-management',
    icon: Sparkles,
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
    title: 'Wallet & Payouts',
    href: '/wallet-operations',
    icon: Wallet,
    resource: 'transactions',
  },
  {
    title: 'Abonelikler',
    href: '/subscription-management',
    icon: CreditCard,
    resource: 'transactions',
  },
  {
    title: 'Escrow Islemleri',
    href: '/escrow-operations',
    icon: Lock,
    resource: 'transactions',
  },
  {
    title: 'Proof Merkezi',
    href: '/proof-center',
    icon: Camera,
    resource: 'transactions',
  },
  {
    title: 'Safety Hub',
    href: '/safety-hub',
    icon: ShieldCheck,
    resource: 'reports',
  },
  {
    title: 'Destek',
    href: '/support',
    icon: MessageSquare,
    resource: 'reports',
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
    title: 'User Lifecycle',
    href: '/user-lifecycle',
    icon: UserCheck,
    resource: 'analytics',
  },
  {
    title: 'Kesif & Eslesme',
    href: '/discovery-analytics',
    icon: Compass,
    resource: 'analytics',
  },
  {
    title: 'Chat Analitik',
    href: '/chat-analytics',
    icon: Heart,
    resource: 'analytics',
  },
  {
    title: 'Cografya',
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
];

const growthNavItems: NavItem[] = [
  {
    title: 'Bildirimler',
    href: '/notifications',
    icon: Bell,
    resource: 'users',
  },
  {
    title: 'Kampanya Builder',
    href: '/campaign-builder',
    icon: Send,
    resource: 'users',
  },
  {
    title: 'Kampanyalar',
    href: '/campaigns',
    icon: Megaphone,
    resource: 'users',
  },
  { title: 'Promosyonlar', href: '/promos', icon: Gift, resource: 'users' },
];

const techNavItems: NavItem[] = [
  {
    title: 'AI Center',
    href: '/ai-center',
    icon: Brain,
    resource: 'analytics',
  },
  {
    title: 'AI Insights',
    href: '/ai-insights',
    icon: Sparkles,
    resource: 'analytics',
  },
  {
    title: 'Sistem Sagligi',
    href: '/system-health',
    icon: Server,
    resource: 'settings',
  },
  {
    title: 'Entegrasyonlar',
    href: '/integrations-monitor',
    icon: Wifi,
    resource: 'settings',
  },
  {
    title: 'Feature Flags',
    href: '/feature-flags',
    icon: Flag,
    resource: 'settings',
  },
  { title: 'Dev Tools', href: '/dev-tools', icon: Code, resource: 'settings' },
];

const settingsNavItems: NavItem[] = [
  { title: 'Ekip', href: '/team', icon: UsersRound, resource: 'admin_users' },
  {
    title: 'Audit Logs',
    href: '/audit-logs',
    icon: History,
    resource: 'admin_users',
  },
  { title: 'Ayarlar', href: '/settings', icon: Settings, resource: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { can } = usePermission();

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + '/');

    if (item.resource && !can(item.resource as never, 'view')) {
      return null;
    }

    const content = (
      <Link
        href={item.href}
        className={cn(
          'admin-sidebar-item',
          isActive && 'admin-sidebar-item-active',
          sidebarCollapsed && 'justify-center px-2',
        )}
      >
        <item.icon className="admin-sidebar-item-icon" />
        {!sidebarCollapsed && (
          <>
            <span className="flex-1">{item.title}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="admin-sidebar-badge">{item.badge}</span>
            )}
          </>
        )}
      </Link>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                'admin-sidebar-item',
                isActive && 'admin-sidebar-item-active',
                'justify-center px-2',
              )}
            >
              <item.icon className="admin-sidebar-item-icon" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="admin-sidebar-badge">{item.badge}</span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: NavItem[];
  }) => {
    const visibleItems = items.filter(
      (item) => !item.resource || can(item.resource as never, 'view'),
    );

    if (visibleItems.length === 0) return null;

    return (
      <div className="admin-sidebar-section">
        {!sidebarCollapsed && (
          <h4 className="admin-sidebar-section-title">{title}</h4>
        )}
        <div className="space-y-1">
          {visibleItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside className={cn('admin-sidebar', sidebarCollapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="admin-sidebar-logo">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="admin-sidebar-logo-icon">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">TravelMatch</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </Link>
        )}
        {sidebarCollapsed && (
          <div className="admin-sidebar-logo-icon mx-auto">
            <MapPin className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <div className="px-3 py-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-start gap-2 text-muted-foreground hover:text-foreground',
            sidebarCollapsed && 'justify-center',
          )}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Daralt</span>
            </>
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="admin-sidebar-nav flex-1 overflow-y-auto">
        <NavSection title="Ana Menu" items={mainNavItems} />
        <NavSection title="Yonetim" items={managementNavItems} />
        <NavSection title="Operasyon" items={operationsNavItems} />
        <NavSection title="Analitik" items={analyticsNavItems} />
        <NavSection title="Buyume" items={growthNavItems} />
        <NavSection title="Teknoloji" items={techNavItems} />
        <NavSection title="Sistem" items={settingsNavItems} />
      </div>

      {/* User Section */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-lg p-2 text-sm transition-colors hover:bg-muted',
                sidebarCollapsed && 'justify-center',
              )}
            >
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src="/avatars/admin.jpg" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  KY
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">Kemal Y.</p>
                  <p className="text-xs text-muted-foreground">Super Admin</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="font-medium text-sm">Kemal Y.</p>
              <p className="text-xs text-muted-foreground">
                kemal@travelmatch.app
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCog className="mr-2 h-4 w-4" />
              Profil Ayarlari
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Moon className="mr-2 h-4 w-4" />
              Karanlik Mod
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cikis Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
