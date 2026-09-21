import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { addStudent, fetchFamily } from '@/lib/checkout';
import type { ApiError, FamilyView, User } from '@/types';

export default function Settings() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [family, setFamily] = useState<FamilyView | null>(null);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [familyError, setFamilyError] = useState<string | null>(null);

  // Student creation state
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentSuccess, setStudentSuccess] = useState<string | null>(null);
  const [studentError, setStudentError] = useState<string | null>(null);

  useEffect(() => {
    fetchFamily()
      .then(setFamily)
      .catch((err: ApiError) => {
        if (err.status === 404 || err.status === 402) {
          setFamilyError('No active subscription plan found. Please purchase a plan to create student IDs.');
        } else {
          setFamilyError(err.message ?? 'Could not load subscription settings.');
        }
      })
      .finally(() => setLoadingFamily(false));
  }, []);

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    setAddingStudent(true);
    setStudentError(null);
    setStudentSuccess(null);

    try {
      const createdStudent = await addStudent({
        fullName: studentName,
        email: studentEmail,
        password: studentPassword,
      });

      setStudentSuccess(`Student account created for ${createdStudent.fullName}! Credentials saved.`);
      setStudentName('');
      setStudentEmail('');
      setStudentPassword('');

      // Refresh family list
      fetchFamily().then(setFamily);
    } catch (err) {
      const apiErr = err as ApiError;
      setStudentError(apiErr.message ?? 'Could not add student account.');
    } finally {
      setAddingStudent(false);
    }
  }

  const planCode = family?.planCode ?? '';
  const isFivePapers = planCode === 'FIVE_PAPERS' || planCode === 'ONE_SUBJECT';
  const isTwelvePapers = planCode === 'TWELVE_PAPERS' || planCode === 'THREE_SUBJECTS';

  const maxStudents = family?.maxStudents ?? (isFivePapers ? 1 : 2);
  const currentStudentsCount = family?.students.length ?? 0;
  const isStudentLimitReached = currentStudentsCount >= maxStudents;

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <p className="pen text-2xl mb-1">account & family settings</p>
        <h1 className="mb-2">Parent Settings & Subscription</h1>
        <p className="text-ink-soft">
          Manage your subscription, upgrade paper packages, and create student accounts for your children.
        </p>
      </div>

      {/* Account Info Card */}
      <section className="p-6 rounded-lg bg-paper-warm border border-ink/10">
        <h2 className="text-lg font-bold mb-4">Parent Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ink-faint text-xs font-semibold uppercase block">Full Name</span>
            <span className="font-semibold text-ink text-base">{user?.fullName}</span>
          </div>
          <div>
            <span className="text-ink-faint text-xs font-semibold uppercase block">Parent Email</span>
            <span className="font-semibold text-ink text-base">{user?.email}</span>
          </div>
        </div>
      </section>

      {/* Subscription & Prorated Upgrades Card */}
      <section className="p-6 rounded-lg bg-paper-warm border border-ink/10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">Active Subscription & Paper Quota</h2>
            <p className="text-sm text-ink-soft mt-0.5">
              {family ? `Current Plan: ${family.planName ?? family.planCode}` : 'No active plan'}
            </p>
          </div>
          {family?.active && (
            <span className="px-3 py-1 rounded bg-green/10 text-green font-bold text-xs uppercase tracking-wider">
              Active Subscription
            </span>
          )}
        </div>

        {loadingFamily ? (
          <p className="text-ink-soft text-sm">Loading subscription details…</p>
        ) : familyError ? (
          <div className="p-4 rounded bg-amber-50 text-amber-900 border border-amber-200 text-sm">
            <p className="font-semibold mb-2">{familyError}</p>
            <Link to="/checkout" className="btn btn-primary text-xs px-4 py-2 inline-block">
              Choose a Paper Bundle Plan →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded bg-paper border border-ink/10">
              <div>
                <span className="text-xs text-ink-faint uppercase font-semibold">Total Paper Quota</span>
                <p className="font-display font-extrabold text-2xl text-ink mt-0.5">{family?.paperQuota ?? 5} Papers</p>
              </div>
              <div>
                <span className="text-xs text-ink-faint uppercase font-semibold">Valid Until</span>
                <p className="font-semibold text-ink mt-1 text-sm">
                  {family?.validUntil ? new Date(family.validUntil).toLocaleDateString() : '1 Year'}
                </p>
              </div>
              <div>
                <span className="text-xs text-ink-faint uppercase font-semibold">Student Account Limit</span>
                <p className="font-semibold text-ink mt-1 text-sm">
                  {currentStudentsCount} of {maxStudents} Account(s) Used
                </p>
              </div>
            </div>

            {/* Prorated Upgrades Section */}
            <div className="pt-4 border-t border-ink/10">
              <h3 className="font-bold text-base mb-2">Upgrade Package (Pay Only Difference)</h3>
              <p className="text-xs text-ink-soft mb-4">
                Upgrade your paper bundle at any time — you only pay the price difference.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isFivePapers && (
                  <div className="p-4 rounded border border-blue/30 bg-blue-wash/30 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-ink block">Upgrade to 12 Papers Bundle</span>
                      <span className="text-xs text-ink-soft">
                        Adds 7 more papers + 2nd Student Account · Pay difference <strong className="text-blue-deep font-bold">₹500</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => nav('/checkout?plan=TWELVE_PAPERS')}
                      className="btn btn-primary text-xs px-3 py-1.5 whitespace-nowrap"
                    >
                      Upgrade for ₹500
                    </button>
                  </div>
                )}

                {(isFivePapers || isTwelvePapers) && (
                  <div className="p-4 rounded border border-blue/30 bg-blue-wash/30 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-ink block">Upgrade to 20 Papers Bundle</span>
                      <span className="text-xs text-ink-soft">
                        {isFivePapers ? 'Full 20 papers + 2 Student Accounts · Pay ₹1,400' : 'Full 20 papers + 2 Student Accounts · Pay ₹900'}
                      </span>
                    </div>
                    <button
                      onClick={() => nav('/checkout?plan=TWENTY_PAPERS')}
                      className="btn btn-primary text-xs px-3 py-1.5 whitespace-nowrap"
                    >
                      Upgrade to 20 Papers
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Student Credentials Management Section */}
      <section className="p-6 rounded-lg bg-paper-warm border border-ink/10">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold">Child Student Accounts</h2>
          {family && (
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-wash text-blue-deep">
              {currentStudentsCount} / {maxStudents} Student Account(s) Used
            </span>
          )}
        </div>
        <p className="text-sm text-ink-soft mb-6">
          Create student login credentials for your child. (5 Papers plan allows 1 student account; 12 & 20 Papers plans allow up to 2 student accounts).
        </p>

        {studentSuccess && (
          <div className="mb-6 p-4 rounded bg-green/10 text-green border border-green/20 text-sm font-medium">
            ✓ {studentSuccess}
          </div>
        )}

        {studentError && (
          <div className="mb-6 p-4 rounded bg-pen-soft text-pen border border-pen/20 text-sm font-medium">
            {studentError}
          </div>
        )}

        {/* Limit Warning Banner */}
        {isStudentLimitReached && (
          <div className="mb-6 p-4 rounded bg-amber-50 text-amber-900 border border-amber-200 text-sm flex justify-between items-center">
            <div>
              <strong>Student Account Limit Reached:</strong> Your current plan allows up to {maxStudents} student account(s).
              {isFivePapers && ' Upgrade to the 12 Papers (₹1,099) or 20 Papers (₹1,999) plan to add a 2nd student account!'}
            </div>
            {isFivePapers && (
              <button
                onClick={() => nav('/checkout?plan=TWELVE_PAPERS')}
                className="btn btn-primary text-xs px-3 py-1.5 whitespace-nowrap ml-3"
              >
                Upgrade to 2 Accounts →
              </button>
            )}
          </div>
        )}

        {/* Form to add a student */}
        <form onSubmit={handleAddStudent} className="p-4 rounded bg-paper border border-ink/10 mb-8 space-y-4">
          <h3 className="font-bold text-sm">Add New Student Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Student Full Name</label>
              <input
                type="text"
                required
                disabled={isStudentLimitReached}
                placeholder="e.g. Rohan Pawar"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-ink/20 rounded text-sm focus:outline-none focus:border-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Student Email / ID</label>
              <input
                type="email"
                required
                disabled={isStudentLimitReached}
                placeholder="rohan@example.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full px-3 py-2 border border-ink/20 rounded text-sm focus:outline-none focus:border-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Password for Child</label>
              <div className="relative">
                <input
                  type={showStudentPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  disabled={isStudentLimitReached}
                  placeholder="At least 8 characters"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-ink/20 rounded text-sm focus:outline-none focus:border-blue disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowStudentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink focus:outline-none p-1"
                  aria-label={showStudentPassword ? 'Hide password' : 'Show password'}
                >
                  {showStudentPassword ? (
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
            </div>
          </div>
          <button
            type="submit"
            disabled={addingStudent || !family || isStudentLimitReached}
            className="btn btn-primary text-sm px-5"
          >
            {addingStudent ? 'Creating Student Account…' : 'Create Student Login'}
          </button>
        </form>

        {/* Existing Students List */}
        <div>
          <h3 className="font-bold text-sm mb-3">Created Student Accounts ({currentStudentsCount} / {maxStudents})</h3>
          {!family?.students || family.students.length === 0 ? (
            <p className="text-sm text-ink-faint italic">No student accounts created yet. Use the form above to add your child.</p>
          ) : (
            <div className="space-y-3">
              {family.students.map((st: User) => (
                <div key={st.id} className="p-3 rounded bg-paper border border-ink/10 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-ink block">{st.fullName}</span>
                    <span className="text-xs text-ink-soft">{st.email}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-wash text-blue-deep">
                    Role: STUDENT
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
