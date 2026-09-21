import { useEffect, useState, FormEvent } from 'react';
import { fetchSubAdmins, createSubAdmin } from '@/lib/admin';
import type { SubAdminUser, AdminPermission } from '@/types';

const PERMISSION_OPTIONS: { id: AdminPermission; label: string; description: string }[] = [
  {
    id: 'MANAGE_PAPERS',
    label: 'Manage Question Papers',
    description: 'Upload, edit, and delete CBSE question papers and answer keys.',
  },
  {
    id: 'MANAGE_SUBJECTS',
    label: 'Manage Subjects',
    description: 'Add and configure Class 10/12 subjects and streams.',
  },
  {
    id: 'MANAGE_USERS',
    label: 'Manage Members & Students',
    description: 'View and manage student, parent, and staff accounts.',
  },
  {
    id: 'VIEW_PAYMENTS',
    label: 'View Payment Ledger',
    description: 'Access Razorpay order history, revenue metrics, and plan purchases.',
  },
  {
    id: 'REGENERATE_REPORTS',
    label: 'Re-generate Reports',
    description: 'Trigger AI re-evaluations and re-generate diagnostic reports for students.',
  },
];

export default function AdminSubAdmins() {
  const [subAdmins, setSubAdmins] = useState<SubAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([
    'MANAGE_PAPERS',
    'MANAGE_SUBJECTS',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadSubAdmins();
  }, []);

  const loadSubAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSubAdmins();
      setSubAdmins(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load sub-admin team members');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (perm: AdminPermission) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleCreateSubAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (selectedPermissions.length === 0) {
      setFormError('Please assign at least one permission to the sub-admin.');
      return;
    }

    try {
      setSubmitting(true);
      await createSubAdmin({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        permissions: selectedPermissions,
      });
      setShowModal(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setSelectedPermissions(['MANAGE_PAPERS', 'MANAGE_SUBJECTS']);
      await loadSubAdmins();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create sub-admin user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="bg-paper-warm p-6 rounded-xl border border-ink/10 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-2xl font-bold font-display text-ink">Sub-Admin Roles &amp; Permissions</h1>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            Delegate operational access to staff with granular checkbox-based permission control.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent hover:bg-blue-deep text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer border border-accent shrink-0"
        >
          <span className="text-base">➕</span>
          <span>Add Sub-Admin Staff</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-pen-soft border border-pen/20 text-pen rounded-lg flex items-center gap-3 text-sm">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Sub-Admins Table / List */}
      <div className="bg-paper-warm rounded-xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-ink/10 flex items-center justify-between">
          <h2 className="font-semibold font-display text-ink">Active Sub-Admin Staff</h2>
          <span className="text-xs px-2.5 py-1 bg-blue-wash text-accent rounded-full font-mono font-medium">
            {subAdmins.length} Members
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-ink-soft flex items-center justify-center gap-2 text-sm">
            <span className="animate-spin text-lg">⏳</span>
            Loading sub-admin team...
          </div>
        ) : subAdmins.length === 0 ? (
          <div className="p-12 text-center text-ink-soft">
            <div className="text-4xl mb-3">🛡️</div>
            <p className="font-medium text-ink">No sub-admin accounts created yet.</p>
            <p className="text-xs mt-1">Click "Add Sub-Admin" above to grant controlled operational access.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-ink-soft border-b border-ink/10 font-medium">
                <tr>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Granted Permissions</th>
                  <th className="py-3.5 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {subAdmins.map((subAdmin) => (
                  <tr key={subAdmin.id} className="hover:bg-paper/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-wash flex items-center justify-center font-bold text-accent font-mono text-sm">
                          {subAdmin.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-ink">{subAdmin.fullName}</div>
                          <div className="text-xs text-ink-soft">{subAdmin.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-mono font-medium">
                        🔑 SUB_ADMIN
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {subAdmin.permissions && subAdmin.permissions.length > 0 ? (
                          subAdmin.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="px-2 py-0.5 bg-blue-wash text-accent rounded text-[11px] font-mono font-medium"
                            >
                              {perm}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-ink-faint italic">No permissions assigned</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-ink-soft text-xs font-mono">
                      {new Date(subAdmin.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Creating Sub-Admin */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-paper-warm rounded-xl border border-ink/10 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <h3 className="text-lg font-bold font-display text-ink">Create Sub-Admin Staff</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-soft hover:text-ink text-xl font-bold px-2"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-pen-soft border border-pen/20 text-pen text-xs rounded-lg flex items-center gap-2">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubAdmin} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-ink text-xs mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rajesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-ink/20 rounded-lg text-ink focus:outline-none focus:border-accent text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-ink text-xs mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@redpen.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-ink/20 rounded-lg text-ink focus:outline-none focus:border-accent text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-ink text-xs mb-1">Initial Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-paper border border-ink/20 rounded-lg text-ink focus:outline-none focus:border-accent text-sm pr-10"
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
              </div>

              <div>
                <label className="block font-medium text-ink text-xs mb-2">
                  Assign Checkbox Permissions *
                </label>
                <div className="space-y-2 border border-ink/10 rounded-lg p-3 bg-paper/50 max-h-56 overflow-y-auto">
                  {PERMISSION_OPTIONS.map((opt) => {
                    const isChecked = selectedPermissions.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => togglePermission(opt.id)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-wash/60 border-accent/40 text-ink'
                            : 'bg-paper-warm border-ink/10 hover:border-ink/20 text-ink-soft'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 rounded border-ink/20 text-accent focus:ring-accent"
                        />
                        <div>
                          <div className="font-semibold text-xs text-ink">{opt.label}</div>
                          <div className="text-[11px] text-ink-soft mt-0.5">{opt.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-ink/20 rounded-lg text-ink hover:bg-paper transition-colors text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-blue-deep text-white font-medium rounded-lg transition-colors text-xs disabled:opacity-50"
                >
                  {submitting && <span className="animate-spin">⏳</span>}
                  Create Sub-Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
