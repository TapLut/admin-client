'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

// Column definition
export interface TableColumn<T> {
  key: string;
  header: string | ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

// Table props
interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string | ((item: T, index: number) => string);
  className?: string;
  stickyHeader?: boolean;
  compact?: boolean;
}

// Loading skeleton row
function SkeletonRow({ columns, compact = false }: { columns: number; compact?: boolean }) {
  const padding = compact ? 'py-2 px-2' : 'py-3 px-4';
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className={padding}>
          <div className="h-4 bg-muted rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// Empty state component
function EmptyState({ 
  icon, 
  title = 'No data found', 
  description,
  children 
}: { 
  icon?: ReactNode; 
  title?: string; 
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && (
        <div className="text-text-muted mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-card-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-text-muted text-center max-w-sm mb-4">{description}</p>
      )}
      {children}
    </div>
  );
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingRows = 5,
  emptyState,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRowClick,
  rowClassName,
  className,
  stickyHeader = false,
  compact = false,
}: TableProps<T>) {
  const getRowClassName = (item: T, index: number) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(item, index);
    }
    return rowClassName || '';
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const cellPadding = compact ? 'py-2 px-2' : 'py-3 px-4';
  const headerPadding = compact ? 'py-2 px-2' : 'py-3 px-4';

  // Show empty state
  if (!isLoading && data.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      >
        {emptyAction}
      </EmptyState>
    );
  }

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="w-full">
        <thead className={clsx(stickyHeader && 'sticky top-0 z-10 bg-card')}>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx(
                  headerPadding,
                  'text-xs font-medium text-text-muted uppercase tracking-wider',
                  alignmentClasses[column.align || 'left'],
                  column.width && `w-[${column.width}]`,
                  column.headerClassName
                )}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <SkeletonRow key={i} columns={columns.length} compact={compact} />
            ))
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className={clsx(
                  'hover:bg-table-row-hover transition-colors',
                  onRowClick && 'cursor-pointer',
                  getRowClassName(item, index)
                )}
                onClick={() => onRowClick?.(item, index)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx(
                      cellPadding,
                      'text-sm',
                      alignmentClasses[column.align || 'left'],
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(item, index)
                      : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Helper components for common cell types
export function TableCellText({ 
  text,
  primary, 
  secondary,
  muted = false 
}: { 
  text?: string | ReactNode;
  primary?: string | ReactNode; 
  secondary?: string | ReactNode;
  muted?: boolean;
}) {
  // Simple text mode
  if (text !== undefined) {
    return (
      <span className={clsx('text-sm', muted ? 'text-text-muted' : 'text-card-foreground')}>
        {text}
      </span>
    );
  }
  // Primary/secondary mode
  return (
    <div>
      <p className="font-medium text-card-foreground">{primary}</p>
      {secondary && (
        <p className="text-xs text-text-muted truncate max-w-xs">{secondary}</p>
      )}
    </div>
  );
}

export function TableCellWithIcon({ 
  icon, 
  children,
  title,
  subtitle,
  iconClassName,
  iconBgClass 
}: { 
  icon: ReactNode; 
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  iconClassName?: string;
  iconBgClass?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={clsx('p-2 rounded-lg', iconBgClass || iconClassName || 'bg-muted')}>
        {icon}
      </div>
      <div>
        {title && <p className="font-medium text-text-primary">{title}</p>}
        {subtitle && <p className="text-sm text-text-muted truncate max-w-[200px]">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

interface ActionItem {
  icon: ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
}

export function TableCellActions({ 
  actions,
  children 
}: { 
  actions?: ActionItem[];
  children?: ReactNode;
}) {
  if (children) {
    return (
      <div className="flex items-center gap-1">
        {children}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1">
      {actions?.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          title={action.title}
          className={clsx(
            'p-2 rounded-lg transition-colors hover:bg-muted',
            action.danger ? 'text-danger hover:text-danger' : 'text-text-muted hover:text-text-primary'
          )}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}

export function TableCellLink({ 
  children, 
  onClick 
}: { 
  children: ReactNode; 
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="font-medium text-primary hover:text-primary/80 transition-colors"
    >
      {children}
    </button>
  );
}
