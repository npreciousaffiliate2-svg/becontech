import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  avatarUrl?: string;
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

function getInitials(label: string): string {
  const cleaned = label
    .replace(/^(Dr\.|Pharm\.|Prof\.|Mrs\.|Mr\.|Ms\.|Miss|Nurse|Sanitarian|Chief)\s+/i, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'C1';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchable,
  disabled = false,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: -9999,
    left: -9999,
    visibility: 'hidden',
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enable search by default whenever there are 3 or more options, unless explicitly disabled
  const isSearchable = searchable !== undefined ? searchable : options.length >= 3;

  const selectedOption = options.find((opt) => opt.value === value);

  const computeMenuPosition = React.useCallback((): React.CSSProperties => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return { position: 'fixed', top: -9999, left: -9999, visibility: 'hidden' };
    }
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 250 && rect.top > 250;
    const margin = 8;
    const width = Math.min(Math.max(rect.width, 260), window.innerWidth - margin * 2);
    let left = rect.left;
    if (left + width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - margin - width);
    }
    return {
      position: 'fixed',
      left: Math.round(left),
      width: Math.round(width),
      maxWidth: window.innerWidth - margin * 2,
      zIndex: 10000,
      top: Math.round(openUp ? rect.top - 4 : rect.bottom + 4),
      transform: openUp ? 'translateY(-100%)' : undefined,
      visibility: 'visible',
    };
  }, []);

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
      setMenuStyle(computeMenuPosition());
    };
    update();
    const rafId = window.requestAnimationFrame(() => {
      if (isSearchable && searchInputRef.current) {
        searchInputRef.current.focus({ preventScroll: true });
      }
    });
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen, isSearchable, computeMenuPosition]);

  const filteredOptions = isSearchable && searchQuery.trim()
    ? options.filter((opt) => {
        const haystack = `${opt.label} ${opt.value} ${opt.description || ''}`.toLowerCase();
        return searchQuery
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .every((term) => haystack.includes(term));
      })
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
        onClick={() => {
          if (disabled) return;
          if (!isOpen) {
            setMenuStyle(computeMenuPosition());
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }}
        className={`w-full h-9 rounded-[4px] border px-3 flex items-center justify-between gap-2 text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7640] focus-visible:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
          error ? 'border-[#F83A20]' : 'border-slate-300 hover:border-slate-400 bg-white'
        } ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selectedOption?.avatarUrl && (
            <img
              src={selectedOption.avatarUrl}
              alt=""
              className="w-5 h-5 rounded-[3px] object-cover shrink-0 border border-slate-200"
            />
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
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
            className="rounded-[4px] border border-slate-200 bg-white overflow-x-hidden max-h-64 flex flex-col shadow-md font-sans"
            style={menuStyle}
          >
            {isSearchable && (
              <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search options..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
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
                      className={`w-full min-w-0 px-2.5 py-1.5 text-left text-xs rounded-[4px] flex items-center justify-between gap-2 transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 text-[#0F7640] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {opt.avatarUrl !== undefined && (
                          opt.avatarUrl ? (
                            <img
                              src={opt.avatarUrl}
                              alt=""
                              className="w-6 h-6 rounded-[3px] object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <span className="w-6 h-6 rounded-[3px] bg-emerald-100 text-[#0F7640] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {getInitials(opt.label)}
                            </span>
                          )
                        )}
                        <div className="min-w-0">
                          <div className="whitespace-normal break-words">{opt.label}</div>
                          {opt.description && (
                            <div className="text-[10px] text-slate-400 whitespace-normal break-words">
                              {opt.description}
                            </div>
                          )}
                        </div>
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
