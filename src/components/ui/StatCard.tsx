import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = 'blue',
}: StatCardProps) {
  const iconColors = {
    blue: 'bg-icon-blue-bg text-icon-blue',
    green: 'bg-icon-green-bg text-icon-green',
    yellow: 'bg-icon-yellow-bg text-icon-yellow',
    red: 'bg-icon-red-bg text-icon-red',
    purple: 'bg-icon-purple-bg text-icon-purple',
  };

  return (
    <div className="bg-card rounded-[20px] border border-border p-6 shadow-sm transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-card-foreground">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center">
              <span
                className={clsx(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="ml-2 text-sm text-text-muted">vs last period</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl transition-colors', iconColors[iconColor])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
