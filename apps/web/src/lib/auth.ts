import type { AuthResponse, LoginRequest, User } from '@/types';
import { apiRequest } from '@/lib/api';

const TOKEN_KEY = 'redpen.auth.token';
const USER_KEY = 'redpen.auth.user';
const AUTH_EVENT = 'redpen.auth.change';

/** Fired after any login / logout in this tab so useAuth can re-read state. */
function announce(): void {
  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {
    /* SSR / non-browser env — noop */
  }
}

export const AUTH_CHANGE_EVENT = AUTH_EVENT;

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persist(response: AuthResponse): void {
  try {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  } catch {
    /* storage unavailable — degrade to in-memory only for this tab */
  }
  announce();
}

/** Password login. STUDENT / STAFF / ADMIN. Parents use loginWithGoogle. */
export async function login(request: LoginRequest): Promise<User> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: request,
    auth: false,
  });
  persist(response);
  return response.user;
}

/**
 * Exchange a Google ID token for our app JWT. The idToken comes from
 * Google Identity Services in the browser — the backend verifies it against
 * Google's public keys server-side.
 */
export async function loginWithGoogle(idToken: string): Promise<User> {
  const response = await apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: { idToken },
    auth: false,
  });
  persist(response);
  return response.user;
}

export function logout(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* noop */
  }
  announce();
}
