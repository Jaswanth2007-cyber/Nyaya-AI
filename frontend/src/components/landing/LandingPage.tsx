import React, { useState } from 'react';
import { NyayaLogo } from '../brand/NyayaLogo';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Moot Court', href: '#moot-court' }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToFeatures = () => {
    setIsMenuOpen(false);
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#07070a] text-[#f4f1ea] selection:bg-[#c9a463]/30 selection:text-white">
      {/* ============ HERO STAGE (full-bleed, one composition) ============ */}
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Animated aurora backdrop — real drifting motion, no video file needed */}
        <div className="aurora-stage" aria-hidden="true">
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
          <div className="aurora-blob aurora-blob-3" />
          <div className="aurora-sweep" />
          <div className="aurora-grain" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #f4f1ea 1px, transparent 0)`,
              backgroundSize: '44px 44px'
            }}
          />
          <div className="aurora-vignette" />
        </div>

        {/* ---------- Top bar ---------- */}
        <header className="relative z-30 w-full">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-[4.6vw] h-24 flex items-center justify-between">
            <a href="#top" aria-label="Home" className="animate-rise" style={{ animationDelay: '0ms' }}>
              <NyayaLogo size="md" fixed />
            </a>

            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-9 text-[13px] tracking-wide uppercase font-medium text-[#a29c8f] animate-rise"
              style={{ animationDelay: '40ms' }}
            >
              {NAV_LINKS.map(link => (
                <button
                  key={link.label}
                  onClick={() => (link.label === 'Moot Court' ? onGetStarted() : handleNavClick(link.href))}
                  className="hover:text-[#e8cb8f] transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-5 animate-rise" style={{ animationDelay: '40ms' }}>
              <button
                onClick={onSignIn}
                className="text-[13px] tracking-wide uppercase font-medium text-[#a29c8f] hover:text-[#e8cb8f] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold tracking-wide text-[#07070a] bg-gradient-to-b from-[#f4f1ea] to-[#e3dfd4] hover:from-white hover:to-[#efe9db] shadow-[0_0_24px_-6px_rgba(201,164,99,0.55)] transition-all duration-200 active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Mobile burger */}
            <button
              onClick={() => setIsMenuOpen(v => !v)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.14] backdrop-blur-md text-white"
            >
              {isMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        {/* ---------- Mobile menu overlay ---------- */}
        <nav
          className={`md:hidden fixed inset-0 z-40 flex flex-col justify-center bg-[#07070a]/97 backdrop-blur-xl transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="px-8 space-y-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6f6a60]">Menu</p>
            <ul className="space-y-5">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => (link.label === 'Moot Court' ? onGetStarted() : handleNavClick(link.href))}
                    className="flex items-center justify-between w-full text-3xl font-light text-white"
                  >
                    {link.label}
                    <ChevronDown className="w-5 h-5 -rotate-90 text-[#6f6a60]" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-[#07070a] bg-[#f4f1ea]"
              >
                Get Started
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-[#a29c8f] border border-white/10"
              >
                Sign In
              </button>
            </div>
          </div>
        </nav>

        {/* ---------- Headline composition ---------- */}
        <main className="relative z-20 flex-1 flex items-center">
          <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-[4.6vw]">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase text-[#e8cb8f] border border-[#c9a463]/25 bg-[#c9a463]/[0.06] backdrop-blur-md mb-9 animate-rise"
              style={{ animationDelay: '60ms' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#e8cb8f]" />
              <span>Legal Learning &amp; Moot Court Assistant</span>
            </div>

            <h1
              className="text-[11vw] sm:text-[3.6rem] lg:text-[4.2rem] xl:text-[4.6rem] font-normal tracking-tight leading-[1.05] max-w-4xl sm:whitespace-nowrap animate-rise"
              style={{ animationDelay: '90ms' }}
            >
              <span className="block text-[#f4f1ea]">Turn Legal Reasoning</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#f4f1ea] via-[#e8cb8f] to-[#c9a463]">
                Into Clear Arguments.
              </span>
            </h1>

            <p
              className="mt-8 text-base sm:text-lg text-[#a29c8f] max-w-xl font-light leading-relaxed animate-rise"
              style={{ animationDelay: '140ms' }}
            >
              Practice structured IRAC reasoning, stress-test your thesis against sharp opposition
              counterarguments, and simplify dense legal doctrines with an AI designed for legal
              education.
            </p>

            <div
              className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 animate-rise"
              style={{ animationDelay: '220ms' }}
            >
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide text-[#07070a] bg-gradient-to-b from-[#f4f1ea] to-[#e3dfd4] hover:from-white hover:to-[#efe9db] shadow-[0_0_34px_-6px_rgba(201,164,99,0.6)] transition-all duration-200 active:scale-95"
              >
                <span>Enter the Practice Court</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wider uppercase text-[#f4f1ea] hover:text-[#e8cb8f] transition-colors"
              >
                <span>Explore How It Works</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* ---------- Bottom capability strip ---------- */}
        <div
          className="relative z-20 w-full pb-10 sm:pb-12 animate-editorial-fade"
          style={{ animationDelay: '340ms' }}
        >
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-[4.6vw]">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[#8a8578] text-[12px] uppercase tracking-widest border-t border-[#c9a463]/15 pt-6">
              <span>IRAC-Structured Drafting</span>
              <span className="w-1 h-1 rounded-full bg-[#c9a463]/70" />
              <span>Counter-Argument Mode</span>
              <span className="w-1 h-1 rounded-full bg-[#c9a463]/70" />
              <span>Plain-Language Explainer</span>
              <span className="w-1 h-1 rounded-full bg-[#c9a463]/70" />
              <span>Educational Sandbox Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="relative z-20 w-full border-t border-white/[0.06] bg-[#07070a]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-[4.6vw] py-24 sm:py-28">
          <div className="max-w-2xl mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#c9a463] font-semibold font-mono">
              01 / Architecture of Reason
            </span>
            <h2 className="text-3xl sm:text-5xl font-normal text-[#f4f1ea] tracking-tight leading-tight">
              Designed for the discipline of legal thought.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            <div className="space-y-4 border-t border-[#c9a463]/25 pt-6">
              <span className="font-mono text-xs text-[#c9a463] font-semibold">01</span>
              <h3 className="text-lg font-medium text-[#f4f1ea] tracking-tight">
                Structured IRAC Formulation
              </h3>
              <p className="text-sm text-[#a29c8f] font-light leading-relaxed">
                Deconstruct complex fact patterns into precise questions of law, isolate governing
                rules, and bridge doctrine to facts through formal legal reasoning.
              </p>
            </div>

            <div className="space-y-4 border-t border-[#c9a463]/25 pt-6">
              <span className="font-mono text-xs text-[#c9a463] font-semibold">02</span>
              <h3 className="text-lg font-medium text-[#f4f1ea] tracking-tight">
                Moot-Court Opposition
              </h3>
              <p className="text-sm text-[#a29c8f] font-light leading-relaxed">
                Simulate bench questioning and opponent arguments. Discover subtle weaknesses in
                your legal stance and formulate strategic rebuttal directions before oral argument.
              </p>
            </div>

            <div className="space-y-4 border-t border-[#c9a463]/25 pt-6">
              <span className="font-mono text-xs text-[#c9a463] font-semibold">03</span>
              <h3 className="text-lg font-medium text-[#f4f1ea] tracking-tight">
                Plain-Language Legal Translation
              </h3>
              <p className="text-sm text-[#a29c8f] font-light leading-relaxed">
                Unpack dense judgments and archaic statutory language into clear, jargon-reduced
                concepts calibrated for first-year law students while retaining critical nuance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER / DISCLAIMER ============ */}
      <footer className="relative z-20 w-full border-t border-white/[0.06] px-6 sm:px-10 lg:px-[4.6vw] py-8 bg-[#07070a] text-[#6f6a60] text-xs">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <NyayaLogo size="sm" showText={true} fixed />
            <span className="text-[#3a3730]">|</span>
            <span className="text-[#a29c8f] text-[11px]">AI-Powered Legal Learning &amp; Moot Court Assistant</span>
          </div>
          <p className="text-[11px] text-[#a29c8f] max-w-xl text-center sm:text-right">
            Educational practice only · Not legal advice · Not verified legal research
          </p>
        </div>
      </footer>
    </div>
  );
};
