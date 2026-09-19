import type { LegalSubject, Jurisdiction } from '../types/legal';

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function truncate(text: string, maxLength = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getSubjectTheme(subject: LegalSubject | string): {
  color: string;
  bg: string;
  border: string;
  badge: string;
  iconBg: string;
} {
  switch (subject) {
    case 'Contract Law':
      return {
        color: 'text-amber-400',
        bg: 'bg-amber-950/30',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        iconBg: 'bg-amber-500/20 text-amber-300'
      };
    case 'Criminal Law':
      return {
        color: 'text-rose-400',
        bg: 'bg-rose-950/30',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
        iconBg: 'bg-rose-500/20 text-rose-300'
      };
    case 'Tort / Negligence':
      return {
        color: 'text-orange-400',
        bg: 'bg-orange-950/30',
        border: 'border-orange-500/30',
        badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
        iconBg: 'bg-orange-500/20 text-orange-300'
      };
    case 'Constitutional Law':
      return {
        color: 'text-indigo-400',
        bg: 'bg-indigo-950/30',
        border: 'border-indigo-500/30',
        badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        iconBg: 'bg-indigo-500/20 text-indigo-300'
      };
    case 'Cyber Law':
    case 'Intellectual Property':
      return {
        color: 'text-cyan-400',
        bg: 'bg-cyan-950/30',
        border: 'border-cyan-500/30',
        badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        iconBg: 'bg-cyan-500/20 text-cyan-300'
      };
    default:
      return {
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/30',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        iconBg: 'bg-emerald-500/20 text-emerald-300'
      };
  }
}

export function getJurisdictionBadge(jurisdiction: Jurisdiction | string): {
  label: string;
  flag: string;
} {
  switch (jurisdiction) {
    case 'India':
      return { label: 'India', flag: '🇮🇳' };
    case 'United States':
      return { label: 'United States', flag: '🇺🇸' };
    case 'United Kingdom':
      return { label: 'United Kingdom', flag: '🇬🇧' };
    default:
      return { label: 'General / Educational', flag: '⚖️' };
  }
}
