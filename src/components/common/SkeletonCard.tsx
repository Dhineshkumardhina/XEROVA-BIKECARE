import React from 'react';

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 4, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 bg-surface-container-lowest border border-surface-container-high rounded shadow-xs animate-pulse space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-surface-container-high rounded" />
            <div className="w-6 h-6 rounded bg-surface-container-high" />
          </div>
          <div className="h-6 w-32 bg-surface-container-highest rounded" />
          <div className="h-2.5 w-20 bg-surface-container-low rounded" />
        </div>
      ))}
    </div>
  );
};
