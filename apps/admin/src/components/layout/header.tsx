'use client';

/**
 * TravelMatch Admin Header
 * "Cinematic Travel + Trust Jewelry" Design
 */

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Command,
  ChevronRight,
  Settings,
  Moon,
  Sun,
  LogOut,
  User,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/hooks/use-auth';
import { getInitials } from '@/lib/utils';

// Breadcrumb mapping
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Kullanıcılar',
  moments: 'Momentler',
  disputes: 'Anlaşmazlıklar',
  finance: 'Finans',
  analytics: 'Analitik',
  settings: 'Ayarlar',
  queue: 'İş Kuyruğu',
  'trust-safety': 'Güvenlik',
  support: 'Destek',
  notifications: 'Bildirimler',
  campaigns: 'Kampanyalar',
  profile: 'Profil',
  kyc: 'KYC',
  reports: 'Raporlar',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { setCommandPaletteOpen } = useUIStore();
  const { logout } = useAuth();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
    href: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleSearchClick = () => {
    setCommandPaletteOpen(true);
  };

  return (
    <header className="admin-header">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Ana Sayfa
        </Link>
        {breadcrumbs.map((crumb) => (
          <div key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {crumb.isLast ? (
              <span className="font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Right Section */}
      <div className="admin-header-actions">
        {/* Search */}
        <div
          className={cn(
            'admin-header-search cursor-pointer',
            searchFocused && 'ring-2 ring-primary/50'
          )}
          onClick={handleSearchClick}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ara... (⌘K)"
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 w-40 text-sm cursor-pointer"
            onFocus={() => {
              setSearchFocused(true);
              setCommandPaletteOpen(true);
            }}
            onBlur={() => setSearchFocused(false)}
            readOnly
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        {/* Help */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold">Bildirimler</span>
              <Badge variant="secondary" className="text-xs">3 yeni</Badge>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {/* Notification items */}
              <div className="px-4 py-3 hover:bg-muted/50 cursor-pointer border-b">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Yüksek öncelikli KYC bekliyor</p>
                    <p className="text-xs text-muted-foreground">24 kullanıcı onay bekliyor</p>
                    <p className="text-xs text-muted-foreground mt-1">5 dk önce</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 hover:bg-muted/50 cursor-pointer border-b">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-warning shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Sistem performansı düştü</p>
                    <p className="text-xs text-muted-foreground">Notification servisi %98.5 uptime</p>
                    <p className="text-xs text-muted-foreground mt-1">15 dk önce</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 hover:bg-muted/50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-trust shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Günlük rapor hazır</p>
                    <p className="text-xs text-muted-foreground">17 Aralık raporu oluşturuldu</p>
                    <p className="text-xs text-muted-foreground mt-1">1 saat önce</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" className="w-full text-sm">
                Tüm bildirimleri gör
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 text-muted-foreground rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 text-muted-foreground rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Tema değiştir</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 pl-2 pr-3">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user ? getInitials(user.name) : '??'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">
                {user?.name?.split(' ')[0] || 'Kullanıcı'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'Super Admin'}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Ayarlar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
