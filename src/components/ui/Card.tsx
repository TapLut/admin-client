import clsx from 'clsx';
import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: CSSProperties;
  hoverEffect?: boolean;
}

export function Card({ className, children, padding = 'md', style, hoverEffect = false }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-10',
  };

  return (
    <div
      className={clsx(
        'bg-white dark:bg-slate-900 border-none shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)] rounded-[24px] transition-all duration-300',
        hoverEffect && 'hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]',
        paddings[padding],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-[#8E8EA0] mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
