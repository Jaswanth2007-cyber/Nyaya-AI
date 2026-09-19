import { useState, useEffect } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { WorkspacePage } from './components/workspace/WorkspacePage';
import { useTheme } from './hooks/useTheme';
import { authService, DEMO_MODE_KEY } from './services/api';

export type AppView = 'landing' | 'auth' | 'workspace';


export function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { theme, toggleTheme } = useTheme();

  // Resume a real, still-valid backend session on reload (verified against the
  // server, not just "a token exists"); also resume a client-only demo session.
  useEffect(() => {
    if (localStorage.getItem(DEMO_MODE_KEY)) {
      setCurrentView('workspace');
      return;
    }
    if (authService.isAuthenticated()) {
      authService.me().then(user => {
        if (user) setCurrentView('workspace');
      });
    }
  }, []);

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

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem(DEMO_MODE_KEY);
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
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
