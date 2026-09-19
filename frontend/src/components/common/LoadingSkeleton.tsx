import React from 'react';
import { Loader2, Scale, BookOpen, Brain, ShieldAlert } from 'lucide-react';

interface LoadingSkeletonProps {
  title?: string;
  step?: 'irac' | 'counterargument' | 'explain';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  title = 'Analyzing Legal Issues & Formulating Arguments...',
  step = 'irac'
}) => {
  const steps = [
    { icon: BookOpen, label: 'Extracting material facts & legal questions', done: true },
    { icon: Scale, label: 'Synthesizing relevant doctrinal principles & tests', done: step !== 'irac' },
    { icon: Brain, label: 'Applying legal rules to fact pattern systematically', done: false },
    { icon: ShieldAlert, label: 'Evaluating opposition vulnerabilities & holding', done: false },
  ];

  return (
    <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--hairline)] space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-[var(--gold)] animate-spin" />
        <span className="font-semibold text-[var(--ink)] text-sm sm:text-base">{title}</span>
      </div>

      {/* Progress steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[var(--surface-2)]/50 border border-[var(--hairline)]/50 text-xs text-[var(--muted)]"
            >
              <Icon className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <span className="truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Placeholder content skeleton */}
      <div className="space-y-4 pt-4 border-t border-[var(--hairline)]">
        <div className="h-4 bg-[var(--surface-2)] rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-[var(--surface-2)]/70 rounded w-full"></div>
          <div className="h-3 bg-[var(--surface-2)]/70 rounded w-5/6"></div>
          <div className="h-3 bg-[var(--surface-2)]/70 rounded w-4/6"></div>
        </div>
        <div className="h-4 bg-[var(--surface-2)] rounded w-1/3 pt-2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-[var(--surface-2)]/70 rounded w-full"></div>
          <div className="h-3 bg-[var(--surface-2)]/70 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
};
