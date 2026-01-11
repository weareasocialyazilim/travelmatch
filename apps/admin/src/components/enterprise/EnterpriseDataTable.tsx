'use client';

/**
 * Enterprise Data Table
 * Inspired by: Airtable, Notion, Linear, Stripe
 *
 * Features:
 * - Clean, scannable rows
 * - Sortable columns
 * - Row selection
 * - Loading states
 * - Empty states
 * - Pagination
 */

import { ReactNode, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface EnterpriseDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  actions?: ReactNode;
  emptyState?: ReactNode;
  className?: string;
  rowKey: keyof T;
}

export function EnterpriseDataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Ara...',
  selectable = false,
  onRowClick,
  onSelectionChange,
  pagination,
  actions,
  emptyState,
  className,
  rowKey,
}: EnterpriseDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<unknown>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle row selection
  const toggleRowSelection = (row: T) => {
    const newSelected = new Set(selectedRows);
    const key = row[rowKey];
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter((r) => newSelected.has(r[rowKey])));
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allKeys = new Set(data.map((r) => r[rowKey]));
      setSelectedRows(allKeys);
      onSelectionChange?.(data);
    }
  };

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Filter and sort data
  let displayData = [...data];

  // Sort
  if (sortColumn) {
    const column = columns.find((c) => c.id === sortColumn);
    if (column?.accessorKey) {
      displayData.sort((a, b) => {
        const aVal = a[column.accessorKey as keyof T];
        const bVal = b[column.accessorKey as keyof T];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800',
        'overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {/* Search */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 w-64 h-9 text-sm"
              />
            </div>
          )}

          {/* Selection info */}
          {selectable && selectedRows.size > 0 && (
            <span className="text-sm text-gray-500">
              {selectedRows.size} secili
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions}
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrele
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Indir
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={selectedRows.size === data.length && data.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <span className="inline-flex items-center gap-1">
                    {column.header}
                    {column.sortable && (
                      <span className="text-gray-300 dark:text-gray-600">
                        {sortColumn === column.id ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center"
                >
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12"
                >
                  {emptyState || (
                    <div className="text-center text-gray-500">
                      Veri bulunamadi
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              displayData.map((row) => (
                <tr
                  key={String(row[rowKey])}
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors',
                    onRowClick && 'cursor-pointer',
                    selectedRows.has(row[rowKey]) && 'bg-violet-50 dark:bg-violet-950/30'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="w-12 px-4 py-3">
                      <Checkbox
                        checked={selectedRows.has(row[rowKey])}
                        onCheckedChange={() => toggleRowSelection(row)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.cell
                        ? column.cell(row)
                        : column.accessorKey
                          ? String(row[column.accessorKey] ?? '')
                          : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-500">
            {(pagination.page - 1) * pagination.pageSize + 1} -{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} /{' '}
            {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
