import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchable = false,
  disabled = false,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  return (
    <div className={`w-full space-y-1 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-9 rounded-[4px] border px-3 flex items-center justify-between text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0A77FE] focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
          error ? 'border-[#F83A20]' : 'border-slate-300 hover:border-slate-400 bg-white'
        } ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#0A77FE]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-[4px] border border-slate-200 bg-white shadow-lg overflow-hidden max-h-60 flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                autoFocus
              />
            </div>
          )}
          <div className="overflow-y-auto divide-y divide-slate-50 p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">No matching options</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-2.5 py-1.5 text-left text-xs rounded-[4px] flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-[#0A77FE] font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[10px] text-slate-400">{opt.description}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0A77FE] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-[#F83A20] font-medium">{error}</p>}
    </div>
  );
};
