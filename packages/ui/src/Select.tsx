import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 230 && rect.top > 230;
      const margin = 8;
      const width = Math.min(Math.max(rect.width, 260), window.innerWidth - margin * 2);
      let left = rect.left;
      if (left + width > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - margin - width);
      }
      setMenuStyle({
        position: 'fixed',
        left,
        width,
        maxWidth: window.innerWidth - margin * 2,
        zIndex: 10000,
        top: openUp ? rect.top - 4 : rect.bottom + 4,
        transform: openUp ? 'translateY(-100%)' : undefined,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen]);

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
        className={`w-full h-9 rounded-[4px] border px-3 flex items-center justify-between text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7640] focus-visible:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
          error ? 'border-[#F83A20]' : 'border-slate-300 hover:border-slate-400 bg-white'
        } ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#0F7640]' : ''
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
        <div
          ref={menuRef}
          className="rounded-[4px] border border-slate-200 bg-white overflow-x-hidden max-h-60 flex flex-col shadow-md"
          style={menuStyle}
        >
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
          <div className="overflow-y-auto overflow-x-hidden divide-y divide-slate-50 p-1">
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
                    className={`w-full min-w-0 px-2.5 py-1.5 text-left text-xs rounded-[4px] flex items-start justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-[#0F7640] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="whitespace-normal break-words">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[10px] text-slate-400 whitespace-normal break-words">{opt.description}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0F7640] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
        )}
      {error && <p className="text-xs text-[#F83A20] font-medium">{error}</p>}
    </div>
  );
};
