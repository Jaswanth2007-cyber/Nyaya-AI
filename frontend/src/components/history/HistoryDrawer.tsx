import React, { useState } from 'react';
import type { CaseSession } from '../../types/legal';
import { SubjectBadge, JurisdictionBadge } from '../common/Badge';
import { formatDate, truncate } from '../../utils/formatting';
import {
  X,
  History,
  Trash2,
  Download,
  Search,
  CheckCircle2
} from 'lucide-react';
import { exportAsPdf } from '../../utils/exportUtils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: CaseSession[];
  onSelectSession: (session: CaseSession) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = sessions.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.input.subject.toLowerCase().includes(q) ||
      s.input.jurisdiction.toLowerCase().includes(q) ||
      s.input.issue.toLowerCase().includes(q) ||
      s.input.facts.toLowerCase().includes(q)
    );
  });

  const handleExportSessionPdf = (e: React.MouseEvent, session: CaseSession) => {
    e.stopPropagation();
    try {
      const safeTitle = session.input.subject.replace(/[^a-zA-Z0-9]/g, '_');
      exportAsPdf(session.input, session.argument, session.counterargument, session.explanation, false, `Nayaya_AI_History_${safeTitle}.pdf`);
      onShowToast('Session exported as PDF', 'success');
    } catch {
      onShowToast('Failed to export session PDF', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--bg)] border-l border-[var(--hairline)] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-[var(--hairline)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--gold)]/15 text-[var(--gold)]">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base">
                  Practice Session History
                </h3>
                <span className="text-xs text-[var(--muted)]">
                  {sessions.length} {sessions.length === 1 ? 'case saved' : 'cases saved in localStorage'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-[var(--hairline)] bg-[var(--surface)]/40">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--muted-2)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by subject, issue, or facts..."
                className="w-full bg-[var(--surface)] border border-[var(--hairline)] rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
              />
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--surface)] flex items-center justify-center text-[var(--muted-2)]">
                  <History className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {searchQuery ? 'No matching sessions' : 'No saved sessions yet'}
                  </p>
                  <p className="text-xs text-[var(--muted-2)] max-w-xs mx-auto">
                    {searchQuery
                      ? 'Try adjusting your search terms.'
                      : 'Generate practice arguments and click "Save Session" to track your moot-court practice history.'}
                  </p>
                </div>
              </div>
            ) : (
              filtered.map(session => {
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session);
                      onClose();
                    }}
                    className="p-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface)] border border-[var(--hairline)] hover:border-[var(--gold)]/50 cursor-pointer transition-all duration-150 space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <SubjectBadge subject={session.input.subject} />
                        <JurisdictionBadge jurisdiction={session.input.jurisdiction} />
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">
                        {formatDate(session.timestamp)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-[var(--ink)] group-hover:text-[var(--gold-bright)] transition-colors line-clamp-2">
                        {session.input.issue || 'Untitled Legal Issue'}
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
                        {truncate(session.input.facts, 120)}
                      </p>
                    </div>

                    {/* Progress indicators */}
                    <div className="pt-2 border-t border-[var(--hairline)] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            session.argument ? 'text-emerald-400' : 'text-[var(--muted-2)]'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>IRAC</span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 ${
                            session.counterargument ? 'text-emerald-400' : 'text-[var(--muted-2)]'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Opposition</span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 ${
                            session.explanation ? 'text-emerald-400' : 'text-[var(--muted-2)]'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Plain</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => handleExportSessionPdf(e, session)}
                          className="p-1 rounded text-[var(--muted)] hover:text-[var(--gold-bright)] hover:bg-[var(--surface-2)] transition-colors"
                          title="Export PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="p-1 rounded text-[var(--muted)] hover:text-rose-400 hover:bg-[var(--surface-2)] transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          {sessions.length > 0 && (
            <div className="p-4 border-t border-[var(--hairline)] bg-[var(--surface)]/60 flex items-center justify-between">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all saved sessions?')) {
                    onClearAll();
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--surface-2)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors"
              >
                Close Drawer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
