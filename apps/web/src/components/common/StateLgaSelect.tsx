import React, { useMemo, useEffect } from 'react';
import { Select } from '@campusone/ui';
import { NIGERIAN_STATES, getLgasForState } from '@campusone/contracts';

export interface StateLgaSelectProps {
  stateValue: string;
  lgaValue: string;
  onStateChange: (state: string) => void;
  onLgaChange: (lga: string) => void;
  stateLabel?: string;
  lgaLabel?: string;
  disabled?: boolean;
  className?: string;
  gridCols?: string;
}

export const StateLgaSelect: React.FC<StateLgaSelectProps> = ({
  stateValue,
  lgaValue,
  onStateChange,
  onLgaChange,
  stateLabel = 'State of Origin',
  lgaLabel = 'Local Government (LGA)',
  disabled = false,
  className = '',
  gridCols = 'grid-cols-1 sm:grid-cols-2',
}) => {
  const stateOptions = useMemo(() => {
    return NIGERIAN_STATES.map((state) => ({
      value: state,
      label: state === 'FCT (Abuja)' ? 'Federal Capital Territory (Abuja)' : `${state} State`,
    }));
  }, []);

  const currentLgas = useMemo(() => {
    return getLgasForState(stateValue);
  }, [stateValue]);

  const lgaOptions = useMemo(() => {
    if (!currentLgas || currentLgas.length === 0) {
      return [{ value: '', label: 'Select State first...' }];
    }
    return currentLgas.map((lga) => ({
      value: lga,
      label: lga,
    }));
  }, [currentLgas]);

  // When state changes, ensure LGA remains valid or falls back to first LGA of new state
  useEffect(() => {
    if (currentLgas.length > 0) {
      const match = currentLgas.find(
        (l) => l.toLowerCase() === (lgaValue || '').trim().toLowerCase()
      );
      if (!match) {
        onLgaChange(currentLgas[0]);
      }
    }
  }, [stateValue, currentLgas, lgaValue, onLgaChange]);

  const handleStateSelect = (newState: string) => {
    onStateChange(newState);
    const newLgas = getLgasForState(newState);
    if (newLgas.length > 0) {
      onLgaChange(newLgas[0]);
    } else {
      onLgaChange('');
    }
  };

  return (
    <div className={`grid ${gridCols} gap-3 ${className}`}>
      <Select
        label={stateLabel}
        options={stateOptions}
        value={stateValue}
        onChange={handleStateSelect}
        searchable={true}
        placeholder="Search Nigerian State..."
        disabled={disabled}
      />
      <Select
        label={lgaLabel}
        options={lgaOptions}
        value={lgaValue}
        onChange={onLgaChange}
        searchable={true}
        placeholder={stateValue ? 'Search LGA...' : 'Select State first...'}
        disabled={disabled || !stateValue || currentLgas.length === 0}
      />
    </div>
  );
};
