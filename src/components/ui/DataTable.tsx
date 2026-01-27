import { ReactNode } from 'react';
import clsx from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 border-b border-gray-200" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-200 last:border-0">
              <div className="flex items-center h-full px-4 gap-4">
                {columns.map((col, j) => (
                  <div
                    key={j}
                    className="h-4 bg-gray-200 rounded"
                    style={{ width: col.width || '100%' }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
        <div className="h-12 bg-gray-50 border-b border-gray-200" />
        <div className="flex items-center justify-center h-40 text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={clsx(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-gray-50'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                  {column.render
                    ? column.render(item)
                    : (item as Record<string, unknown>)[column.key]?.toString() || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
