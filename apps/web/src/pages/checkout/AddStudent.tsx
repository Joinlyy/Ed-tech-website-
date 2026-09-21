import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { addStudent } from '@/lib/checkout';
import type { ApiError } from '@/types';

/** 12-char random password: [a-z A-Z 0-9] with at least one of each. */
function suggestPassword(): string {
  const bag = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const arr = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(arr, (n) => bag[n % bag.length]).join('');
}

export default function AddStudent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(() => suggestPassword());
  const [showPw, setShowPw] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await addStudent({ fullName, email, password });
      setCreated({ email, password });
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message ?? 'Could not create the student login.');
    } finally {
      setBusy(false);
    }
  }

  // Success screen — parent copies the credentials and shares them out-of-band.
  if (created) {
    return (
      <div className="wrap py-16 max-w-xl">
        <p className="pen text-2xl mb-2">payment received</p>
        <h1 className="mb-4">Your student is set up.</h1>
        <p className="text-ink-soft mb-6">
          Share these credentials with your child through WhatsApp, verbally, or a written note.
          We never email a password.
        </p>

        <div className="p-5 rounded-md bg-blue-wash border border-blue/20 mb-6 font-mono text-sm">
          <div className="mb-2">
            <span className="text-ink-faint">email:</span> <span className="text-ink font-semibold">{created.email}</span>
          </div>
          <div>
            <span className="text-ink-faint">password:</span> <span className="text-ink font-semibold">{created.password}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className="btn"
            onClick={() =>
              navigator.clipboard?.writeText(`RedPen login\nemail: ${created.email}\npassword: ${created.password}`)
            }
          >
            Copy to clipboard
          </button>
          <Link to="/portal/dashboard" className="btn btn-primary">
            Go to my portal
          </Link>
        </div>

        <p className="text-xs text-ink-faint mt-6">
          Your child can change this password from their own portal after logging in.
        </p>
      </div>
    );
  }

  return (
    <div className="wrap py-16 max-w-xl">
      <p className="pen text-2xl mb-2">one more step</p>
      <h1 className="mb-2">Create your student&apos;s login</h1>
      <p className="text-ink-soft mb-6">
        Pick an email &amp; password for your child. You&apos;ll share these with them so they can
        upload their scripts from their own phone. Signed in as{' '}
        <span className="text-ink font-medium">{user?.email}</span>.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-ink font-medium">Student&apos;s name</span>
          <input
            required
            minLength={2}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full border-2 border-ink/15 rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-ink font-medium">Student&apos;s email</span>
          <input
            type="email"
            required
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border-2 border-ink/15 rounded px-3 py-2"
          />
          <span className="text-xs text-ink-faint">
            Can be a fresh email or one your child already uses. Must be unique on RedPen.
          </span>
        </label>

        <label className="block">
          <span className="text-sm text-ink font-medium">Password (you pick, share with child)</span>
          <div className="mt-1 flex gap-2">
            <input
              type={showPw ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 border-2 border-ink/15 rounded px-3 py-2 font-mono"
            />
            <button
              type="button"
              className="btn btn-sm px-3 flex items-center justify-center text-ink-soft hover:text-ink"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              title={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? (
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
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setPassword(suggestPassword())}
              title="Regenerate a random password"
            >
              ↻
            </button>
          </div>
          <span className="text-xs text-ink-faint">
            At least 8 characters. We&apos;ll never email this — you share it directly with your child.
          </span>
        </label>

        {error && (
          <p className="text-pen text-sm" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
          {busy ? 'Creating…' : 'Create student login'}
        </button>
      </form>
    </div>
  );
}
