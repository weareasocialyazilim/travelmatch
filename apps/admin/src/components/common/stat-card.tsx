import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  change,
  changeLabel,
  className,
}: StatCardProps) {
  const isPositiveChange = change !== undefined && change >= 0;

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          {Icon && (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                iconBgColor
              )}
            >
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {change !== undefined && (
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    isPositiveChange ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {isPositiveChange ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {isPositiveChange ? '+' : ''}
                    {change}%
                  </span>
                </div>
              )}
            </div>
            {changeLabel && (
              <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
