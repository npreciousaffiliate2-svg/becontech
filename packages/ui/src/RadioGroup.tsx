import React from 'react';

export interface RadioOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
  badge?: string;
}

export interface RadioGroupProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  label?: string;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  className?: string;
}

export const RadioGroup = <T extends string = string>({
  value,
  onChange,
  options,
  label,
  orientation = 'horizontal',
  disabled = false,
  className = '',
}: RadioGroupProps<T>) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div
        className={`flex ${
          orientation === 'horizontal' ? 'flex-wrap items-center gap-4' : 'flex-col gap-2'
        }`}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <div
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              tabIndex={disabled ? -1 : 0}
              onClick={() => !disabled && onChange(option.value)}
              onKeyDown={(e) => {
                if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
                  e.preventDefault();
                  onChange(option.value);
                }
              }}
              className={`inline-flex items-center gap-2 cursor-pointer select-none group outline-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${
                  isSelected
                    ? 'border-[#0F7640] bg-white ring-1 ring-[#0F7640]'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-[2px] bg-[#0F7640]" />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs ${
                    isSelected ? 'font-bold text-[#0F7640]' : 'font-medium text-slate-700'
                  }`}
                >
                  {option.label}
                </span>
                {option.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-slate-100 text-slate-600">
                    {option.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
