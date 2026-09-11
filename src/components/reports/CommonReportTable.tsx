import React, { useState, useMemo } from 'react';
import { formatINR } from '../../utils/formatters';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: (row: T) => any;
  cell?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isNumeric?: boolean;
  formatAsINR?: boolean;
  totalable?: boolean;
}

export interface PresetFilter {
  id: string;
  label: string;
  description?: string;
}

interface CommonReportTableProps<T> {
  title: string;
  subtitle?: string;
  columns: ColumnDef<T>[];
  data: T[];
  filterPresets?: PresetFilter[];
  activePreset?: string;
  onSelectPreset?: (presetId: string) => void;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  exportFileName?: string;
  additionalActions?: React.ReactNode;
}

export function CommonReportTable<T extends { id?: string | number }>({
  title,
  subtitle,
  columns,
  data,
  filterPresets,
  activePreset,
  onSelectPreset,
  searchPlaceholder = 'Search records...',
  onRowClick,
  isLoading = false,
  error = null,
  onRefresh,
  exportFileName = 'report-export',
  additionalActions
}: CommonReportTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(columns.map(c => c.id));
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  // Column visibility toggle
  const toggleColumnVisibility = (colId: string) => {
    if (visibleColumnIds.includes(colId)) {
      if (visibleColumnIds.length <= 2) return; // Keep at least 2 columns
      setVisibleColumnIds(visibleColumnIds.filter(id => id !== colId));
    } else {
      setVisibleColumnIds([...visibleColumnIds, colId]);
    }
  };

  // Filtered Columns
  const activeColumns = useMemo(() => {
    return columns.filter(c => visibleColumnIds.includes(c.id));
  }, [columns, visibleColumnIds]);

  // Filtering data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => {
      return columns.some(col => {
        const val = col.accessor(row);
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, columns]);

  // Sorting data
  const sortedData = useMemo(() => {
    if (!sortColumnId) return filteredData;
    const activeCol = columns.find(c => c.id === sortColumnId);
    if (!activeCol) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = activeCol.accessor(a);
      const valB = activeCol.accessor(b);

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortColumnId, sortDirection, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (colId: string) => {
    if (sortColumnId === colId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumnId(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumnId(colId);
      setSortDirection('asc');
    }
  };

  // Column Totals Calculation
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    activeColumns.forEach(col => {
      if (col.totalable) {
        let sum = 0;
        filteredData.forEach(row => {
          const val = Number(col.accessor(row));
          if (!isNaN(val)) sum += val;
        });
        totals[col.id] = sum;
      }
    });
    return totals;
  }, [activeColumns, filteredData]);

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = activeColumns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
      const rows = sortedData.map(row => {
        return activeColumns
          .map(col => {
            const val = col.accessor(row);
            return `"${String(val ?? '').replace(/"/g, '""')}"`;
          })
          .join(',');
      });
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${exportFileName}-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('CSV export could not be completed. Please retry.');
    }
  };

  // Print Table
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden flex flex-col w-full text-xs">
      {/* Top Toolbar */}
      <div className="p-3 border-b border-surface-container-high bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="font-headline-sm text-sm font-bold text-on-surface">{title}</h2>
          {subtitle && <p className="text-outline text-[11px] mt-0.5">{subtitle}</p>}
        </div>

        {/* Action Controls & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-outline">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-7 pr-7 py-1.5 bg-surface-container-lowest border border-surface-container-high rounded text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          {/* Column Visibility Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
              className="px-2.5 py-1.5 rounded bg-surface-container border border-surface-container-high hover:bg-surface-container-high text-on-surface font-semibold flex items-center gap-1 transition-colors"
              title="Toggle Columns Visibility"
            >
              <span className="material-symbols-outlined text-[16px]">view_column</span>
              <span className="hidden sm:inline">Columns</span>
            </button>
            {isColumnPickerOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-lowest border border-surface-container-high rounded shadow-lg p-2 z-30 space-y-1">
                <div className="text-[10px] font-bold text-outline uppercase pb-1 border-b border-surface-container-high">
                  Show / Hide Columns
                </div>
                <div className="max-h-52 overflow-y-auto space-y-1 pt-1">
                  {columns.map(col => (
                    <label key={col.id} className="flex items-center gap-2 p-1 hover:bg-surface-container rounded cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={visibleColumnIds.includes(col.id)}
                        onChange={() => toggleColumnVisibility(col.id)}
                        className="rounded text-secondary focus:ring-0"
                      />
                      <span className="truncate">{col.header}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export & Print */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded bg-surface-container border border-surface-container-high hover:bg-surface-container-high text-on-surface font-semibold flex items-center gap-1 transition-colors"
            title="Export Table as CSV/Excel"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1.5 rounded bg-surface-container border border-surface-container-high hover:bg-surface-container-high text-on-surface font-semibold flex items-center gap-1 transition-colors"
            title="Print Table"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span className="hidden sm:inline">Print</span>
          </button>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded bg-surface-container border border-surface-container-high hover:bg-surface-container-high text-on-surface transition-colors"
              title="Refresh Data"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          )}

          {additionalActions}
        </div>
      </div>

      {/* Filter Presets Pills Bar (if provided) */}
      {filterPresets && filterPresets.length > 0 && onSelectPreset && (
        <div className="px-3 py-2 bg-surface-container-lowest border-b border-surface-container-high flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-outline uppercase mr-1">Presets:</span>
          {filterPresets.map(preset => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectPreset(preset.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Table View */}
      <div className="overflow-x-auto relative min-h-[160px]">
        {isLoading && (
          <div className="absolute inset-0 bg-surface-container-lowest/80 z-20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-secondary text-2xl">sync</span>
            <span className="font-semibold text-on-surface text-xs">Loading enterprise report dataset...</span>
          </div>
        )}

        {error && (
          <div className="p-8 text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-error">error</span>
            <div className="font-bold text-on-surface">Unable to load report</div>
            <p className="text-xs text-outline">{error}</p>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="mt-2 px-3 py-1 bg-secondary text-on-secondary rounded text-xs font-bold"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && paginatedData.length === 0 && (
          <div className="p-10 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
            <div className="font-bold text-on-surface">No records match current filters</div>
            <p className="text-xs text-outline">Try clearing search keywords or selecting a broader date range preset.</p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {!error && paginatedData.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container sticky top-0 z-10 font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-surface-container-high select-none">
              <tr>
                {activeColumns.map(col => {
                  const isSorted = sortColumnId === col.id;
                  return (
                    <th
                      key={col.id}
                      style={{ width: col.width }}
                      onClick={() => handleSort(col.id)}
                      className={`py-2 px-3 font-bold cursor-pointer hover:bg-surface-container-high transition-colors ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                        <span>{col.header}</span>
                        {isSorted ? (
                          <span className="material-symbols-outlined text-[14px] text-secondary font-bold">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[12px] text-outline opacity-30">
                            unfold_more
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {paginatedData.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-surface-container-low' : 'hover:bg-surface-container-lowest'
                  }`}
                >
                  {activeColumns.map(col => {
                    const rawVal = col.accessor(row);
                    return (
                      <td
                        key={col.id}
                        className={`py-2 px-3 ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {col.cell ? (
                          col.cell(row)
                        ) : col.formatAsINR ? (
                          <span className="font-mono font-semibold">{formatINR(rawVal)}</span>
                        ) : col.isNumeric ? (
                          <span className="font-mono">{rawVal}</span>
                        ) : (
                          <span>{rawVal ?? '-'}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {/* Totals Summary Row at Bottom */}
            {Object.keys(columnTotals).length > 0 && (
              <tfoot className="bg-surface-container font-bold border-t-2 border-surface-container-high">
                <tr>
                  {activeColumns.map((col, idx) => {
                    const hasTotal = col.totalable && columnTotals[col.id] !== undefined;
                    return (
                      <td
                        key={col.id}
                        className={`py-2 px-3 ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {idx === 0 && !hasTotal ? (
                          <span className="text-outline uppercase text-[10px] tracking-wider">Filtered Total</span>
                        ) : hasTotal ? (
                          <span className="font-mono text-secondary">
                            {col.formatAsINR ? formatINR(columnTotals[col.id]) : columnTotals[col.id]}
                          </span>
                        ) : (
                          ''
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      {/* Pagination & Footer Information */}
      {!error && sortedData.length > 0 && (
        <div className="p-2.5 border-t border-surface-container-high bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="text-outline">
            Showing <span className="font-bold text-on-surface">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-on-surface">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{' '}
            <span className="font-bold text-on-surface">{sortedData.length}</span> records
            {searchTerm && <span> (filtered from {data.length} total)</span>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-outline">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-surface-container-lowest border border-surface-container-high rounded px-1.5 py-0.5 text-xs text-on-surface focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-1 rounded hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent"
                title="First Page"
              >
                <span className="material-symbols-outlined text-[16px]">first_page</span>
              </button>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent"
                title="Previous Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <span className="px-2 font-mono font-bold text-on-surface">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent"
                title="Next Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-1 rounded hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent"
                title="Last Page"
              >
                <span className="material-symbols-outlined text-[16px]">last_page</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
