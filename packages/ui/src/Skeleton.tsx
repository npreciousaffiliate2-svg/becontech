import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-[4px] ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
        ...style,
      }}
      {...props}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="w-full border border-slate-200 rounded-[4px] overflow-hidden bg-white">
      <div className="border-b border-slate-200 bg-slate-50 p-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`head-${i}`} height="0.875rem" width="70%" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`row-${r}`} className="p-3 grid gap-4 items-center" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={`cell-${r}-${c}`} height="0.875rem" width={c === 0 ? '90%' : '50%'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
