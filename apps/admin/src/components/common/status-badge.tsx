import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  default: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
};

// Auto-detect variant based on common status values
function getVariantFromStatus(status: string): StatusVariant {
  const statusLower = status.toLowerCase();

  if (['active', 'completed', 'approved', 'verified', 'success', 'resolved'].includes(statusLower)) {
    return 'success';
  }
  if (['pending', 'waiting', 'processing', 'scheduled', 'draft'].includes(statusLower)) {
    return 'warning';
  }
  if (['banned', 'rejected', 'failed', 'cancelled', 'error', 'critical'].includes(statusLower)) {
    return 'error';
  }
  if (['in_progress', 'reviewing', 'assigned'].includes(statusLower)) {
    return 'info';
  }

  return 'default';
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const finalVariant = variant || getVariantFromStatus(status);

  return (
    <Badge
      variant="outline"
      className={cn('border-transparent font-medium', variantStyles[finalVariant], className)}
    >
      {status}
    </Badge>
  );
}
