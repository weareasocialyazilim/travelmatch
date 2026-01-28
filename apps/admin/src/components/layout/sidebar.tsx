'use client';

/**
 * Lovendo Admin Sidebar
 * "Cinematic Experience + Trust Jewelry" Design
 */

import { useRef, useEffect, useCallback, memo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Image,
  AlertTriangle,
  DollarSign,
  Settings,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ListTodo,
  Bell,
  Megaphone,
  Brain,
  Gift,
  UserCog,
  Globe,
  Activity,
  Star,
  UsersRound,
  Code,
  History,
  Flag,
  MapPin,
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
  Coffee,
  AlertCircle,
  Search,
  FileText,
  Crown,
  Eye,
  Scale,
  Receipt,
  PiggyBank,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUIStore } from '@/stores/ui-store';
import { usePermission } from '@/hooks/use-permission';
import type { Resource, Action } from '@/types/admin';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  resource?: Resource;
}

// Navigation sections
const mainNavItems: NavItem[] = [
  { title: 'CEO Briefing', href: '/ceo-briefing', icon: Coffee },
  { title: 'Command Center', href: '/command-center', icon: Zap },
  { title: 'Alerts', href: '/alerts', icon: AlertCircle, badge: 4 },
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'İş Kuyruğu', href: '/queue', icon: ListTodo, badge: 0 },
];

const managementNavItems: NavItem[] = [
  { title: 'Kullanicilar', href: '/users', icon: Users, resource: 'users' },
  { title: 'Moments', href: '/moments', icon: Image, resource: 'moments' },
  {
    title: 'Anlasmazliklar',
    href: '/disputes',
    icon: AlertTriangle,
    resource: 'disputes',
  },
  { title: 'Creators', href: '/creators', icon: Star, resource: 'users' },
  {
    title: 'VIP Yonetimi',
    href: '/vip-management',
    icon: Crown,
    resource: 'users',
  },
  {
    title: 'Kanıt Sistemi',
    href: '/ceremony-management',
    icon: Sparkles,
    resource: 'users',
  },
];

