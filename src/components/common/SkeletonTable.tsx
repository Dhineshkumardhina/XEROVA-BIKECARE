import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  columnHeaders?: string[];
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 6,
  columnHeaders,
  className = ''
}) => {
  const colCount = columnHeaders ? columnHeaders.length : columns;

  return (
    <div className={`w-full overflow-hidden bg-surface-container-lowest border border-surface-container-high rounded shadow-xs ${className}`}>
      {/* Table Header */}
      <div className="bg-surface-container border-b border-surface-container-high px-3 py-2.5 flex items-center gap-4">
        {columnHeaders ? (
          columnHeaders.map((header, idx) => (
            <div key={idx} className="flex-1 text-[11px] font-bold text-outline uppercase tracking-wider">
              {header}
            </div>
          ))
        ) : (
          Array.from({ length: colCount }).map((_, idx) => (
            <div key={idx} className="flex-1 h-3.5 bg-surface-container-highest rounded animate-pulse" />
          ))
        )}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-surface-container-high">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-3 py-3 flex items-center gap-4 animate-pulse">
            {Array.from({ length: colCount }).map((_, cIdx) => {
              // Vary widths slightly for realistic appearance
              const widthClass =
                cIdx === 0
                  ? 'w-16'
                  : cIdx === 1
                  ? 'flex-2'
                  : cIdx === colCount - 1
                  ? 'w-12'
                  : 'flex-1';
              return (
                <div
                  key={cIdx}
                  className={`h-3 bg-surface-container-high rounded ${widthClass}`}
                  style={{ opacity: 1 - rIdx * 0.12 }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
