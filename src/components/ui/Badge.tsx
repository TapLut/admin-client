import clsx from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
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
