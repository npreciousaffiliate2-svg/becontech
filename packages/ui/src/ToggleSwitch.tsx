import React from 'react';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group outline-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div
        className={`relative w-8 h-4.5 rounded-[4px] border transition-colors shrink-0 ${
          checked ? 'bg-[#0F7640] border-[#0F7640]' : 'bg-slate-200 border-slate-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-[2px] bg-white transition-transform ${
            checked ? 'translate-x-3.5' : 'translate-x-0.5'
          } shadow-xs`}
        />
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
