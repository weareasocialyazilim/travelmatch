'use client';

/**
 * KanbanBoard Component
 * TravelMatch Admin Panel - Task/Queue Management
 *
 * Inspired by recruitment board design (Visual 3):
 * - Column-based layout with status indicators
 * - Draggable cards (optional)
 * - Clear visual hierarchy
 * - Action buttons per card
 *
 * Typography:
 * - Column title: 14px semibold
 * - Card title: 14px medium
 * - Card subtitle: 12px regular
 * - Tags: 11px medium
 */

import React, { memo, useMemo, useCallback } from 'react';
import {
  MoreHorizontal,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';

// ============================================
// TYPES
// ============================================
export type KanbanColumnStatus = 'new' | 'in_progress' | 'review' | 'done' | 'rejected';

export interface KanbanTag {
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
}

export interface KanbanCardItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  tags?: KanbanTag[];
  createdAt?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, string | number>;
}

export interface KanbanColumn {
  id: KanbanColumnStatus;
  title: string;
  count: number;
  color: string;
  items: KanbanCardItem[];
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardClick?: (card: KanbanCardItem, column: KanbanColumn) => void;
  onCardAction?: (action: string, card: KanbanCardItem, column: KanbanColumn) => void;
  onAddCard?: (column: KanbanColumn) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// ============================================
// COLUMN STATUS CONFIG
// ============================================
const STATUS_CONFIG: Record<KanbanColumnStatus, {
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}> = {
  new: {
    icon: AlertCircle,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500',
  },
  in_progress: {
    icon: Clock,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500',
  },
  review: {
    icon: Eye,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-500',
  },
  done: {
    icon: CheckCircle2,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500',
  },
  rejected: {
    icon: XCircle,
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-500',
  },
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'border-l-slate-400',
  medium: 'border-l-blue-500',
  high: 'border-l-amber-500',
  urgent: 'border-l-red-500',
};

// ============================================
// KANBAN CARD COMPONENT
// ============================================
interface KanbanCardProps {
  item: KanbanCardItem;
  column: KanbanColumn;
  onCardClick?: (card: KanbanCardItem, column: KanbanColumn) => void;
  onCardAction?: (action: string, card: KanbanCardItem, column: KanbanColumn) => void;
}

const KanbanCard = memo<KanbanCardProps>(({
  item,
  column,
  onCardClick,
  onCardAction
}) => {
  const handleClick = useCallback(() => {
    onCardClick?.(item, column);
  }, [item, column, onCardClick]);

  const handleAction = useCallback((action: string) => {
    onCardAction?.(action, item, column);
  }, [item, column, onCardAction]);

  return (
    <Card
      className={cn(
        'group cursor-pointer border-l-4 transition-all hover:shadow-md',
        item.priority ? PRIORITY_STYLES[item.priority] : 'border-l-transparent',
      )}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        {/* Header with assignee and actions */}
        <div className="mb-2 flex items-start justify-between gap-2">
          {item.assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {item.assignee.avatar && (
                  <AvatarImage src={item.assignee.avatar} alt={item.assignee.name} />
                )}
                <AvatarFallback className="text-[10px]">
                  {item.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-muted-foreground">
                {item.assignee.name}
              </span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAction('view')}>
                Görüntüle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('edit')}>
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('move')}>
                Taşı
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction('delete')}
                className="text-destructive"
              >
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title - 14px medium */}
        <h4 className="mb-1 text-sm font-medium leading-tight">
          {item.title}
        </h4>

        {/* Subtitle - 12px regular */}
        {item.subtitle && (
          <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
            {item.subtitle}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((tag, index) => (
              <Badge
                key={index}
                variant={tag.variant === 'primary' ? 'default' : tag.variant as 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined}
                className="text-[10px] font-medium px-1.5 py-0"
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata row */}
        {item.createdAt && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{item.createdAt}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

KanbanCard.displayName = 'KanbanCard';

// ============================================
// KANBAN COLUMN COMPONENT
// ============================================
interface KanbanColumnProps {
  column: KanbanColumn;
  onCardClick?: (card: KanbanCardItem, column: KanbanColumn) => void;
  onCardAction?: (action: string, card: KanbanCardItem, column: KanbanColumn) => void;
  onAddCard?: (column: KanbanColumn) => void;
}

const KanbanColumnComponent = memo<KanbanColumnProps>(({
  column,
  onCardClick,
  onCardAction,
  onAddCard
}) => {
  const statusConfig = STATUS_CONFIG[column.id] || STATUS_CONFIG.new;
  const StatusIcon = statusConfig.icon;

  const handleAddCard = useCallback(() => {
    onAddCard?.(column);
  }, [column, onAddCard]);

  return (
    <div className="flex w-72 flex-shrink-0 flex-col">
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Status indicator dot */}
          <div className={cn('h-2 w-2 rounded-full', statusConfig.bgClass)} />

          {/* Title - 14px semibold */}
          <h3 className="text-sm font-semibold">{column.title}</h3>

          {/* Count badge */}
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium">
            {column.count}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleAddCard}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg bg-muted/30 p-2">
        {column.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <StatusIcon className={cn('mb-2 h-8 w-8 opacity-50', statusConfig.colorClass)} />
            <p className="text-xs text-muted-foreground">Bu kolonda öğe yok</p>
          </div>
        ) : (
          column.items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              column={column}
              onCardClick={onCardClick}
              onCardAction={onCardAction}
            />
          ))
        )}
      </div>
    </div>
  );
});

KanbanColumnComponent.displayName = 'KanbanColumn';

// ============================================
// MAIN KANBAN BOARD COMPONENT
// ============================================
export const KanbanBoard = memo<KanbanBoardProps>(({
  columns,
  onCardClick,
  onCardAction,
  onAddCard,
  loading = false,
  emptyMessage = 'Görüntülenecek görev yok',
}) => {
  // Calculate total items
  const totalItems = useMemo(() =>
    columns.reduce((sum, col) => sum + col.count, 0),
    [columns]
  );

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-72 flex-shrink-0">
            <div className="mb-3 h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="space-y-2 rounded-lg bg-muted/30 p-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (columns.length === 0 || totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          onCardClick={onCardClick}
          onCardAction={onCardAction}
          onAddCard={onAddCard}
        />
      ))}
    </div>
  );
});

KanbanBoard.displayName = 'KanbanBoard';

// ============================================
// EXPORTS
// ============================================
export { KanbanCard, KanbanColumnComponent as KanbanColumn };
