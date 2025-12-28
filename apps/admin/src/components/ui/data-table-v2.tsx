'use client';

/**
 * TravelMatch Admin Data Table V2
 * "Cinematic Travel + Trust Jewelry" Design
 *
 * A reusable data table with sorting, filtering, and pagination
 */

import { useState, ReactNode } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  RefreshCw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => ReactNode;
}

export interface DataTableV2Props<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  actions?: {
    label: string;
    icon?: ReactNode;
    onClick: (item: T) => void;
    variant?: 'default' | 'danger';
  }[];
  bulkActions?: {
    label: string;
    icon?: ReactNode;
    onClick: (selectedItems: T[]) => void;
  }[];
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTableV2<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Ara...',
  searchKey,
  onRowClick,
  selectable = false,
  onSelectionChange,
  actions,
  bulkActions,
  pageSize: initialPageSize = 10,
  loading = false,
  emptyMessage = 'Veri bulunamadı',
  onRefresh,
  onExport,
  onFilter,
}: DataTableV2Props<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter data by search
  const filteredData = searchKey
    ? data.filter((item) => {
        const value = item[searchKey];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(search.toLowerCase());
        }
        return true;
      })
    : data;

  // Sort data
  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey];
        const bVal = (b as Record<string, unknown>)[sortKey];
        if (sortDirection === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      })
    : filteredData;

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedData.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
    onSelectionChange?.(checked ? paginatedData : []);
  };

  const handleSelectRow = (item: T, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(item.id);
    } else {
      newSelected.delete(item.id);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(data.filter((d) => newSelected.has(d.id)));
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const isAllSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          {/* Bulk Actions */}
          {selectable && selectedIds.size > 0 && bulkActions && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} seçili
              </span>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => action.onClick(data.filter((d) => selectedIds.has(d.id)))}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onFilter && (
            <Button variant="outline" size="sm" onClick={onFilter}>
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          )}
          {onRefresh && (
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="admin-table">
          <thead className="admin-table-header">
            <tr>
              {selectable && (
                <th className="admin-table-header-cell w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Tümünü seç"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={cn(
                    'admin-table-header-cell',
                    column.sortable && 'cursor-pointer select-none hover:bg-muted/50'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key as string)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && <SortIcon columnKey={column.key as string} />}
                  </div>
                </th>
              ))}
              {actions && <th className="admin-table-header-cell w-12"></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={index} className="admin-table-row">
                  {selectable && (
                    <td className="admin-table-cell">
                      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key as string} className="admin-table-cell">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                  {actions && (
                    <td className="admin-table-cell">
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    </td>
                  )}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="admin-table-cell text-center py-12"
                >
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              // Data rows
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    'admin-table-row',
                    onRowClick && 'cursor-pointer',
                    selectedIds.has(item.id) && 'bg-primary/5'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="admin-table-cell" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(checked) => handleSelectRow(item, checked as boolean)}
                        aria-label="Satırı seç"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key as string} className="admin-table-cell">
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[column.key as string] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="admin-table-cell" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => action.onClick(item)}
                              className={action.variant === 'danger' ? 'text-destructive' : ''}
                            >
                              {action.icon}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {sortedData.length} sonuçtan {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, sortedData.length)} arası gösteriliyor
          </p>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
