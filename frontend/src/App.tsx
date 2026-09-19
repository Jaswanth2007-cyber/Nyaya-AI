import { useState } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { WorkspacePage } from './components/workspace/WorkspacePage';
import { useTheme } from './hooks/useTheme';

export type AppView = 'landing' | 'auth' | 'workspace';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { theme, toggleTheme } = useTheme();

  const handleGetStarted = () => {
    setAuthMode('signup');
    setCurrentView('auth');
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setCurrentView('auth');
  };

  const handleAuthSuccess = () => {
    setCurrentView('workspace');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 font-sans selection:bg-[#c9a463]/25 selection:text-white">
      {currentView === 'landing' && (
        <LandingPage
          onGetStarted={handleGetStarted}
          onSignIn={handleSignIn}
        />
      )}

      {currentView === 'auth' && (
        <AuthPage
          onSuccess={handleAuthSuccess}
          onBack={handleBackToLanding}
          initialMode={authMode}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {currentView === 'workspace' && (
        <WorkspacePage
          onBackToLanding={handleBackToLanding}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
