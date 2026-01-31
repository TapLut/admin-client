import clsx from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-[#B364FF]/10 text-[#B364FF]',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Helper function to get badge variant from status
export function getStatusVariant(status: string | undefined | null): BadgeVariant {
  if (!status) return 'default';
  
  const statusMap: Record<string, BadgeVariant> = {
    active: 'success',
    completed: 'success',
    delivered: 'success',
    approved: 'success',
    pending: 'warning',
    processing: 'warning',
    draft: 'default',
    inactive: 'default',
    cancelled: 'danger',
    rejected: 'danger',
    failed: 'danger',
    scheduled: 'info',
  };

  return statusMap[status.toLowerCase()] || 'default';
}
