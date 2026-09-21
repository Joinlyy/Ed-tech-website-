import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, loginWithGoogle } from '@/lib/auth';
import { renderGoogleSignInButton } from '@/lib/google';
import type { ApiError } from '@/types';

/** Parse ?next=/some/path from the URL. Falls back to /portal/dashboard. */
function useNext(): string {
  const loc = useLocation();
  const search = new URLSearchParams(loc.search);
  const raw = search.get('next');
  // Guard against open-redirect: only accept in-app paths.
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/portal/dashboard';
}

export default function Login() {
  const nav = useNavigate();
  const next = useNext();

  const btnRef = useRef<HTMLDivElement | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Render the Google button once — GIS is loaded from index.html.
  useEffect(() => {
    if (!btnRef.current) return;
    renderGoogleSignInButton({
      container: btnRef.current,
      text: 'continue_with',
      onCredential: async (idToken) => {
        try {
          setBusy(true);
          setGoogleError(null);
          await loginWithGoogle(idToken);
          nav(next, { replace: true });
        } catch (err) {
          const apiErr = err as ApiError;
          setGoogleError(apiErr.message ?? 'Google sign-in failed.');
        } finally {
          setBusy(false);
        }
      },
    }).catch((err) => {
      setGoogleError(err instanceof Error ? err.message : 'Could not load Google sign-in.');
    });
  }, [nav, next]);

  // ── Password form (STUDENT / STAFF / ADMIN) ──────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  async function onPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwBusy(true);
    try {
      await login({ email, password });
      nav(next, { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      setPwError(apiErr.message ?? 'Login failed. Try again.');
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl mb-2">Welcome to RedPen</h1>
      <p className="text-ink-soft text-sm mb-6">
        Parents sign in with Google. Students and staff log in with the email &amp; password their parent (or admin) set.
      </p>

      {/* ── Parents: Google ── */}
      <div className="mb-2">
        <div className="text-xs uppercase tracking-wider text-ink-faint mb-3 font-semibold">
          Parents
        </div>
        <div ref={btnRef} aria-label="Sign in with Google" />
        {busy && <p className="text-ink-soft text-sm mt-2">Signing you in…</p>}
        {googleError && (
          <p className="text-pen text-sm mt-2" role="alert">
            {googleError}
          </p>
        )}
      </div>

      <div
        className="flex items-center gap-3 my-6 text-ink-faint text-xs uppercase tracking-wider"
        aria-hidden="true"
      >
        <span className="flex-1 h-px bg-ink/10" />
        or
        <span className="flex-1 h-px bg-ink/10" />
      </div>

      {/* ── Students / Staff / Admin: password ── */}
      <div>
        <div className="text-xs uppercase tracking-wider text-ink-faint mb-3 font-semibold">
          Students &amp; staff
        </div>
        <form onSubmit={onPasswordSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm text-ink font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border-2 border-ink/15 rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink font-medium">Password</span>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-ink/15 rounded px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink focus:outline-none p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 013.122-.813c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.115-6.115a3 3 0 104.243 4.243M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          {pwError && (
            <p className="text-pen text-sm" role="alert">
              {pwError}
            </p>
          )}
          <button
            type="submit"
            disabled={pwBusy}
            className="btn w-full justify-center"
          >
            {pwBusy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>

      <p className="text-sm text-ink-soft mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/pricing" className="text-blue underline">
          See plans &amp; start
        </Link>
      </p>
    </>
  );
}
