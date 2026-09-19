import type { CaseSession, CaseInput } from '../types/legal';

const STORAGE_KEY_SESSIONS = 'ai_court_case_sessions_v1';
const STORAGE_KEY_DRAFT = 'ai_court_active_draft_v1';
const STORAGE_KEY_SETTINGS = 'ai_court_app_settings_v1';

export interface AppSettings {
  forceMockMode: boolean;
  autoSave: boolean;
  theme: 'dark' | 'light' | 'system';
}

const DEFAULT_SETTINGS: AppSettings = {
  forceMockMode: false,
  autoSave: true,
  theme: 'dark'
};

export const storageService = {
  getSessions(): CaseSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to read sessions from localStorage:', err);
      return [];
    }
  },

  saveSession(session: CaseSession): void {
    try {
      const sessions = this.getSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session);
      }
      // Limit to 50 most recent sessions to avoid localStorage quota exhaustion
      const trimmed = sessions.slice(0, 50);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(trimmed));
    } catch (err) {
      console.error('Failed to save session to localStorage:', err);
    }
  },

  deleteSession(id: string): CaseSession[] {
    try {
      const sessions = this.getSessions().filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      return sessions;
    } catch (err) {
      console.error('Failed to delete session from localStorage:', err);
      return [];
    }
  },

  clearAllSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_SESSIONS);
    } catch (err) {
      console.error('Failed to clear sessions from localStorage:', err);
    }
  },

  getActiveDraft(): CaseInput | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load active draft:', err);
      return null;
    }
  },

  saveActiveDraft(draft: CaseInput): void {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
    } catch (err) {
      console.error('Failed to save active draft:', err);
    }
  },

  clearActiveDraft(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_DRAFT);
    } catch (err) {
      console.error('Failed to clear active draft:', err);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
};
