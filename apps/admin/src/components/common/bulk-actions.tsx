'use client';

import { Download, Trash2, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline';
  onClick: () => void;
}

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  actions?: BulkAction[];
  className?: string;
}

export function BulkActions({
  selectedCount,
  onClearSelection,
  onExportCSV,
  onExportExcel,
  actions = [],
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <Card className={`border-primary ${className}`}>
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedCount} öğe seçildi
          </span>
          <div className="flex items-center gap-2">
            {/* Export buttons */}
            {onExportCSV && (
              <Button size="sm" variant="outline" onClick={onExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            )}
            {onExportExcel && (
              <Button size="sm" variant="outline" onClick={onExportExcel}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            )}

            {/* Custom actions */}
            {actions.length > 0 && actions.length <= 2 && (
              <>
                {actions.map((action) => (
                  <Button
                    key={action.id}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={action.onClick}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </>
            )}

            {/* More actions dropdown for many actions */}
            {actions.length > 2 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="mr-2 h-4 w-4" />
                    İşlemler
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, idx) => (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={action.onClick}
                      className={action.variant === 'destructive' ? 'text-red-600' : ''}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Clear selection */}
            <Button size="sm" variant="ghost" onClick={onClearSelection}>
              Seçimi Temizle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-built action creators
export const createApproveAction = (onApprove: () => void): BulkAction => ({
  id: 'approve',
  label: 'Onayla',
  icon: <CheckCircle className="mr-2 h-4 w-4" />,
  variant: 'default',
  onClick: onApprove,
});

export const createRejectAction = (onReject: () => void): BulkAction => ({
  id: 'reject',
  label: 'Reddet',
  icon: <XCircle className="mr-2 h-4 w-4" />,
  variant: 'outline',
  onClick: onReject,
});

export const createDeleteAction = (onDelete: () => void): BulkAction => ({
  id: 'delete',
  label: 'Sil',
  icon: <Trash2 className="mr-2 h-4 w-4" />,
  variant: 'destructive',
  onClick: onDelete,
});
