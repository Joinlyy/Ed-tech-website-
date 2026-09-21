import { Link } from 'react-router-dom';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`logo flex items-center gap-2 font-display font-extrabold text-ink ${className}`}
      aria-label="RedPen home"
      style={{ fontSize: '1.32rem', letterSpacing: '-0.03em' }}
    >
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ flex: 'none' }}>
        <path
          d="M4 17.5 L12 25 L28 5"
          stroke="#D93A2B"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      RedPen
    </Link>
  );
}
