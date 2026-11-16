import React from 'react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  id,
}) => {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className={`inline-flex items-start gap-2.5 cursor-pointer select-none group outline-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      id={id}
    >
      <div
        className={`w-4 h-4 mt-0.5 rounded-[4px] border flex items-center justify-center transition-colors focus:ring-2 focus:ring-[#0F7640] focus:ring-offset-1 shrink-0 ${
          checked
            ? 'bg-[#0F7640] border-[#0F7640] text-white shadow-xs'
            : 'bg-white border-slate-300 group-hover:border-slate-400'
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
