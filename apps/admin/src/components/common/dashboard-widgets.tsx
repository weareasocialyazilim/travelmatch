'use client';

/**
 * TravelMatch Admin Dashboard Widgets
 * Tranzacta dashboard tasarımından ilham alınmıştır.
 */

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Send,
  MoreHorizontal,
  Info,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ═══════════════════════════════════════════════════════════════════
// FINANCIAL CARD
// ═══════════════════════════════════════════════════════════════════
interface FinancialCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  barData?: number[];
  variant?: 'default' | 'income' | 'expense' | 'savings';
  className?: string;
}

export function FinancialCard({
  title,
  value,
  change,
  changeLabel = 'geçen haftaya göre',
  barData = [],
  variant = 'default',
  className,
}: FinancialCardProps) {
  const maxBar = Math.max(...barData, 1);

  const cardClass = {
    default: 'stat-card-chart',
    income: 'stat-card-chart stat-card-chart-income',
    expense: 'stat-card-chart stat-card-chart-expense',
    savings: 'stat-card-chart stat-card-chart-savings',
  }[variant];

  const barClass = {
    default: 'bar-chart-bar',
    income: 'bar-chart-bar bar-chart-bar-emerald',
    expense: 'bar-chart-bar bar-chart-bar-magenta',
    savings: 'bar-chart-bar bar-chart-bar-amber',
  }[variant];

  return (
    <div className={cn(cardClass, className)}>
      <div>
        <p className="text-white/60 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-400" />
            )}
            <span
              className={cn(
                'text-xs',
                change >= 0 ? 'text-emerald-400' : 'text-rose-400',
              )}
            >
              {change >= 0 ? '+' : ''}
              {change}%
            </span>
            <span className="text-white/40 text-xs">{changeLabel}</span>
          </div>
        )}
      </div>

      {barData.length > 0 && (
        <div className="bar-chart-grid">
          {barData.map((val, i) => (
            <div
              key={i}
              className={barClass}
              style={{ height: `${(val / maxBar) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CREDIT CARD WIDGET
// ═══════════════════════════════════════════════════════════════════
interface CreditCardWidgetProps {
  balance: string;
  cardNumber: string;
  cardHolder: string;
  className?: string;
}

export function CreditCardWidget({
  balance,
  cardNumber,
  cardHolder,
  className,
}: CreditCardWidgetProps) {
  const masked = `•••• •••• •••• ${cardNumber.slice(-4)}`;

  return (
    <div className={cn('card-widget', className)}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <CreditCard className="w-6 h-6 text-white/60" />
          <p className="text-xl font-bold">{balance}</p>
        </div>
        <p className="card-widget-number">{masked}</p>
        <div className="flex justify-between text-xs">
          <div>
            <p className="text-white/40 uppercase">Kart Sahibi</p>
            <p className="text-white font-medium">{cardHolder}</p>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <div className="w-4 h-4 rounded-full bg-amber-500 -ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// QUICK TRANSFER WIDGET
// ═══════════════════════════════════════════════════════════════════
interface Recipient {
  id: string;
  name: string;
  avatar: string;
}

interface QuickTransferWidgetProps {
  recipients?: Recipient[];
  onTransfer?: (amount: string, recipientId: string) => void;
  className?: string;
}

export function QuickTransferWidget({
  recipients = [],
  onTransfer,
  className,
}: QuickTransferWidgetProps) {
  const [amount, setAmount] = React.useState('');
  const [selectedId, setSelectedId] = React.useState(recipients[0]?.id || '');

  return (
    <Card className={cn('transfer-widget', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Hızlı Transfer</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipients.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recipients.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all',
                  selectedId === r.id
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'hover:bg-muted/50',
                )}
              >
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-xs text-muted-foreground">
                  {r.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground mb-1">Tutar</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₺
            </span>
            <Input
              type="text"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAmount(e.target.value)
              }
              className="transfer-input pl-8"
              placeholder="0.00"
            />
          </div>
        </div>

        <Button
          className="transfer-button w-full"
          onClick={() => onTransfer?.(amount, selectedId)}
        >
          <Send className="w-4 h-4 mr-2" />
          Gönder
        </Button>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DAILY LIMIT WIDGET
// ═══════════════════════════════════════════════════════════════════
interface DailyLimitWidgetProps {
  used: number;
  limit: number;
  currency?: string;
  className?: string;
}

export function DailyLimitWidget({
  used,
  limit,
  currency = '₺',
  className,
}: DailyLimitWidgetProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const remaining = limit - used;

  let fillClass = 'daily-limit-fill';
  if (percentage > 80) fillClass += ' daily-limit-fill-danger';
  else if (percentage > 60) fillClass += ' daily-limit-fill-warning';

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Günlük Limit</CardTitle>
          <span className="text-sm text-muted-foreground">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="daily-limit-bar">
          <div className={fillClass} style={{ width: `${percentage}%` }} />
        </div>
        <div className="flex justify-between mt-3 text-sm">
          <span className="text-muted-foreground">
            Kullanılan:{' '}
            <span className="text-foreground font-medium">
              {currency}
              {used.toLocaleString()}
            </span>
          </span>
          <span className="text-muted-foreground">
            Kalan:{' '}
            <span className="text-emerald-500 font-medium">
              {currency}
              {remaining.toLocaleString()}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// NOTIFICATION PANEL
// ═══════════════════════════════════════════════════════════════════
type NotificationType = 'info' | 'warning' | 'error' | 'success';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  time: string;
  read?: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onNotificationClick?: (id: string) => void;
  className?: string;
}

export function NotificationPanel({
  notifications,
  tabs = [
    { id: 'all', label: 'Tümü' },
    { id: 'unread', label: 'Okunmamış' },
  ],
  activeTab = 'all',
  onTabChange,
  onNotificationClick,
  className,
}: NotificationPanelProps) {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className={cn('notification-panel', className)}>
      <div className="notification-panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'notification-panel-tab',
              activeTab === tab.id && 'notification-panel-tab-active',
            )}
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Bildirim yok</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'notification-item',
                !n.read && 'notification-item-unread',
              )}
              onClick={() => onNotificationClick?.(n.id)}
            >
              <div className={`notification-dot notification-dot-${n.type}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {getIcon(n.type)}
                  <span className="font-medium text-sm truncate">
                    {n.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {n.description}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {n.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TREND INDICATOR
// ═══════════════════════════════════════════════════════════════════
interface TrendIndicatorProps {
  title: string;
  value: string;
  trend: number;
  sparkline?: number[];
  className?: string;
}

export function TrendIndicator({
  title,
  value,
  trend,
  sparkline = [],
  className,
}: TrendIndicatorProps) {
  const maxVal = Math.max(...sparkline, 1);

  return (
    <Card className={cn('p-4', className)}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold">{value}</p>
        <div
          className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            trend >= 0 ? 'text-emerald-500' : 'text-rose-500',
          )}
        >
          {trend >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(trend)}%
        </div>
      </div>

      {sparkline.length > 0 && (
        <div className="flex items-end gap-0.5 h-10 mt-3">
          {sparkline.map((val, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-primary/30"
              style={{ height: `${(val / maxVal) * 100}%` }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
