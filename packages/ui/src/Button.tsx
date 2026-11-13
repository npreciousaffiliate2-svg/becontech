import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0F7640] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none text-sm';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs h-7 gap-1.5',
    md: 'px-3.5 py-1.5 text-sm h-9 gap-2',
    lg: 'px-5 py-2 text-base h-11 gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-[#0F7640] hover:bg-[#0C6335] text-white active:bg-[#094D29] shadow-sm',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 active:bg-slate-100 shadow-sm',
    danger: 'bg-[#F83A20] hover:bg-[#de2e16] text-white active:bg-[#c2240f]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
