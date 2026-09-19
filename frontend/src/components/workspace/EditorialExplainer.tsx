import React, { useState } from 'react';
import type { LegalExplanation } from '../../types/legal';
import { DemoModeNotice } from '../common/DemoModeNotice';
import { BookOpen, Sparkles, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/exportUtils';

interface EditorialExplainerProps {
  explanation?: LegalExplanation | null;
  isMock?: boolean;
  isLoading: boolean;
  onGenerate: (customText?: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const EditorialExplainer: React.FC<EditorialExplainerProps> = ({
  explanation,
  isMock = false,
  isLoading,
  onGenerate,
  onShowToast
}) => {
  const [mode, setMode] = useState<'generated' | 'custom'>('generated');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!explanation) return;
    const text = `PLAIN-LANGUAGE LEGAL EXPLANATION\n\nSummary:\n${explanation.plain_explanation}\n\nKey Legal Terms:\n${explanation.key_legal_terms.map(t => `• ${t.term}: ${t.meaning} (Example: ${t.simple_example || ''})`).join('\n')}\n\nReasoning Breakdown:\n${explanation.reasoning_breakdown.map(r => `• ${r}`).join('\n')}\n\nNuances & Limitations:\n${explanation.nuances_limitations.map(n => `• ${n}`).join('\n')}`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      onShowToast('Plain-language explanation copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onGenerate(customText);
  };

  if (!explanation) {
    return (
      <div className="text-center py-16 px-4 max-w-lg mx-auto space-y-6 animate-editorial-fade">
        <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface)] border border-[var(--hairline)] flex items-center justify-center text-[var(--muted)]">
          <BookOpen className="w-5 h-5" />
        </div>

        {/* Toggle mode */}
        <div className="inline-flex rounded-full bg-[var(--surface)] border border-[var(--hairline)] p-1">
          <button
            onClick={() => setMode('generated')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === 'generated'
                ? 'bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#1b1712] font-semibold'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Explain Current Case
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === 'custom'
                ? 'bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#1b1712] font-semibold'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Paste Custom Text
          </button>
        </div>

        {mode === 'generated' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-light tracking-tight text-[var(--ink)]">
                Plain-Language Conceptual Breakdown
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted)] font-light leading-relaxed">
                Translate legal doctrine and arguments into clear, jargon-reduced language suitable for a first-year law student while preserving essential legal nuance.
              </p>
            </div>
            <div>
              <button
                onClick={() => onGenerate()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-semibold tracking-wide text-[#1b1712] bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] hover:brightness-110 transition-all active:scale-95 disabled:opacity-60 shadow-[0_0_20px_-3px_rgba(255,255,255,0.25)]"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-900" />
                    <span>Simplifying Legal Reasoning...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explain Simply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4 text-left">
            <textarea
              rows={4}
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Paste statutory text, legal clause, or judgment excerpt..."
              className="w-full bg-[var(--bg)] border border-[var(--hairline)] rounded-xl p-3.5 text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--gold)] resize-y"
            />
            <button
              type="submit"
              disabled={isLoading || !customText.trim()}
              className="w-full py-3 rounded-full text-xs font-semibold tracking-wide text-[#1b1712] bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] hover:brightness-110 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Explain Custom Text</span>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-editorial-fade max-w-4xl mx-auto">
      {/* Demo Notice */}
      {isMock && <DemoModeNotice />}

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
        <div>
          <span className="font-mono text-xs text-[var(--muted-2)] font-semibold">03 / TRANSLATION</span>
          <h3 className="text-lg font-light text-[var(--ink)] tracking-tight">
            Plain-Language Conceptual Breakdown
          </h3>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Explanation'}</span>
        </button>
      </div>

      {/* Core Summary */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--gold)] font-mono">
          In Plain English (The Core Takeaway)
        </span>
        <p className="text-sm sm:text-base font-light text-[var(--ink)] leading-relaxed pl-6 border-l-2 border-[var(--gold)]/40">
          {explanation.plain_explanation}
        </p>
      </div>

      {/* Key Legal Terms Glossary Chips / Cards */}
      {explanation.key_legal_terms && explanation.key_legal_terms.length > 0 && (
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] font-mono">
            Key Legal Terminology & Real-World Illustrations
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {explanation.key_legal_terms.map((term, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[var(--bg-raised)] border border-[var(--hairline)] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-[var(--ink)] font-sans">
                    {term.term}
                  </h4>
                  <p className="text-xs text-[var(--muted)] font-light mt-1.5 leading-relaxed">
                    {term.meaning}
                  </p>
                </div>
                {term.simple_example && (
                  <div className="pt-2.5 border-t border-[var(--hairline)] text-[11px] text-[var(--muted)] font-light italic">
                    <span className="text-[var(--muted)] not-italic font-medium mr-1">Example:</span>
                    {term.simple_example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-Step Logic Breakdown */}
      {explanation.reasoning_breakdown && explanation.reasoning_breakdown.length > 0 && (
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] font-mono">
            What the Reasoning Means (Step-by-Step Logic)
          </span>
          <div className="space-y-2.5">
            {explanation.reasoning_breakdown.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--hairline)] text-xs text-[var(--muted)] font-light leading-relaxed flex items-start gap-3"
              >
                <span className="font-mono text-xs font-semibold text-[var(--muted-2)] shrink-0">
                  0{idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nuances and Limitations */}
      {explanation.nuances_limitations && explanation.nuances_limitations.length > 0 && (
        <div className="pt-4 border-t border-[var(--hairline)] space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 font-mono">
            Important Legal Nuances & Limitations
          </span>
          <ul className="space-y-2 text-xs text-[var(--muted)] leading-relaxed list-disc list-inside">
            {explanation.nuances_limitations.map((n, idx) => (
              <li key={idx}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
