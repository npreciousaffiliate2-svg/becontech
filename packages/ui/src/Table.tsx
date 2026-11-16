import React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { TableSkeleton } from './Skeleton.tsx';
import { EmptyState } from './EmptyState.tsx';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  nowrap?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  isDense?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  toolbarFilters?: React.ReactNode;
  toolbarActions?: React.ReactNode;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display in this list.',
  isDense = false,
  sortColumn,
  sortDirection,
  onSort,
  page = 1,
  totalPages = 1,
  onPageChange,
  totalCount,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  toolbarFilters,
  toolbarActions,
}: TableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={isDense ? 8 : 5} columns={columns.length} />;
  }

  const cellPadding = isDense ? 'py-2 px-3' : 'py-3 px-3.5';

  return (
    <div className="w-full border border-slate-200/90 rounded-[4px] bg-white overflow-hidden shadow-sm flex flex-col">
      {/* ─── Standardized Table Header Toolbar (Search, Filters & Actions) ─── */}
      {(onSearchChange || toolbarFilters || toolbarActions) && (
        <div className="p-3 border-b border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {toolbarFilters}
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onSearchChange && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder || 'Search records...'}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640] transition-colors"
                />
              </div>
            )}
            {toolbarActions}
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/90 uppercase tracking-wider text-[11px] font-semibold text-slate-500 sticky top-0 backdrop-blur-sm">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortColumn === col.key;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      style={{ width: col.width }}
                      className={`${cellPadding} whitespace-nowrap ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100/80' : ''}`}
                      onClick={() => col.sortable && onSort?.(col.key)}
                    >
                      <div
                        className={`inline-flex items-center gap-1 ${
                          col.align === 'right' ? 'justify-end w-full' : ''
                        }`}
                      >
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-slate-400">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#0F7640]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#0F7640]" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/90 font-normal text-slate-800">
              {data.map((item, rowIndex) => (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-slate-50/75 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${cellPadding} ${
                        col.nowrap || col.align === 'right' || col.key === 'action' || col.key === 'actions' || col.key === 'matricNumber' || col.key === 'staffId'
                          ? 'whitespace-nowrap'
                          : ''
                      } ${
                        col.align === 'right'
                          ? 'text-right font-tabular'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(item, rowIndex) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(totalPages > 1 || totalCount !== undefined) && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
          <div>
            {totalCount !== undefined ? (
              <span>Showing {data.length} of {totalCount} records</span>
            ) : (
              <span>Page {page} of {totalPages}</span>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange?.(page - 1)}
                className="p-1 rounded-[4px] border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
                className="p-1 rounded-[4px] border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
