import React, { useState } from 'react';
import { NayayaLogo } from '../brand/NayayaLogo';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, ShieldAlert, Sun, Moon } from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';

interface AuthPageProps {
  onSuccess: () => void;
  onBack: () => void;
  initialMode?: 'signin' | 'signup';
  theme: Theme;
  onToggleTheme: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onBack,
  initialMode = 'signin',
  theme,
  onToggleTheme
}) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 450);
  };

  const handleDemoAccess = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 300);
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--ink)] flex flex-col lg:flex-row selection:bg-[var(--gold)]/25 selection:text-[var(--ink)]">
      {/* LEFT COLUMN: Cinematic Architectural Statement (60% on desktop) */}
      <div
        className="relative lg:w-3/5 min-h-[340px] lg:min-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--hairline)] overflow-hidden bg-[var(--bg-raised)]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 45% at 22% 18%, rgba(201,164,99,0.12), transparent 68%)'
        }}
      >
        {/* Ambient Courtroom Light Column */}
        <div className="absolute top-0 left-1/3 w-[1px] h-full bg-gradient-to-b from-[var(--gold)]/25 via-[var(--muted)]/10 to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <NayayaLogo size="sm" showText={false} />
          </div>
        </div>

        {/* Center Editorial Brand Statement */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest text-[var(--gold-bright)] border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06]">
            <span>Moot Court Environment</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[var(--ink)] leading-[1.1]">
            Your courtroom
            <br />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--ink)] to-[var(--gold-bright)]">
              starts here.
            </span>
          </h2>

          <p className="text-[var(--muted)] text-sm sm:text-base font-light leading-relaxed">
            Build arguments. Challenge assumptions. Practice moot court with confidence and precision.
          </p>

          <div className="pt-4 space-y-3 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <span>Structured IRAC legal reasoning engine</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <span>Adversarial counterargument & bench simulation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <span>Jargon-reduced plain-language legal explainer</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer notice */}
        <div className="relative z-10 text-[11px] text-[var(--muted-2)] flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-[var(--muted-2)]" />
          <span>Educational practice tool only · Not legal advice</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Clean Translucent Authentication Panel (40% on desktop) */}
      <div className="lg:w-2/5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[var(--surface)] backdrop-blur-2xl">
        <div className="max-w-sm w-full mx-auto space-y-8 animate-editorial-fade">
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-2xl font-light tracking-tight text-[var(--ink)]">
              {isSignUp ? 'Create your practice account' : 'Welcome back'}
            </h3>
            <p className="text-xs text-[var(--muted)] font-light">
              {isSignUp
                ? 'Enter your details to start practicing legal reasoning'
                : 'Sign in to access your case sessions and moot-court history'}
            </p>
          </div>

          {/* Quick Demo Law Student Login Button */}
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wide text-[var(--ink)] bg-[var(--bg-raised)] hover:bg-[var(--surface-2)] border border-[var(--hairline)] shadow-md transition-all duration-150 flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>1-Click Law Student Instant Access</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[var(--hairline)] w-full" />
            <span className="bg-[var(--surface)] px-3 text-[10px] uppercase font-mono tracking-wider text-[var(--muted-2)]">
              or continue with credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Full Name / Law School
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Adv. Sharma / Harvard Law '26"
                  className="w-full bg-[var(--bg-raised)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--gold)] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@law.edu"
                className="w-full bg-[var(--bg-raised)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--gold)] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
                  Password
                </label>
                {!isSignUp && (
                  <span className="text-[11px] text-[var(--muted)] hover:text-[var(--gold)] cursor-pointer">
                    Forgot?
                  </span>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[var(--bg-raised)] border border-[var(--hairline)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--muted-2)] focus:outline-none focus:border-[var(--gold)] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wide text-[#1b1712] bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] hover:brightness-110 shadow-[0_0_20px_-6px_rgba(201,164,99,0.6)] transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
            >
              <span>{isSignUp ? 'Create Practice Account' : 'Continue to Practice Court'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Switch mode */}
          <div className="text-center text-xs text-[var(--muted)]">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-[var(--gold)] hover:underline font-medium ml-1"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-[var(--gold)] hover:underline font-medium ml-1"
                >
                  Create one
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
