import React, { useState, useEffect, useRef } from 'react';
import type {
  CaseInput,
  IracArgument,
  Counterargument,
  LegalExplanation,
  CaseSession,
  SampleCasePreset,
  LegalSubject,
  Jurisdiction
} from '../../types/legal';
import { SAMPLE_CASES } from '../../data/sampleCases';
import { apiService, authService, sessionsApi } from '../../services/api';
import { storageService } from '../../services/storage';
import { NyayaLogo } from '../brand/NyayaLogo';
import { EditorialIrac } from './EditorialIrac';
import { EditorialCounter } from './EditorialCounter';
import { EditorialExplainer } from './EditorialExplainer';
import { HistoryDrawer } from '../history/HistoryDrawer';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ErrorAlert } from '../common/ErrorAlert';
import { ToastContainer } from '../common/Toast';
import type { ToastMessage } from '../common/Toast';
import { copyToClipboard, downloadAsTxt, exportAsPdf, generateMarkdownBrief } from '../../utils/exportUtils';
import { countWords } from '../../utils/formatting';
import {
  Sparkles,
  History,
  Download,
  Copy,
  FileText,
  Bookmark,
  Check,
  Radio,
  BookOpen,
  ArrowRight,
  Plus,
  Scale,
  Gavel,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Theme } from '../../hooks/useTheme';
import type { ArgumentScore } from '../../types/legal';

