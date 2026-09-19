import React from 'react';
import type { LegalSubject, Jurisdiction } from '../../types/legal';
import { getSubjectTheme, getJurisdictionBadge } from '../../utils/formatting';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';
  
  const variantClasses = {
    default: 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--hairline)]',
    primary: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-md border ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

export const SubjectBadge: React.FC<{ subject: LegalSubject | string }> = ({ subject }) => {
  const theme = getSubjectTheme(subject);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${theme.badge}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {subject}
    </span>
  );
};

export const JurisdictionBadge: React.FC<{ jurisdiction: Jurisdiction | string }> = ({ jurisdiction }) => {
  const info = getJurisdictionBadge(jurisdiction);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-2)]/80 text-[var(--muted)] border border-[var(--hairline)]">
      <span>{info.flag}</span>
      <span>{info.label}</span>
    </span>
  );
};

export const IracLetterBadge: React.FC<{ letter: 'I' | 'R' | 'A' | 'C' }> = ({ letter }) => {
  const configs = {
    I: { label: 'ISSUE', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    R: { label: 'RULE', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
    A: { label: 'APPLICATION', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    C: { label: 'CONCLUSION', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' }
  }[letter];

  return (
    <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-xs tracking-wider border ${configs.bg}`}>
      {configs.label}
    </span>
  );
};
