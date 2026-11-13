import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] font-medium leading-tight',
    md: 'px-2 py-0.5 text-xs font-medium leading-normal',
  }[size];

  const variantClasses = {
    primary: 'bg-emerald-50 text-[#0F7640] border border-emerald-200 font-semibold',
    success: 'bg-emerald-50 text-[#13A348] border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-[#F83A20] border border-rose-200',
    neutral: 'bg-slate-50 text-slate-600 border border-slate-200',
  }[variant];

  const dotColor = {
    primary: 'bg-[#0F7640]',
    success: 'bg-[#13A348]',
    warning: 'bg-[#FEC10A]',
    danger: 'bg-[#F83A20]',
    neutral: 'bg-slate-400',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] uppercase tracking-wider select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-[2px] ${dotColor} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
};
