import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stat' | 'interactive';
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  header,
  footer,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-[4px] border border-slate-200 bg-white transition-shadow duration-150 ${
        variant === 'interactive' ? 'hover:shadow-sm cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {header && (
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 rounded-b-[4px]">
          {footer}
        </div>
      )}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  secondaryText?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  secondaryText,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div className={`rounded-[4px] border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-[#13A348]' : 'text-[#F83A20]'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {secondaryText && <p className="mt-1 text-xs text-slate-500">{secondaryText}</p>}
    </div>
  );
};