interface WorkspacePageProps {
  onLogout: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const SUBJECT_OPTIONS: LegalSubject[] = [
  'Contract Law',
  'Criminal Law',
  'Tort / Negligence',
  'Constitutional Law',
  'Intellectual Property',
  'Cyber Law',
  'International Law'
];

const JURISDICTION_OPTIONS: Jurisdiction[] = [
  'India',
  'United States',
  'United Kingdom',
  'General / Educational'
];

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ onLogout, theme, onToggleTheme }) => {
  // Any backend session — registered account or anonymous guest — gets
  // server-persisted, unbounded session history via the same /api/sessions
  // storage. Only the rare fully-offline fallback (guest login itself failed)
  // uses the bounded localStorage cache instead.
  const isAuthenticatedUser = authService.isAuthenticated();
  // Primary Case Input State
  const [input, setInput] = useState<CaseInput>({
    subject: SAMPLE_CASES[0].subject,
    jurisdiction: SAMPLE_CASES[0].jurisdiction,
    issue: SAMPLE_CASES[0].input.issue,
    facts: SAMPLE_CASES[0].input.facts
  });

  // Analysis & Output States
  const [argument, setArgument] = useState<IracArgument | null>(null);
  const [counterargument, setCounterargument] = useState<Counterargument | null>(null);
  const [explanation, setExplanation] = useState<LegalExplanation | null>(null);

  // Mock flags for transparency
  const [isArgumentMock, setIsArgumentMock] = useState(false);
  const [isCounterMock, setIsCounterMock] = useState(false);
  const [isExplainMock, setIsExplainMock] = useState(false);
  const [isScoreMock, setIsScoreMock] = useState(false);

  // Argument Strength Scoring (good-to-have feature)
  const [argumentScore, setArgumentScore] = useState<ArgumentScore | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  // Live token-streaming preview while the IRAC argument is being generated
  const [streamingPreview, setStreamingPreview] = useState('');

  // UI Flow States
  const [activeTab, setActiveTab] = useState<'irac' | 'counterargument' | 'explain'>('irac');
  const [isLoadingArgument, setIsLoadingArgument] = useState(false);
  const [isLoadingCounter, setIsLoadingCounter] = useState(false);
  const [isLoadingExplain, setIsLoadingExplain] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  // Backend Health & History
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [sessions, setSessions] = useState<CaseSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Copy & Export feedback
  const [copied, setCopied] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Helper to show toasts
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    apiService.checkHealth().then(res => {
      setIsBackendHealthy(res.isHealthy);
    });

    if (isAuthenticatedUser) {
      sessionsApi.list().then(setSessions).catch(() => {
        // Server unreachable — fall back to whatever local cache exists rather than showing nothing.
        setSessions(storageService.getSessions());
      });
    } else {
      setSessions(storageService.getSessions());
    }

    const interval = setInterval(() => {
      apiService.checkHealth().then(res => {
        setIsBackendHealthy(res.isHealthy);
      });
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // Update input values
  const handleInputChange = (updated: Partial<CaseInput>) => {
    setInput(prev => ({ ...prev, ...updated }));
    if (errorMessage) setErrorMessage(null);
  };

  // Select Sample Preset
  const handleSelectPreset = (preset: SampleCasePreset) => {
    setInput({ ...preset.input });
    setArgument(null);
    setCounterargument(null);
    setExplanation(null);
    setErrorMessage(null);
    setCurrentSessionId(null);
    setArgumentScore(null);
    setActiveTab('irac');
    setShowPresetsMenu(false);
    showToast(`Loaded "${preset.title}" (${preset.subject})`, 'info');
  };

  // Generate IRAC Practice Argument
  const handleGenerateArgument = async () => {
    if (!input.facts.trim() || !input.issue.trim()) {
      showToast('Please enter case facts and legal issue.', 'error');
      return;
    }

    try {
      setIsLoadingArgument(true);
      setErrorMessage(null);
      setStreamingPreview('');

      const result = await apiService.generateArgumentStream(
        {
          facts: input.facts,
          issue: input.issue,
          subject: input.subject,
          jurisdiction: input.jurisdiction
        },
        delta => setStreamingPreview(prev => prev + delta)
      );

      setArgument(result.data);
      setIsArgumentMock(result.isMock);
      setArgumentScore(null);
      setActiveTab('irac');

      if (workspaceRef.current) {
        workspaceRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      showToast(
        result.isMock
          ? 'Generated structured IRAC practice argument (Demo Mode)'
          : 'Generated live structured IRAC practice argument!',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
      showToast('Failed to generate argument', 'error');
    } finally {
      setIsLoadingArgument(false);
      setStreamingPreview('');
    }
  };

  // Generate Counterargument
  const handleGenerateCounterargument = async () => {
    try {
      setIsLoadingCounter(true);
      setErrorMessage(null);

      const result = await apiService.generateCounterargument({
        facts: input.facts,
        issue: input.issue,
        subject: input.subject,
        jurisdiction: input.jurisdiction,
        argument: argument
      });

      setCounterargument(result.data);
      setIsCounterMock(result.isMock);
      setActiveTab('counterargument');

      showToast(
        result.isMock
          ? 'Generated moot-court opposition analysis (Demo Mode)'
          : 'Generated live moot-court counterargument!',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
      showToast('Failed to generate counterargument', 'error');
    } finally {
      setIsLoadingCounter(false);
    }
  };

  // Explain Legal Reasoning
  const handleExplainReasoning = async (customText?: string) => {
    try {
      setIsLoadingExplain(true);
      setErrorMessage(null);

      const textToExplain =
        customText ||
        argument?.application ||
        argument?.rule ||
        input.facts;

      const result = await apiService.explainReasoning({
        reasoning_text: textToExplain,
        subject: input.subject,
        jurisdiction: input.jurisdiction
      });

      setExplanation(result.data);
      setIsExplainMock(result.isMock);
      setActiveTab('explain');

      if (argument && counterargument) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#ec4899', '#3b82f6', '#10b981']
          });
        } catch {}
      }

      showToast(
        result.isMock
          ? 'Generated plain-language legal explanation (Demo Mode)'
          : 'Generated live plain-language legal explanation!',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
      showToast('Failed to explain reasoning', 'error');
    } finally {
      setIsLoadingExplain(false);
    }
  };

  // Score Argument Strength (good-to-have feature)
  const handleScoreArgument = async () => {
    if (!argument) return;
    try {
      setIsLoadingScore(true);
      const result = await apiService.scoreArgument({
        facts: input.facts,
        issue: input.issue,
        subject: input.subject,
        jurisdiction: input.jurisdiction,
        argument
      });
      setArgumentScore(result.data);
      setIsScoreMock(result.isMock);
      showToast(
        result.isMock ? 'Scored argument strength (Demo Mode)' : 'Scored argument strength!',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      showToast(`Failed to score argument: ${msg}`, 'error');
    } finally {
      setIsLoadingScore(false);
    }
  };

  // Copy brief
  const handleCopyBrief = async () => {
    const isMock = isArgumentMock || isCounterMock || isExplainMock;
    const brief = generateMarkdownBrief(input, argument, counterargument, explanation, isMock);
    const success = await copyToClipboard(brief);
    if (success) {
      setCopied(true);
      showToast('Brief copied to clipboard in Markdown', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  // Export TXT
  const handleDownloadTxt = () => {
    const isMock = isArgumentMock || isCounterMock || isExplainMock;
    const brief = generateMarkdownBrief(input, argument, counterargument, explanation, isMock);
    const safeTitle = input.subject.replace(/[^a-zA-Z0-9]/g, '_');
    downloadAsTxt(`Nyaya_AI_Brief_${safeTitle}.txt`, brief);
    showToast('Downloaded TXT brief', 'success');
  };

  // Export PDF
  const handleExportPdf = () => {
    try {
      setExportingPdf(true);
      const isMock = isArgumentMock || isCounterMock || isExplainMock;
      const safeTitle = input.subject.replace(/[^a-zA-Z0-9]/g, '_');
      exportAsPdf(input, argument, counterargument, explanation, isMock, `Nyaya_AI_${safeTitle}.pdf`);
      showToast('Exported styled PDF brief', 'success');
    } catch {
      showToast('Failed to generate PDF', 'error');
    } finally {
      setExportingPdf(false);
    }
  };

  // Save Session (server-persisted for real accounts, localStorage for the demo path)
  const handleSaveSession = async () => {
    const sessionId = currentSessionId || `session_${Date.now()}`;
    const newSession: CaseSession = {
      id: sessionId,
      timestamp: Date.now(),
      title: input.issue.slice(0, 60) || 'Moot-Court Practice Session',
      input: { ...input },
      argument: argument,
      counterargument: counterargument,
      explanation: explanation,
      status: argument && counterargument && explanation ? 'complete' : 'argued'
    };

    if (isAuthenticatedUser) {
      try {
        await sessionsApi.save(newSession);
        setSessions(await sessionsApi.list());
        setCurrentSessionId(sessionId);
        showToast('Session saved to your account', 'success');
      } catch {
        showToast('Failed to save session to the server', 'error');
      }
    } else {
      storageService.saveSession(newSession);
      setCurrentSessionId(sessionId);
      setSessions(storageService.getSessions());
      showToast('Session saved to local history (demo mode)', 'success');
    }
  };

  // Restore Session
  const handleSelectSession = (session: CaseSession) => {
    setInput({ ...session.input });
    setArgument(session.argument);
    setCounterargument(session.counterargument);
    setExplanation(session.explanation);
    setCurrentSessionId(session.id);
    setErrorMessage(null);
    setArgumentScore(null);
    setActiveTab('irac');
    showToast(`Loaded session from ${new Date(session.timestamp).toLocaleDateString()}`, 'info');
  };

  // Delete Session
  const handleDeleteSession = async (id: string) => {
    if (isAuthenticatedUser) {
      try {
        setSessions(await sessionsApi.remove(id));
      } catch {
        showToast('Failed to delete session on the server', 'error');
        return;
      }
    } else {
      setSessions(storageService.deleteSession(id));
    }
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
    showToast('Session removed', 'info');
  };

  // Clear All Sessions
  const handleClearAllSessions = async () => {
    if (isAuthenticatedUser) {
      try {
        await sessionsApi.clearAll();
      } catch {
        showToast('Failed to clear sessions on the server', 'error');
        return;
      }
    } else {
      storageService.clearAllSessions();
    }
    setSessions([]);
    setCurrentSessionId(null);
    showToast('All saved history cleared', 'info');
  };

  // Start New Case
  const handleNewCase = () => {
    setInput({
      subject: 'Contract Law',
      jurisdiction: 'India',
      issue: '',
      facts: ''
    });
    setArgument(null);
    setCounterargument(null);
    setExplanation(null);
    setCurrentSessionId(null);
    setErrorMessage(null);
    setArgumentScore(null);
    setActiveTab('irac');
    showToast('Ready for new moot-court case', 'info');
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (input.facts.trim() && input.issue.trim() && !isLoadingArgument) {
          handleGenerateArgument();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, isLoadingArgument]);

  const hasAnyContent = Boolean(argument || counterargument || explanation);
  const isCurrentSessionSaved = Boolean(
    currentSessionId && sessions.some(s => s.id === currentSessionId)
  );

  const factsWordCount = countWords(input.facts);
  const issueWordCount = countWords(input.issue);

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--gold)]/25 selection:text-[var(--ink)] overflow-hidden">
      {/* Ambient cinematic backdrop (subtle, non-video echo of the landing stage) */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f4f1ea 1px, transparent 0)`,
            backgroundSize: '44px 44px'
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 55% 40% at 50% 0%, rgba(201,164,99,0.12), transparent 70%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07070a]/40 to-[#07070a]" />
      </div>

      {/* Top Refined Persistent Educational Disclaimer */}
      <div className="relative z-40 w-full bg-[var(--bg-raised)] border-b border-white/[0.06] px-4 py-2 text-center text-[11px] text-[var(--muted)] font-light flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-[var(--muted-2)] shrink-0" />
        <span>Educational practice only · Not legal advice · Not verified legal research</span>
      </div>

      {/* Top Editorial Navbar */}
      <header className="sticky top-0 z-40 w-full bg-[var(--bg)]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-[3vw] h-18 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <div className="flex items-center gap-6">
            <NyayaLogo size="md" />
            <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-[var(--hairline)] text-xs text-[var(--muted)] font-light">
              <span>Moot Court Environment</span>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-3">
            {/* Live vs Demo Pill */}
            <div
              title={
                isBackendHealthy
                  ? 'Connected to live backend server (/api)'
                  : 'Demo Mode active — Connect backend for live AI'
              }
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border ${
                isBackendHealthy
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--hairline)]'
              }`}
            >
              <Radio className={`w-2.5 h-2.5 ${isBackendHealthy ? 'text-emerald-400 animate-pulse' : 'text-[var(--muted-2)]'}`} />
              <span className="hidden sm:inline">{isBackendHealthy ? 'API Live' : 'Demo Fallback'}</span>
            </div>

            {/* Scenarios Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--hairline)] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span className="hidden sm:inline">Scenarios</span>
                <ChevronDown className="w-3 h-3 text-[var(--muted-2)]" />
              </button>

              {showPresetsMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] shadow-2xl p-2 z-50 animate-editorial-fade space-y-1">
                  <div className="px-3 py-2 text-[10px] uppercase font-mono tracking-wider text-[var(--muted-2)]">
                    1-Click Moot-Court Scenarios
                  </div>
                  {SAMPLE_CASES.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-[var(--surface-2)] transition-colors space-y-1 group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--ink)] group-hover:text-[var(--gold-bright)]">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-[var(--muted-2)] font-mono">
                          {preset.subject}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] line-clamp-1">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* History Drawer Trigger */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--hairline)] transition-colors relative"
            >
              <History className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span className="hidden sm:inline">History</span>
              {sessions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[var(--gold)]/20 text-[var(--gold-bright)] border border-[var(--gold)]/40 font-mono">
                  {sessions.length}
                </span>
              )}
            </button>

            {/* New Case Button */}
            <button
              onClick={handleNewCase}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#1b1712] bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] hover:brightness-110 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Case</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-[var(--muted-2)] hover:text-[var(--gold)] hover:bg-[var(--surface)] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Log out (real accounts) / exit demo session */}
            <button
              onClick={onLogout}
              title={isAuthenticatedUser ? 'Log out' : 'Exit demo session'}
              className="p-2 rounded-lg text-[var(--muted-2)] hover:text-[var(--muted)] hover:bg-[var(--surface)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Legal Drafting & Analysis Workspace */}
      <main className="relative z-20 flex-1 max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-[3vw] py-10 space-y-12">
        {/* Error Alert */}
        {errorMessage && (
          <ErrorAlert
            message={errorMessage}
            onRetry={handleGenerateArgument}
            onUseFallback={() => {
              apiService.generateArgument(input, { forceMock: true }).then(res => {
                setArgument(res.data);
                setIsArgumentMock(res.isMock);
                setErrorMessage(null);
              });
            }}
          />
        )}

        {/* SECTION 1: Case Preparation & Facts Input */}
        <section className="rounded-3xl border border-white/[0.07] bg-[var(--surface)]/60 backdrop-blur-sm px-6 py-8 sm:px-10 sm:py-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--hairline)]">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--gold)] font-semibold">
                Case Preparation
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-[var(--ink)] tracking-tight mt-0.5">
                Statement of Facts & Question of Law
              </h2>
            </div>

            {/* Subject & Jurisdiction Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={input.subject}
                onChange={e => handleInputChange({ subject: e.target.value as LegalSubject })}
                className="bg-[var(--surface)] border border-[var(--hairline)] rounded-lg px-3 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--gold)] transition-colors cursor-pointer"
              >
                {SUBJECT_OPTIONS.map(subj => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>

              <select
                value={input.jurisdiction}
                onChange={e => handleInputChange({ jurisdiction: e.target.value as Jurisdiction })}
                className="bg-[var(--surface)] border border-[var(--hairline)] rounded-lg px-3 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--gold)] transition-colors cursor-pointer"
              >
                {JURISDICTION_OPTIONS.map(jur => (
                  <option key={jur} value={jur}>
                    {jur}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Issue Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] font-mono">
                Legal Issue
              </label>
              <span className="text-[11px] text-[var(--muted)] font-mono">{issueWordCount} words</span>
            </div>
            <textarea
              rows={2}
              value={input.issue}
              onChange={e => handleInputChange({ issue: e.target.value })}
              placeholder="State the core legal question (e.g. Whether an automated order confirmation constitutes an irrevocable contract...)"
              className="w-full bg-[var(--bg-raised)] border border-[var(--hairline)] rounded-xl p-5 text-sm text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--gold)] resize-y leading-relaxed"
            />
          </div>

          {/* Facts Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] font-mono">
                Hypothetical Facts & Narrative
              </label>
              <span className="text-[11px] text-[var(--muted)] font-mono">{factsWordCount} words</span>
            </div>
            <textarea
              rows={6}
              value={input.facts}
              onChange={e => handleInputChange({ facts: e.target.value })}
              placeholder="Detail the hypothetical chronological events, parties, promises, incidents, or claimed violations..."
              className="w-full bg-[var(--bg-raised)] border border-[var(--hairline)] rounded-xl p-5 text-sm text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--gold)] resize-y leading-relaxed font-sans"
            />
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-[var(--muted)] font-light">
              Use hypothetical fact patterns · Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--muted)] font-mono text-[10px]">Ctrl+Enter</kbd> to generate
            </p>

            <button
              onClick={handleGenerateArgument}
              disabled={isLoadingArgument || !input.facts.trim() || !input.issue.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-full text-xs font-semibold tracking-wide text-[#1b1712] bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_-3px_rgba(255,255,255,0.3)]"
            >
              {isLoadingArgument ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>Analyzing Facts & Doctrine...</span>
                </>
              ) : (
                <>
                  <span>Generate Practice Argument</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* SECTION 2: Generated Analysis Stage */}
        <section
          ref={workspaceRef}
          className="rounded-3xl border border-white/[0.07] bg-[var(--surface)]/60 backdrop-blur-sm px-6 py-8 sm:px-10 sm:py-10 space-y-8"
        >
          {/* Editorial Pipeline Stepper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--hairline)]">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('irac')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'irac'
                    ? 'bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#1b1712] shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>01. IRAC Argument</span>
              </button>

              <button
                onClick={() => setActiveTab('counterargument')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'counterargument'
                    ? 'bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#1b1712] shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>02. Counterargument</span>
              </button>

              <button
                onClick={() => setActiveTab('explain')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'explain'
                    ? 'bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#1b1712] shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>03. Plain Explainer</span>
              </button>
            </div>

            {/* Quick Brief Actions */}
            {hasAnyContent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBrief}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--hairline)] transition-colors"
                  title="Copy formatted Markdown brief"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--hairline)] transition-colors"
                  title="Download TXT"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>TXT</span>
                </button>

                <button
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--hairline)] transition-colors"
                  title="Export PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>{exportingPdf ? 'PDF...' : 'PDF'}</span>
                </button>

                <button
                  onClick={handleSaveSession}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isCurrentSessionSaved
                      ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/40'
                      : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--hairline)] hover:text-[var(--ink)]'
                  }`}
                  title="Save session to history"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isCurrentSessionSaved ? 'fill-emerald-400' : ''}`} />
                  <span>{isCurrentSessionSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Tab Content Display */}
          <div className="pt-2">
            {activeTab === 'irac' && (
              <>
                {isLoadingArgument ? (
                  streamingPreview ? (
                    <div className="max-w-4xl mx-auto space-y-3 animate-editorial-fade">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Streaming live from the model...</span>
                      </div>
                      <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg-raised)] p-6 text-sm text-[var(--muted)] font-mono leading-relaxed whitespace-pre-wrap max-h-[420px] overflow-y-auto">
                        {streamingPreview}
                        <span className="inline-block w-2 h-4 ml-0.5 bg-[var(--gold)] animate-pulse align-text-bottom" />
                      </div>
                    </div>
                  ) : (
                    <LoadingSkeleton title="Structuring IRAC Practice Brief..." step="irac" />
                  )
                ) : argument ? (
                  <EditorialIrac
                    argument={argument}
                    isMock={isArgumentMock}
                    onShowToast={showToast}
                    onTriggerCounterargument={handleGenerateCounterargument}
                    hasCounterargument={Boolean(counterargument)}
                    onTriggerExplain={() => handleExplainReasoning()}
                    hasExplanation={Boolean(explanation)}
                    score={argumentScore}
                    isScoreMock={isScoreMock}
                    isLoadingScore={isLoadingScore}
                    onScoreArgument={handleScoreArgument}
                  />
                ) : (
                  <div className="text-center py-20 px-4 space-y-4 max-w-md mx-auto">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface)] border border-[var(--hairline)] flex items-center justify-center text-[var(--muted-2)]">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-light text-[var(--ink)] tracking-tight">
                        Ready to Formulate Argument
                      </h3>
                      <p className="text-xs text-[var(--muted)] font-light leading-relaxed">
                        Enter your fact pattern and question of law above, then click "Generate Practice Argument" to synthesize an IRAC brief.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'counterargument' && (
              <>
                {isLoadingCounter ? (
                  <LoadingSkeleton title="Simulating Opposition Stance..." step="counterargument" />
                ) : (
                  <EditorialCounter
                    counterargument={counterargument}
                    isMock={isCounterMock}
                    isLoading={isLoadingCounter}
                    onGenerate={handleGenerateCounterargument}
                    onShowToast={showToast}
                  />
                )}
              </>
            )}

            {activeTab === 'explain' && (
              <>
                {isLoadingExplain ? (
                  <LoadingSkeleton title="Translating Legal Reasoning..." step="explain" />
                ) : (
                  <EditorialExplainer
                    explanation={explanation}
                    isMock={isExplainMock}
                    isLoading={isLoadingExplain}
                    onGenerate={handleExplainReasoning}
                    onShowToast={showToast}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAllSessions}
        onShowToast={showToast}
        isCloudSynced={isAuthenticatedUser}
      />

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Minimal Footer */}
      <footer className="relative z-20 w-full border-t border-[var(--hairline)] px-6 sm:px-10 lg:px-[3vw] py-8 mt-16 text-[var(--muted)] text-xs bg-[var(--bg)]">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <NyayaLogo size="sm" showText={true} />
            <span className="text-[var(--muted-2)]">|</span>
            <span className="text-[var(--muted)] text-[11px]">AI-Powered Legal Learning & Moot Court Assistant</span>
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            Educational practice only · Not legal advice · Not verified legal research
          </p>
        </div>
      </footer>
    </div>
  );
};
