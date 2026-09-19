import React, { useState } from 'react';
import type { Counterargument } from '../../types/legal';
import { DemoModeNotice } from '../common/DemoModeNotice';
import { Gavel, Sparkles, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/exportUtils';

interface EditorialCounterProps {
  counterargument?: Counterargument | null;
  isMock?: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const EditorialCounter: React.FC<EditorialCounterProps> = ({
  counterargument,
  isMock = false,
  isLoading,
  onGenerate,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!counterargument) return;
    const text = `MOOT-COURT COUNTERARGUMENT ANALYSIS\n\nOpposition Position:\n${counterargument.opposition_position}\n\nStrongest Opposing Arguments:\n${counterargument.opposing_arguments.map(a => `• ${a}`).join('\n')}\n\nWeaknesses in Student's Argument:\n${counterargument.student_weaknesses.map(w => `• ${w}`).join('\n')}\n\nPossible Rebuttal Directions:\n${counterargument.rebuttal_directions.map(r => `• ${r}`).join('\n')}`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      onShowToast('Counterargument copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!counterargument) {
    return (
      <div className="text-center py-16 px-4 max-w-lg mx-auto space-y-6 animate-editorial-fade">
        <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface)] border border-[var(--hairline)] flex items-center justify-center text-[var(--muted)]">
          <Gavel className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-light tracking-tight text-[var(--ink)]">
            Moot-Court Opposition & Counterarguments
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-light leading-relaxed">
            Test your legal arguments against the strongest opposition points, uncover vulnerabilities in your position, and prepare strategic oral rebuttals.
          </p>
        </div>
        <div>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-semibold tracking-wide text-[#1b1712] bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] hover:brightness-110 transition-all active:scale-95 disabled:opacity-60 shadow-[0_0_20px_-3px_rgba(255,255,255,0.25)]"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-900" />
                <span>Simulating Opposition Bench...</span>
              </>
            ) : (
              <>
                <Gavel className="w-3.5 h-3.5" />
                <span>Generate Counterargument</span>
              </>
            )}
          </button>
        </div>
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
          <span className="font-mono text-xs text-[var(--muted-2)] font-semibold">02 / OPPOSITION</span>
          <h3 className="text-lg font-light text-[var(--ink)] tracking-tight">
            Moot-Court Counterargument Simulation
          </h3>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Stance'}</span>
        </button>
      </div>

      {/* Core Opposition Thesis */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-rose-400 font-mono">
          Opposition Position Statement
        </span>
        <div className="text-base sm:text-lg font-light text-[var(--ink)] leading-relaxed pl-6 border-l-2 border-rose-500/40 font-serif sm:font-sans italic">
          "{counterargument.opposition_position}"
        </div>
      </div>

      {/* Strongest Opposing Arguments */}
      <div className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] font-mono">
          Strongest Opposing Arguments
        </span>
        <div className="space-y-4">
          {counterargument.opposing_arguments.map((arg, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[var(--bg-raised)] border border-[var(--hairline)] space-y-1.5"
            >
              <span className="font-mono text-[10px] text-[var(--muted-2)] uppercase tracking-widest">
                Argument 0{idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-[var(--muted)] font-light leading-relaxed">
                {arg}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weaknesses and Rebuttal Directions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[var(--hairline)]">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 font-mono">
            Vulnerabilities in Your Stance
          </span>
          <ul className="space-y-2 text-xs text-[var(--muted)] leading-relaxed list-disc list-inside">
            {counterargument.student_weaknesses.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--gold)] font-mono">
            Strategic Rebuttal Directions
          </span>
          <ul className="space-y-2 text-xs text-[var(--muted)] leading-relaxed list-disc list-inside">
            {counterargument.rebuttal_directions.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