const operationsNavItems: NavItem[] = [
  {
    title: 'Triyaj Kuyruğu',
    href: '/triage',
    icon: ListTodo,
    resource: 'reports',
  },
  {
    title: 'Finans',
    href: '/finance',
    icon: DollarSign,
    resource: 'transactions',
  },
  {
    title: 'Cüzdan Operasyonları',
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
    title: 'Fiyatlandirma',
    href: '/pricing',
    icon: Receipt,
    resource: 'transactions',
  },
  {
    title: 'Emanet İşlemleri',
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
    title: 'Moderasyon',
    href: '/moderation',
    icon: Eye,
    resource: 'reports',
  },
  {
    title: 'Safety Hub',
    href: '/safety-hub',
    icon: ShieldCheck,
    resource: 'reports',
  },
  {
    title: 'Dolandırıcılık Soruşturması',
    href: '/fraud-investigation',
    icon: Search,
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
    title: 'Stabilite',
    href: '/ops-dashboard',
    icon: Shield,
    resource: 'analytics',
  },
  {
    title: 'Analitik',
    href: '/analytics',
    icon: BarChart3,
    resource: 'analytics',
  },
  {
    title: 'Gelir Analizi',
    href: '/revenue',
    icon: PiggyBank,
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
    title: 'Kampanya Oluşturucu',
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
  // AI Insights removed - duplicates AI Center with mock data
  {
    title: 'Sistem Sağlığı',
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
    title: 'Entegrasyon Sağlığı',
    href: '/integration-health',
    icon: Activity,
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
  {
    title: 'Admin Yönetimi',
    href: '/team',
    icon: UserCog,
    resource: 'admin_users',
  },
  {
    title: 'Güvenlik',
    href: '/security',
    icon: Lock,
    resource: 'admin_users',
  },
  // { title: 'Ekip', href: '/team', icon: UsersRound, resource: 'admin_users' },
  {
    title: 'Denetim Kaydı',
    href: '/audit-logs',
    icon: History,
    resource: 'admin_users',
  },
  {
    title: 'KVKK Merkezi',
    href: '/compliance',
    icon: Scale,
    resource: 'admin_users',
  },
  { title: 'Ayarlar', href: '/settings', icon: Settings, resource: 'settings' },
];

interface SidebarProps {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { can: storeCan } = usePermission();
  const navRef = useRef<HTMLDivElement>(null);
  const lastScrolledPath = useRef<string | null>(null);

  // Use prop user if available, otherwise fall back to store
  const can = (resource: Resource, action: Action): boolean => {
    // If user prop is passed and is super_admin, allow everything
    if (user?.role === 'super_admin') return true;
    // Otherwise use store-based permission check
    return storeCan(resource, action);
  };

  // Scroll to active item only on initial mount or when navigating to a different section
  const scrollToActiveItem = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Find the active link
    const activeLink = nav.querySelector('[data-active="true"]') as HTMLElement;
    if (!activeLink) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = activeLink.getBoundingClientRect();

    // Check if item is outside visible area
    const isAbove = itemRect.top < navRect.top + 20;
    const isBelow = itemRect.bottom > navRect.bottom - 20;

    if (isAbove || isBelow) {
      activeLink.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, []);

  // Only scroll on initial mount
  useEffect(() => {
    if (lastScrolledPath.current === null) {
      // Small delay for initial render
      const timer = setTimeout(scrollToActiveItem, 100);
      lastScrolledPath.current = pathname;
      return () => clearTimeout(timer);
    }
  }, [pathname, scrollToActiveItem]);

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
              <span className="font-bold text-sm">Lovendo</span>
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
      <nav ref={navRef} className="admin-sidebar-nav flex-1 overflow-y-auto">
        <NavSection
          title="Ana Menu"
          items={mainNavItems}
          pathname={pathname}
          collapsed={sidebarCollapsed}
          can={can}
          defaultExpanded={true}
        />
        <NavSection
          title="Yonetim"
          items={managementNavItems}
          pathname={pathname}
          collapsed={sidebarCollapsed}
          can={can}
          defaultExpanded={true}
        />
        <NavSection
          title="Operasyon"
          items={operationsNavItems}
          pathname={pathname}
          collapsed={sidebarCollapsed}
          can={can}
          defaultExpanded={false}
        />
        <NavSection
          title="Analitik"
          items={analyticsNavItems}
          pathname={pathname}
          collapsed={sidebarCollapsed}
          can={can}
          defaultExpanded={false}
        />
        <NavSection
          title="Buyume"
          items={growthNavItems}
          pathname={pathname}
          collapsed={sidebarCollapsed}
          can={can}
          defaultExpanded={false}
        />
        <NavSection
          title="Teknoloji"
          items={techNavItems}
          pathname={pathname}
          collapsed={sidebarCollapsed}
          can={can}
          defaultExpanded={false}
        />
        <NavSection
          title="Sistem"
          items={settingsNavItems}
          pathname={pathname}
          collapsed={sidebarCollapsed}
          can={can}
          defaultExpanded={false}
        />
      </nav>
    </aside>
  );
}

// Memoized NavLink component to prevent unnecessary re-renders
const NavLink = memo(function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span>
            <Link
              href={item.href}
              scroll={false}
              data-active={isActive}
              className={cn(
                'admin-sidebar-item',
                isActive && 'admin-sidebar-item-active',
                'justify-center px-2',
              )}
            >
              <item.icon className="admin-sidebar-item-icon" />
            </Link>
          </span>
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

  return (
    <Link
      href={item.href}
      scroll={false}
      data-active={isActive}
      className={cn(
        'admin-sidebar-item',
        isActive && 'admin-sidebar-item-active',
      )}
    >
      <item.icon className="admin-sidebar-item-icon" />
      <span className="flex-1">{item.title}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="admin-sidebar-badge">{item.badge}</span>
      )}
    </Link>
  );
});

// Memoized NavSection component with collapsible feature
const NavSection = memo(function NavSection({
  title,
  items,
  pathname,
  collapsed,
  can,
  defaultExpanded = true,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  can: (resource: Resource, action: Action) => boolean;
  defaultExpanded?: boolean;
}) {
  const visibleItems = items.filter(
    (item) => !item.resource || can(item.resource, 'view'),
  );

  // Auto-expand if any item in this section is active
  const hasActiveItem = visibleItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  );

  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || hasActiveItem,
  );

  // Auto-expand when navigating to an item in this section
  useEffect(() => {
    if (hasActiveItem) {
      setIsExpanded(true);
    }
  }, [hasActiveItem]);

  if (visibleItems.length === 0) return null;

  return (
    <div className="admin-sidebar-section">
      {!collapsed && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="admin-sidebar-section-title w-full flex items-center justify-between pr-3 hover:text-foreground transition-colors cursor-pointer"
        >
          <span>{title}</span>
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform duration-200',
              !isExpanded && '-rotate-90',
            )}
          />
        </button>
      )}
      <div
        className={cn(
          'space-y-1 overflow-hidden transition-all duration-200',
          !collapsed && !isExpanded && 'max-h-0 opacity-0',
          (!collapsed && isExpanded) || collapsed
            ? 'max-h-[1000px] opacity-100'
            : '',
        )}
      >
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
            />
          );
        })}
      </div>
    </div>
  );
});
