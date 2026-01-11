'use client';

/**
 * Enterprise Sidebar
 * Inspired by: META Business Suite, Google Cloud Console, Stripe Dashboard
 *
 * Design Principles:
 * - Maximum 3 levels of hierarchy
 * - Quick access to frequent actions
 * - Role-based visibility
 * - Keyboard navigation support
 */

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ImageIcon,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wallet,
  FileText,
  Zap,
  HelpCircle,
  Command,
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

// Simplified navigation structure - Maximum clarity
const navigation = {
  main: [
    {
      id: 'overview',
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'queue',
      label: 'Is Kuyrugu',
      href: '/queue',
      icon: Zap,
      badge: 12,
    },
  ],
  management: [
    {
      id: 'users',
      label: 'Kullanicilar',
      href: '/users',
      icon: Users,
      resource: 'users',
    },
    {
      id: 'moments',
      label: 'Momentler',
      href: '/moments',
      icon: ImageIcon,
      resource: 'moments',
    },
    {
      id: 'moderation',
      label: 'Moderasyon',
      href: '/moderation',
      icon: Shield,
      resource: 'reports',
    },
  ],
  finance: [
    {
      id: 'finance',
      label: 'Finans',
      href: '/finance',
      icon: DollarSign,
      resource: 'transactions',
    },
    {
      id: 'wallet',
      label: 'Cuzdan & Odemeler',
      href: '/wallet-operations',
      icon: Wallet,
      resource: 'transactions',
    },
  ],
  insights: [
    {
      id: 'analytics',
      label: 'Analitik',
      href: '/analytics',
      icon: BarChart3,
      resource: 'analytics',
    },
    {
      id: 'ai',
      label: 'AI Insights',
      href: '/ai-center',
      icon: Sparkles,
      resource: 'analytics',
    },
  ],
  system: [
    {
      id: 'team',
      label: 'Ekip',
      href: '/team',
      icon: Users,
      resource: 'admin_users',
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      href: '/audit-logs',
      icon: FileText,
      resource: 'admin_users',
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      href: '/settings',
      icon: Settings,
      resource: 'settings',
    },
  ],
};

const sectionLabels: Record<string, string> = {
  main: '',
  management: 'Yonetim',
  finance: 'Finans',
  insights: 'Analitik',
  system: 'Sistem',
};

export function EnterpriseSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { can } = usePermission();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + '/'),
    [pathname]
  );

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800',
        'transition-all duration-200 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-gray-200 dark:border-gray-800">
        {!sidebarCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                TravelMatch
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
        )}
      </div>

      {/* Quick Search */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3">
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm',
              'bg-gray-100 dark:bg-gray-900 rounded-lg',
              'text-gray-500 dark:text-gray-400',
              'hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors'
            )}
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Ara...</span>
            <kbd className="text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {Object.entries(navigation).map(([section, items]) => {
          const visibleItems = items.filter(
            (item) => !item.resource || can(item.resource as never, 'view')
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section} className="mb-4">
              {!sidebarCollapsed && sectionLabels[section] && (
                <h3 className="px-3 mb-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {sectionLabels[section]}
                </h3>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    active={isActive(item.href)}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-start text-gray-500 hover:text-gray-900 dark:hover:text-white',
            sidebarCollapsed && 'justify-center px-2'
          )}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Daralt</span>
            </>
          )}
        </Button>

        {/* Help Link */}
        {!sidebarCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-500 hover:text-gray-900 dark:hover:text-white mt-1"
            asChild
          >
            <Link href="/help">
              <HelpCircle className="w-4 h-4 mr-2" />
              <span>Yardim</span>
            </Link>
          </Button>
        )}
      </div>
    </aside>
  );
}

// Memoized NavItem component
const NavItem = memo(function NavItem({
  item,
  active,
  collapsed,
}: {
  item: {
    id: string;
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
  };
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
        'transition-colors duration-150',
        active
          ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-violet-600 dark:text-violet-400')} />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && item.badge > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});
