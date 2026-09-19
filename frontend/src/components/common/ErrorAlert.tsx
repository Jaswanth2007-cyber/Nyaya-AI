import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onUseFallback?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Request Encountered an Issue',
  message,
  onRetry,
  onUseFallback
}) => {
  return (
    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm space-y-3">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <div className="font-semibold text-rose-300">{title}</div>
          <p className="text-rose-200/90 text-xs sm:text-sm">{message}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-900/50">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Request</span>
          </button>
        )}
        {onUseFallback && (
          <button
            onClick={onUseFallback}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--hairline)] transition-colors"
          >
            <span>Load Demo Example</span>
          </button>
        )}
      </div>
    </div>
  );
};
