import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: wire to POST /api/auth/forgot-password once backend endpoint exists
    setSent(true);
  }

  return (
    <>
      <h1 className="text-2xl mb-6">Reset your password</h1>
      {sent ? (
        <p className="text-ink-soft">
          If that email is on file, we&apos;ve sent a reset link. Check your inbox.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
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
          <button type="submit" className="btn btn-primary w-full justify-center">
            Send reset link
          </button>
        </form>
      )}
      <p className="text-sm text-ink-soft mt-6">
        <Link to="/auth/login" className="text-blue underline">Back to log in</Link>
      </p>
    </>
  );
}
