import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/types';
import { AUTH_CHANGE_EVENT, getCurrentUser, logout as doLogout } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    // Same-tab changes fire our custom event; other-tab changes fire `storage`.
    window.addEventListener(AUTH_CHANGE_EVENT, refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'redpen.auth.user') refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  return { user, logout, isAuthenticated: user !== null };
}
