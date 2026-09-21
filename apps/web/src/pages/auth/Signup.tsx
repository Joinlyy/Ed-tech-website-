import { Link } from 'react-router-dom';

/**
 * Password sign-up is intentionally not offered any more.
 * Parents sign up implicitly when they Google-authenticate and pay
 * (see /pricing → checkout flow). Students are added by their parent
 * from the post-payment page.
 *
 * This page stays reachable so any stale "Sign up" link still lands somewhere
 * useful, but the CTA points at pricing.
 */
export default function Signup() {
  return (
    <>
      <h1 className="text-2xl mb-4">Create your family account</h1>
      <p className="text-ink-soft mb-6">
        RedPen accounts are created when a parent signs in with Google and picks a plan.
        No separate sign-up form — the fewer forms, the fewer things to remember.
      </p>
      <Link to="/pricing" className="btn btn-primary w-full justify-center">
        See plans &amp; start
      </Link>
      <p className="text-sm text-ink-soft mt-6">
        Already have an account? <Link to="/auth/login" className="text-blue underline">Log in</Link>
      </p>
    </>
  );
}
