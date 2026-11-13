import React from 'react';
import { FileQuestion, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button.tsx';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="rounded-[4px] border border-dashed border-slate-300 p-8 text-center bg-white flex flex-col items-center justify-center">
      <div className="w-10 h-10 rounded-[4px] bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
        {icon || <FileQuestion className="w-5 h-5 text-slate-400" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  correlationId?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred while loading this record',
  message,
  correlationId,
  onRetry,
}) => {
  return (
    <div className="rounded-[4px] border border-rose-200 bg-rose-50/50 p-6 flex flex-col items-center text-center">
      <div className="w-9 h-9 rounded-[4px] bg-rose-100 flex items-center justify-center text-[#F83A20] mb-2.5">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 text-xs text-slate-600 max-w-md">{message}</p>
      {correlationId && (
        <div className="mt-2 text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded-[4px] border border-slate-200">
          Correlation ID: {correlationId}
        </div>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
