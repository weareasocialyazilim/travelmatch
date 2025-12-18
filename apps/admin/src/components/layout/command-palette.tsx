'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Users,
  Image,
  AlertTriangle,
  DollarSign,
  Settings,
  Search,
  LayoutDashboard,
  ListTodo,
  LogOut,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/hooks/use-auth';

interface CommandItem {
  id: string;
  title: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

const navigationItems: CommandItem[] = [
  { id: 'queue', title: 'İş Kuyruğu', icon: ListTodo, href: '/queue' },
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'users', title: 'Kullanıcılar', icon: Users, href: '/users' },
  { id: 'moments', title: 'Momentler', icon: Image, href: '/moments' },
  { id: 'disputes', title: 'Anlaşmazlıklar', icon: AlertTriangle, href: '/disputes' },
  { id: 'finance', title: 'Finans', icon: DollarSign, href: '/finance' },
  { id: 'settings', title: 'Ayarlar', icon: Settings, href: '/settings' },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { logout } = useAuth();
  const [search, setSearch] = useState('');

  const handleSelect = useCallback(
    (item: CommandItem) => {
      setCommandPaletteOpen(false);
      setSearch('');

      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [router, setCommandPaletteOpen]
  );

  const actionItems: CommandItem[] = [
    {
      id: 'logout',
      title: 'Çıkış Yap',
      icon: LogOut,
      action: logout,
    },
  ];

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Ara veya komut yaz..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm">
              Sonuç bulunamadı.
            </Command.Empty>

            <Command.Group heading="Navigasyon">
              {navigationItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.title}
                  onSelect={() => handleSelect(item)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                  {item.shortcut && (
                    <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                      {item.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Hızlı Arama">
              <Command.Item
                value="kullanıcı ara"
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  router.push('/users?search=' + search);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Kullanıcı Ara: {search || '...'}</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="İşlemler">
              {actionItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.title}
                  onSelect={() => handleSelect(item)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
