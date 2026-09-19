import React, { useState } from 'react';
import { Copy, Download, FileText, Bookmark, Check, Share2 } from 'lucide-react';
import type { CaseInput, IracArgument, Counterargument, LegalExplanation } from '../../types/legal';
import { copyToClipboard, downloadAsTxt, exportAsPdf, generateMarkdownBrief } from '../../utils/exportUtils';

interface ActionToolbarProps {
  input: CaseInput;
  argument?: IracArgument | null;
  counterargument?: Counterargument | null;
  explanation?: LegalExplanation | null;
  isMock?: boolean;
  onSaveSession: () => void;
  isSaved?: boolean;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  input,
  argument,
  counterargument,
  explanation,
  isMock = false,
  onSaveSession,
  isSaved = false,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const handleCopy = async () => {
    const brief = generateMarkdownBrief(input, argument, counterargument, explanation, isMock);
    const success = await copyToClipboard(brief);
    if (success) {
      setCopied(true);
      onShowToast('Practice brief copied to clipboard in formatted Markdown!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownloadTxt = () => {
    const brief = generateMarkdownBrief(input, argument, counterargument, explanation, isMock);
    const safeTitle = input.subject.replace(/[^a-zA-Z0-9]/g, '_');
    downloadAsTxt(`Nayaya_AI_Brief_${safeTitle}.txt`, brief);
    onShowToast('Brief downloaded as TXT file', 'success');
  };

  const handleExportPdf = () => {
    try {
      setExportingPdf(true);
      const safeTitle = input.subject.replace(/[^a-zA-Z0-9]/g, '_');
      exportAsPdf(input, argument, counterargument, explanation, isMock, `Nayaya_AI_${safeTitle}.pdf`);
      onShowToast('Brief exported as formatted PDF', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      onShowToast('Failed to generate PDF export', 'error');
    } finally {
      setExportingPdf(false);
    }
  };

  const hasAnyContent = Boolean(argument || counterargument || explanation);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Share2 className="w-3.5 h-3.5 text-indigo-400" />
        <span>Practice Brief Actions:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={!hasAnyContent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Copy full brief to clipboard in formatted Markdown"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Brief</span>
            </>
          )}
        </button>

        {/* Download TXT */}
        <button
          onClick={handleDownloadTxt}
          disabled={!hasAnyContent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Download as structured plain text"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Download TXT</span>
        </button>

        {/* Export PDF */}
        <button
          onClick={handleExportPdf}
          disabled={!hasAnyContent || exportingPdf}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Export as styled print-ready PDF"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>{exportingPdf ? 'Generating...' : 'Export PDF'}</span>
        </button>

        {/* Save to History Button */}
        <button
          onClick={onSaveSession}
          disabled={!hasAnyContent}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 ${
            isSaved
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Save this case analysis to browser localStorage history"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
          <span>{isSaved ? 'Saved in History' : 'Save Session'}</span>
        </button>
      </div>
    </div>
  );
};
