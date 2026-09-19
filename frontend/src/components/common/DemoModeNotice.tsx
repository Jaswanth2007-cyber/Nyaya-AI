import React from 'react';
import { Info, Sparkles } from 'lucide-react';

interface DemoModeNoticeProps {
  compact?: boolean;
  className?: string;
}

export const DemoModeNotice: React.FC<DemoModeNoticeProps> = ({
  compact = false,
  className = ''
}) => {
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30 ${className}`}>
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>Demo Mode — Example response. Connect the backend for live AI analysis.</span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs sm:text-sm ${className}`}>
      <div className="p-1 rounded bg-blue-500/20 text-blue-300 shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="space-y-0.5">
        <div className="font-semibold text-blue-300">
          Demo Mode — Example response. Connect the backend for live AI analysis.
        </div>
        <p className="text-blue-200/80 text-xs">
          This sample practice brief demonstrates IRAC framing and moot-court counterargument structure. Live generation will automatically engage when your backend server is online at <code className="px-1 py-0.5 rounded bg-blue-900/60 font-mono text-[11px]">POST /api/generate</code>.
        </p>
      </div>
    </div>
  );
};
