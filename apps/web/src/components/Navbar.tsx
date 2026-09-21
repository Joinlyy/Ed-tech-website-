import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { navLinks } from '@/config/site';
import { useAuth } from '@/hooks/useAuth';
import Logo from './Logo';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        backdropFilter: 'blur(12px)',
        background: 'rgba(247,250,255,0.86)',
        borderBottom: '1px solid rgba(44,95,246,0.1)',
      }}
    >
      <div className="wrap">
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            height: 76,
          }}
        >
          <Logo />
          <div
            id="primary-nav"
            className={`navlinks ${open ? 'open' : ''}`}
            style={{ gap: 30, fontSize: '0.97rem', fontWeight: 500, color: '#16233F' }}
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            {/* Only visible inside the mobile menu — the header CTA is hidden on small screens */}
            {isAuthenticated ? (
              <Link
                to="/portal/dashboard"
                className="btn btn-sm btn-primary nav-cta-mobile"
                onClick={() => setOpen(false)}
              >
                Go to portal
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="btn btn-sm btn-primary nav-cta-mobile"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Link to="/portal/dashboard" className="btn btn-sm btn-primary nav-cta-primary">
                  {user?.fullName?.split(' ')[0] ?? 'Portal'}
                </Link>
                <button
                  onClick={logout}
                  className="nav-cta-primary text-ink-soft hover:text-pen text-sm bg-transparent border-0 cursor-pointer"
                  style={{ padding: '6px 4px' }}
                  aria-label="Log out"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link to="/auth/login" className="btn btn-sm btn-primary nav-cta-primary">
                Log in
              </Link>
            )}
            <button
              className="menu-btn"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="primary-nav"
              onClick={() => setOpen((o) => !o)}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                {open ? (
                  <>
                    <path d="M6 6 L20 20" stroke="#16233F" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M20 6 L6 20" stroke="#16233F" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <path d="M4 8 L22 8" stroke="#16233F" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M4 14 L22 14" stroke="#16233F" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M4 20 L22 20" stroke="#16233F" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
