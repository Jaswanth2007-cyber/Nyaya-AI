import type {
  GenerateRequest,
  CounterargumentRequest,
  ExplainRequest,
  IracArgument,
  Counterargument,
  LegalExplanation,
  ApiHealthResponse,
  AuthResponse,
  AuthUser,
  ArgumentScore,
  CaseSession
} from '../types/legal';
import {
  getMockIracArgument,
  getMockCounterargument,
  getMockLegalExplanation,
  getMockArgumentScore
} from './mockData';

const TOKEN_KEY = 'nyaya_auth_token_v1';
export const DEMO_MODE_KEY = 'nyaya_demo_mode_v1';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // localStorage unavailable (private mode, quota) — session just won't persist across reloads.
  }
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

// Configurable API base URL with fallback to local proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, '') 
  : '';

interface RequestOptions {
  forceMock?: boolean;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export const apiService = {
  /**
   * Health check for backend connectivity
   */
  async checkHealth(): Promise<{ isHealthy: boolean; details?: ApiHealthResponse }> {
    try {
      const url = `${API_BASE_URL}/api/health`;
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }, 4000);

      if (response.ok) {
        const data: ApiHealthResponse = await response.json().catch(() => ({ status: 'ok' }));
        return { isHealthy: true, details: data };
      }
      return { isHealthy: false };
    } catch {
      return { isHealthy: false };
    }
  },

  /**
   * Generate IRAC practice argument (POST /api/generate)
   */
  async generateArgument(
    req: GenerateRequest,
    options?: RequestOptions
  ): Promise<{ data: IracArgument; isMock: boolean }> {
    if (options?.forceMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { data: getMockIracArgument(req), isMock: true };
    }

    try {
      const url = `${API_BASE_URL}/api/generate`;
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(req)
      }, options?.timeoutMs || 25000);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      
      const normalized: IracArgument = {
        issue: json.issue || json.Issue || req.issue,
        rule: json.rule || json.Rule || '',
        application: json.application || json.Application || '',
        conclusion: json.conclusion || json.Conclusion || '',
        general_principles: json.general_principles || json.generalPrinciples || json.principles || [],
        assumptions: json.assumptions || json.Assumptions || [],
        limitations: json.limitations || json.Limitations || [],
        educational_notice: json.educational_notice || json.educationalNotice || 'Educational practice brief only. Not formal legal advice.'
      };

      return { data: normalized, isMock: false };
    } catch (err) {
      console.warn('Backend /api/generate call failed or offline, using educational fallback:', err);
      await new Promise(resolve => setTimeout(resolve, 600));
      return { data: getMockIracArgument(req), isMock: true };
    }
  },

  /**
   * Generate counterargument for moot-court prep (POST /api/counterargument)
   */
  async generateCounterargument(
    req: CounterargumentRequest,
    options?: RequestOptions
  ): Promise<{ data: Counterargument; isMock: boolean }> {
    if (options?.forceMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { data: getMockCounterargument(req), isMock: true };
    }

    try {
      const url = `${API_BASE_URL}/api/counterargument`;
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(req)
      }, options?.timeoutMs || 25000);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const normalized: Counterargument = {
        opposition_position: json.opposition_position || json.oppositionPosition || '',
        opposing_arguments: json.opposing_arguments || json.opposingArguments || [],
        student_weaknesses: json.student_weaknesses || json.studentWeaknesses || [],
        rebuttal_directions: json.rebuttal_directions || json.rebuttalDirections || []
      };

      return { data: normalized, isMock: false };
    } catch (err) {
      console.warn('Backend /api/counterargument call failed or offline, using fallback:', err);
      await new Promise(resolve => setTimeout(resolve, 600));
      return { data: getMockCounterargument(req), isMock: true };
    }
  },

  /**
   * Explain legal reasoning in plain language (POST /api/explain)
   */
  async explainReasoning(
    req: ExplainRequest,
    options?: RequestOptions
  ): Promise<{ data: LegalExplanation; isMock: boolean }> {
    if (options?.forceMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { data: getMockLegalExplanation(req), isMock: true };
    }

    try {
      const url = `${API_BASE_URL}/api/explain`;
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(req)
      }, options?.timeoutMs || 25000);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const normalized: LegalExplanation = {
        plain_explanation: json.plain_explanation || json.plainExplanation || '',
        key_legal_terms: json.key_legal_terms || json.keyLegalTerms || [],
        reasoning_breakdown: json.reasoning_breakdown || json.reasoningBreakdown || [],
        nuances_limitations: json.nuances_limitations || json.nuancesLimitations || []
      };

      return { data: normalized, isMock: false };
    } catch (err) {
      console.warn('Backend /api/explain call failed or offline, using fallback:', err);
      await new Promise(resolve => setTimeout(resolve, 600));
      return { data: getMockLegalExplanation(req), isMock: true };
    }
  },

  /**
   * Score the persuasiveness/structure of a generated IRAC argument (POST /api/score)
   */
  async scoreArgument(
    req: { facts: string; issue: string; subject: string; jurisdiction: string; argument: IracArgument },
    options?: RequestOptions
  ): Promise<{ data: ArgumentScore; isMock: boolean }> {
    if (options?.forceMock) {
      await new Promise(resolve => setTimeout(resolve, 700));
      return { data: getMockArgumentScore(req.argument), isMock: true };
    }

    try {
      const url = `${API_BASE_URL}/api/score`;
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(req)
      }, options?.timeoutMs || 20000);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data: ArgumentScore = await res.json();
      return { data, isMock: false };
    } catch (err) {
      console.warn('Backend /api/score call failed or offline, using fallback:', err);
      await new Promise(resolve => setTimeout(resolve, 600));
      return { data: getMockArgumentScore(req.argument), isMock: true };
    }
  }
};

export const authService = {
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiRequestError(json.error || 'Signup failed', res.status);
    setAuthToken(json.token);
    return json;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiRequestError(json.error || 'Login failed', res.status);
    setAuthToken(json.token);
    return json;
  },

  async me(): Promise<AuthUser | null> {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/me`, {
        headers: { ...authHeaders() }
      }, 5000);
      if (!res.ok) {
        setAuthToken(null);
        return null;
      }
      const json = await res.json();
      return json.user;
    } catch {
      return null;
    }
  },

  logout(): void {
    setAuthToken(null);
  },

  isAuthenticated(): boolean {
    return Boolean(getAuthToken());
  }
};

export const sessionsApi = {
  async list(): Promise<CaseSession[]> {
    const res = await fetch(`${API_BASE_URL}/api/sessions`, { headers: { ...authHeaders() } });
    if (!res.ok) throw new ApiRequestError('Failed to load sessions', res.status);
    const json = await res.json();
    return json.sessions;
  },

  async save(session: CaseSession): Promise<CaseSession> {
    const res = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new ApiRequestError('Failed to save session', res.status);
    const json = await res.json();
    return json.session;
  },

  async remove(id: string): Promise<CaseSession[]> {
    const res = await fetch(`${API_BASE_URL}/api/sessions/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
    if (!res.ok) throw new ApiRequestError('Failed to delete session', res.status);
    const json = await res.json();
    return json.sessions;
  },

  async clearAll(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
    if (!res.ok) throw new ApiRequestError('Failed to clear sessions', res.status);
  }
};
