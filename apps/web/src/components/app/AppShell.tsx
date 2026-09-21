import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchFamily } from '@/lib/checkout';
import type { UserRole } from '@/types';

interface NavSection {
  to: string;
  label: string;
  roles: readonly UserRole[];
}

const mainSections: readonly NavSection[] = [
  { to: '/portal/dashboard', label: 'Dashboard', roles: ['CLIENT', 'PARENT', 'STUDENT', 'STAFF', 'ADMIN', 'SUB_ADMIN'] },
  { to: '/portal/exam-board', label: 'Exam Board', roles: ['CLIENT', 'PARENT', 'STUDENT'] },
  { to: '/portal/reports', label: 'Evaluation Reports', roles: ['CLIENT', 'PARENT', 'STUDENT'] },
  { to: '/portal/settings', label: 'Settings & Family', roles: ['PARENT'] },
  { to: '/staff/dashboard', label: 'Staff Queue', roles: ['STAFF', 'ADMIN', 'SUB_ADMIN'] },
];

const adminSections: readonly NavSection[] = [
  { to: '/admin/dashboard', label: 'Admin Overview', roles: ['ADMIN', 'SUB_ADMIN'] },
  { to: '/admin/subjects', label: 'Subjects & Streams', roles: ['ADMIN', 'SUB_ADMIN'] },
  { to: '/admin/question-papers', label: 'Question Papers', roles: ['ADMIN', 'SUB_ADMIN'] },
  { to: '/admin/sub-admins', label: 'Sub-Admin Staff', roles: ['ADMIN'] },
  { to: '/admin/members', label: 'Member Directory', roles: ['ADMIN', 'SUB_ADMIN'] },
  { to: '/admin/payments', label: 'Payment Ledger', roles: ['ADMIN', 'SUB_ADMIN'] },
  { to: '/admin/reports', label: 'AI Report Control', roles: ['ADMIN', 'SUB_ADMIN'] },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isUnpaid, setIsUnpaid] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user && user.role === 'PARENT') {
      fetchFamily()
        .then((f) => {
          setIsUnpaid(!f || !f.active);
        })
        .catch(() => {
          setIsUnpaid(true);
        });
    }
  }, [user]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isAdminOrSubAdmin = user && (user.role === 'ADMIN' || user.role === 'SUB_ADMIN');

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display font-extrabold text-ink text-xl">
            RedPen
          </Link>
          <span className="text-xs text-ink-faint font-mono px-2 py-0.5 bg-paper rounded border border-ink/10">
            {user?.role === 'PARENT'
              ? 'Parent Account'
              : user?.role === 'STUDENT'
              ? 'Student Account'
              : user?.role}
          </span>
        </div>

        <nav className="mt-6 space-y-6">
          <div>
            <div className="text-[11px] font-mono text-ink-faint uppercase tracking-wider mb-2 font-semibold">
              Portal Menu
            </div>
            <ul className="space-y-1">
              {mainSections
                .filter((s) => user && s.roles.includes(user.role))
                .map((s) => (
                  <li key={s.to}>
                    <NavLink
                      to={s.to}
                      className={({ isActive }) =>
                        'block px-3 py-2 rounded text-xs font-medium transition-all ' +
                        (isActive
                          ? 'bg-blue-wash text-accent font-bold border-l-4 border-accent shadow-sm'
                          : 'text-ink-soft hover:bg-blue-wash/60 hover:text-ink')
                      }
                    >
                      {s.label}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>

          {isAdminOrSubAdmin && (
            <div>
              <div className="text-[11px] font-mono text-accent uppercase tracking-wider mb-2 font-semibold flex items-center justify-between">
                <span>Admin Suite</span>
                <span className="px-1.5 py-0.5 bg-blue-wash text-accent rounded text-[9px] font-bold">KING</span>
              </div>
              <ul className="space-y-1">
                {adminSections
                  .filter((s) => user && s.roles.includes(user.role))
                  .map((s) => (
                    <li key={s.to}>
                      <NavLink
                        to={s.to}
                        className={({ isActive }) =>
                          'block px-3 py-2 rounded text-xs font-medium transition-all ' +
                          (isActive
                            ? 'bg-blue-wash text-accent font-bold border-l-4 border-accent shadow-sm'
                            : 'text-ink-soft hover:bg-paper/80 hover:text-ink')
                        }
                      >
                        {s.label}
                      </NavLink>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </nav>
      </div>

      <div className="pt-4 border-t border-ink/10 mt-6">
        <div className="mb-3">
          <p className="text-xs font-semibold text-ink truncate">{user?.fullName}</p>
          <p className="text-xs text-ink-faint truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-pen hover:underline font-semibold transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-ink/10 bg-paper-warm p-6 min-h-screen flex-shrink-0">
        {navContent}
      </aside>

      {/* Mobile Top Navbar Bar */}
      <header className="md:hidden bg-paper-warm border-b border-ink/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="font-display font-extrabold text-ink text-lg">
          RedPen
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-accent font-bold px-2 py-0.5 bg-blue-wash rounded">
            {user?.role}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-ink/10 rounded-lg text-ink font-bold hover:bg-paper text-sm"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex">
          <div className="w-72 bg-paper-warm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            {navContent}
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Unpaid Paywall Banner for Parent Accounts without active plan */}
        {user?.role === 'PARENT' && isUnpaid && (
          <div className="bg-amber-500 text-white px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 shadow-sm">
            <div className="text-sm font-medium">
              ⚠️ <strong>Subscription Inactive:</strong> Activate a paper bundle plan to unlock board exams, evaluator reports, and student accounts.
            </div>
            <Link
              to="/checkout"
              className="bg-white text-amber-900 font-bold px-4 py-1.5 rounded text-xs hover:bg-amber-100 whitespace-nowrap"
            >
              Choose Plan & Activate →
            </Link>
          </div>
        )}

        <main className="p-4 sm:p-6 md:p-10 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
