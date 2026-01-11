'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Image,
  AlertTriangle,
  DollarSign,
  Settings,
  LayoutDashboard,
  ListTodo,
  LogOut,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/hooks/use-auth';

interface NavCommandItem {
  id: string;
  title: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

const navigationItems: NavCommandItem[] = [
  { id: 'queue', title: 'İş Kuyruğu', icon: ListTodo, href: '/queue' },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  { id: 'users', title: 'Kullanıcılar', icon: Users, href: '/users' },
  { id: 'moments', title: 'Momentler', icon: Image, href: '/moments' },
  {
    id: 'disputes',
    title: 'Anlaşmazlıklar',
    icon: AlertTriangle,
    href: '/disputes',
  },
  { id: 'finance', title: 'Finans', icon: DollarSign, href: '/finance' },
  { id: 'settings', title: 'Ayarlar', icon: Settings, href: '/settings' },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { logout } = useAuth();

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

  const actionItems: NavCommandItem[] = [
    {
      id: 'logout',
      title: 'Çıkış Yap',
      icon: LogOut,
      action: logout,
    },
  ];

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput placeholder="Ara veya komut yaz..." />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>

        <CommandGroup heading="Navigasyon">
          {navigationItems.map((item) => (
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
