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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUIStore } from '@/stores/ui-store';
import { usePermission } from '@/hooks/use-permission';

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
];

const operationsNavItems: NavItem[] = [
  {
    title: 'Finans',
    href: '/finance',
    icon: DollarSign,
    resource: 'transactions',
  },
  {
    title: 'Güvenlik',
    href: '/trust-safety',
    icon: Shield,
    resource: 'reports',
  },
  {
    title: 'Destek',
    href: '/support',
    icon: MessageSquare,
    resource: 'reports',
  },
  {
    title: 'Analitik',
    href: '/analytics',
    icon: BarChart3,
    resource: 'analytics',
  },
  {
    title: 'Entegrasyonlar',
    href: '/integrations',
    icon: Plug,
    resource: 'integrations',
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
    title: 'Promosyonlar',
    href: '/promos',
    icon: Gift,
    resource: 'users',
  },
];

const settingsNavItems: NavItem[] = [
  {
    title: 'Admin Kullanıcıları',
    href: '/admin-users',
    icon: UserCog,
    resource: 'admin_users',
  },
  {
    title: 'Ayarlar',
    href: '/settings',
    icon: Settings,
    resource: 'settings',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { can } = usePermission();

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
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
          isActive
            ? 'bg-accent text-accent-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!sidebarCollapsed && (
          <>
            <span className="flex-1">{item.title}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                {item.badge}
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
          <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
        'flex h-screen flex-col border-r bg-card transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <Link href="/queue" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">TM</span>
            </div>
            <span className="font-semibold">Admin</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', sidebarCollapsed && 'mx-auto')}
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
          <Separator />
          <NavSection title="Yönetim" items={managementNavItems} />
          <Separator />
          <NavSection title="Operasyon" items={operationsNavItems} />
          <Separator />
          <NavSection title="Büyüme" items={growthNavItems} />
          <Separator />
          <NavSection title="Sistem" items={settingsNavItems} />
        </div>
      </ScrollArea>
    </aside>
  );
}
