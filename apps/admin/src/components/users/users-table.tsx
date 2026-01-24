'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Ban, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrency, getInitials } from '@/lib/utils';

// Types
export interface User {
  id: string;
  display_name: string;
  full_name?: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  is_suspended: boolean;
  is_banned: boolean;
  is_verified: boolean;
  kyc_status?: string;
  balance?: number;
  total_trips?: number; // kept for compatibility, might be 'gifts_count' in future
  rating?: number;
  created_at: string;
  last_active_at?: string;
}

interface UsersTableProps {
  data: User[];
  loading: boolean;
  onRefresh: () => void;
  title?: string;
}

export function UsersTable({ data, loading, onRefresh, title = "Kullanıcılar" }: UsersTableProps) {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'user',
        header: 'Kullanıcı',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(user.display_name || user.full_name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Link
                  href={`/users/${user.id}`}
                  className="font-medium hover:underline text-foreground"
                >
                  {user.display_name || user.full_name || 'İsimsiz'}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {user.total_trips || 0} seyahat
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'E-posta',
        cell: ({ row }) => <div className="truncate max-w-[200px] text-muted-foreground">{row.getValue('email')}</div>,
      },
      {
        accessorKey: 'status',
        header: 'Durum',
        cell: ({ row }) => {
          const user = row.original;
          let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
          let label = 'Bilinmiyor';

          if (user.is_banned) {
            variant = 'destructive';
            label = 'Yasaklı';
          } else if (user.is_suspended) {
            variant = 'destructive'; // Or warning if available in Badge
            label = 'Askıda';
          } else if (user.is_active) {
            variant = 'default'; // Success usually green, using default/primary here or custom
            label = 'Aktif';
          } else {
            variant = 'secondary';
            label = 'Beklemede';
          }

          return <Badge variant={variant}>{label}</Badge>;
        },
      },
      {
        accessorKey: 'kyc',
        header: 'KYC',
        cell: ({ row }) => {
          const user = row.original;
          // Simple logic mapping
          let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
          let label = 'Başlamadı';

          if (user.is_verified) {
            variant = 'default';
            label = 'Doğrulandı';
          } else if (user.kyc_status === 'pending') {
            variant = 'secondary';
            label = 'Bekliyor';
          } else if (user.kyc_status === 'rejected') {
            variant = 'destructive';
            label = 'Red';
          }

          return <Badge variant={variant}>{label}</Badge>;
        },
      },
      {
        accessorKey: 'balance',
        header: 'Bakiye',
        cell: ({ row }) => <div className="font-medium text-foreground">{formatCurrency(row.getValue('balance') || 0)}</div>,
      },
      {
        accessorKey: 'rating',
        header: 'Puan',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{(row.getValue('rating') as number || 0).toFixed(1)}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Menü aç</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/users/${user.id}`} className='flex items-center'>
                    <Eye className="mr-2 h-4 w-4" /> Detay
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.is_active ? (
                  <DropdownMenuItem className="text-destructive">
                    <Ban className="mr-2 h-4 w-4" /> Askıya Al
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" /> Aktif Et
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="email"
      searchPlaceholder="E-posta ile ara..."
      isLoading={loading}
      onRefresh={onRefresh}
    />
  );
}
