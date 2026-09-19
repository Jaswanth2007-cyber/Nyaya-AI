import React, { useState } from 'react';
import type { IracArgument, ArgumentScore } from '../../types/legal';
import { DemoModeNotice } from '../common/DemoModeNotice';
import { Copy, Check, Gavel, BookOpen, ChevronDown, ChevronUp, Gauge, Loader2, ThumbsUp, Lightbulb } from 'lucide-react';
import { copyToClipboard } from '../../utils/exportUtils';

interface EditorialIracProps {
  argument: IracArgument;
  isMock?: boolean;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
  onTriggerCounterargument?: () => void;
  hasCounterargument?: boolean;
  onTriggerExplain?: () => void;
  hasExplanation?: boolean;
  score?: ArgumentScore | null;
  isScoreMock?: boolean;
  isLoadingScore?: boolean;
  onScoreArgument?: () => void;
}

export const EditorialIrac: React.FC<EditorialIracProps> = ({
  argument,
  isMock = false,
  onShowToast,
  onTriggerCounterargument,
  hasCounterargument = false,
  onTriggerExplain,
  hasExplanation = false,
  score = null,
  isScoreMock = false,
  isLoadingScore = false,
  onScoreArgument
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  const handleCopySection = async (sectionName: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedSection(sectionName);
      onShowToast(`Copied [${sectionName}] to clipboard`, 'success');
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  return (
    <div className="space-y-12 animate-editorial-fade max-w-4xl mx-auto">
      {/* Demo Notice if Mock */}
      {isMock && <DemoModeNotice />}

      {/* Editorial Numbered IRAC Sections */}
      <div className="space-y-12 divide-y divide-[var(--hairline)]">
        {/* 01 ISSUE */}
        <section className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[var(--muted-2)] tracking-wider">01</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                Issue / Question of Law
              </span>
            </div>
            <button
              onClick={() => handleCopySection('Issue', argument.issue)}
              className="inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            >
              {copiedSection === 'Issue' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'Issue' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-lg sm:text-xl font-light text-[var(--ink)] leading-relaxed pl-7 border-l border-[var(--gold)]/30">
            "{argument.issue}"
          </div>
        </section>

        {/* 02 RULE */}
        <section className="pt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[var(--muted-2)] tracking-wider">02</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                Governing Rule & Legal Doctrine
              </span>
            </div>
            <button
              onClick={() => handleCopySection('Rule', argument.rule)}
              className="inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            >
              {copiedSection === 'Rule' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'Rule' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-sm sm:text-base font-light text-[var(--muted)] leading-relaxed pl-7 whitespace-pre-line">
            {argument.rule}
          </div>
        </section>

        {/* 03 APPLICATION */}
        <section className="pt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[var(--muted-2)] tracking-wider">03</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                Application of Law to Facts
              </span>
            </div>
            <button
              onClick={() => handleCopySection('Application', argument.application)}
              className="inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            >
              {copiedSection === 'Application' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'Application' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-sm sm:text-base font-light text-[var(--muted)] leading-relaxed pl-7 whitespace-pre-line space-y-3">
            {argument.application}
          </div>
        </section>

        {/* 04 CONCLUSION */}
        <section className="pt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[var(--muted-2)] tracking-wider">04</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                Holding & Legal Conclusion
              </span>
            </div>
            <button
              onClick={() => handleCopySection('Conclusion', argument.conclusion)}
              className="inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            >
              {copiedSection === 'Conclusion' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'Conclusion' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-base sm:text-lg font-normal text-[var(--ink)] leading-relaxed pl-7 border-l border-emerald-500/30">
            {argument.conclusion}
          </div>
        </section>
      </div>

      {/* Expandable Supporting Doctrinal Notes & Assumptions */}
      <div className="pt-6 border-t border-[var(--hairline)]">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <span>{showNotes ? 'Hide analytical assumptions & principles' : 'View analytical principles & limitations'}</span>
          {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showNotes && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[var(--bg-raised)] border border-[var(--hairline)] text-xs text-[var(--muted)] space-y-4 md:space-y-0">
            {argument.general_principles && argument.general_principles.length > 0 && (
              <div className="space-y-2">
                <span className="font-semibold text-[var(--muted)] uppercase tracking-wider text-[11px]">
                  General Principles Used
                </span>
                <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-[var(--muted)]">
                  {argument.general_principles.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {argument.limitations && argument.limitations.length > 0 && (
              <div className="space-y-2">
                <span className="font-semibold text-[var(--muted)] uppercase tracking-wider text-[11px]">
                  Educational Limitations
                </span>
                <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-[var(--muted)]">
                  {argument.limitations.map((l, idx) => (
                    <li key={idx}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Argument Strength Scoring (good-to-have: informal AI feedback) */}
      {onScoreArgument && (
        <div className="pt-6 border-t border-[var(--hairline)]">
          {!score && !isLoadingScore && (
            <button
              onClick={onScoreArgument}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--hairline)] bg-[var(--surface)]/50 transition-all active:scale-95"
            >
              <Gauge className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>Score My Argument</span>
            </button>
          )}

          {isLoadingScore && (
            <div className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--gold)]" />
              <span>Evaluating structure and persuasiveness...</span>
            </div>
          )}

          {score && !isLoadingScore && (
            <div className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--gold)]/[0.04] p-6 space-y-4 animate-editorial-fade">
              {isScoreMock && <DemoModeNotice />}
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-14 h-14 rounded-full border-2 border-[var(--gold)] flex items-center justify-center">
                  <span className="text-lg font-semibold text-[var(--gold-bright)]">{score.score}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
                    Argument Strength — {score.score}/10
                  </span>
                  <p className="text-sm text-[var(--ink)] font-light mt-0.5">{score.score_label}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    <ThumbsUp className="w-3.5 h-3.5" /> Strengths
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-xs text-[var(--muted)] leading-relaxed">
                    {score.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--gold-bright)]">
                    <Lightbulb className="w-3.5 h-3.5" /> Improvements
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-xs text-[var(--muted)] leading-relaxed">
                    {score.improvements.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Step Editorial Triggers */}
      <div className="pt-8 border-t border-[var(--hairline)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[var(--muted-2)]">
          Moot-Court Practice Pipeline: Step 1 of 3 Complete
        </div>

        <div className="flex items-center gap-3">
          {onTriggerCounterargument && !hasCounterargument && (
            <button
              onClick={onTriggerCounterargument}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#1b1712] bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)]"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Generate Counterargument</span>
            </button>
          )}

          {onTriggerExplain && !hasExplanation && (
            <button
              onClick={onTriggerExplain}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--hairline)] hover:border-[var(--hairline)] bg-[var(--surface)]/50 transition-all active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explain Simply</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
