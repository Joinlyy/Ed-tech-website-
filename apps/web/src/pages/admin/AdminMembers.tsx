import { useEffect, useState } from 'react';
import { fetchMembers } from '@/lib/admin';
import type { User } from '@/types';

export default function AdminMembers() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'PARENT' | 'STAFF' | 'ADMIN' | 'SUB_ADMIN'>('ALL');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load member directory');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const matchesQuery =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesQuery;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-pen-soft text-pen border border-pen/20">
            🛡️ ADMIN
          </span>
        );
      case 'SUB_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            🔑 SUB_ADMIN
          </span>
        );
      case 'PARENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
            👨‍👩‍👧 PARENT
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-wash text-accent border border-accent/20">
            👨‍🏫 STAFF
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
            🎓 STUDENT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <h1 className="text-2xl font-bold font-display text-ink">Member & Student Directory</h1>
        </div>
        <p className="text-sm text-ink-soft mt-1">
          Complete database of registered parents, students, staff, and sub-admin accounts across RedPen.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-pen-soft border border-pen/20 text-pen rounded-lg flex items-center gap-3 text-sm">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-paper-warm rounded-xl border border-ink/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        {/* Role Tabs */}
        <div className="flex items-center gap-1 bg-paper p-1 rounded-lg border border-ink/10 overflow-x-auto">
          {(['ALL', 'STUDENT', 'PARENT', 'STAFF', 'SUB_ADMIN', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-colors whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-paper-warm text-accent shadow-sm font-semibold'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-paper border border-ink/20 rounded-lg text-ink focus:outline-none focus:border-accent text-xs"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-paper-warm rounded-xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-ink/10 flex items-center justify-between">
          <span className="text-xs text-ink-soft font-mono">
            Showing <strong className="text-ink">{filteredMembers.length}</strong> of {members.length} records
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-ink-soft flex items-center justify-center gap-2 text-sm">
            <span className="animate-spin text-lg">⏳</span>
            Loading member directory...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-ink-soft">
            <div className="text-4xl mb-3">👥</div>
            <p className="font-medium text-ink">No members found matching your search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-ink-soft border-b border-ink/10 font-medium">
                <tr>
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Class & Stream</th>
                  <th className="py-3.5 px-4">Active Plan</th>
                  <th className="py-3.5 px-4">Papers Remaining</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-paper/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-wash text-accent font-bold flex items-center justify-center text-xs font-mono">
                          {m.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-ink text-xs">{m.fullName}</div>
                          <div className="text-[11px] text-ink-soft">{m.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getRoleBadge(m.role)}</td>

                    <td className="py-3.5 px-4 text-xs font-mono text-ink-soft">
                      {m.targetClass ? (
                        <span>
                          {m.targetClass} {m.stream ? `(${m.stream})` : ''}
                        </span>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {m.activePlan ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-success border border-green-200 rounded text-[11px] font-mono font-medium">
                          ✓ {m.activePlan}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-ink-faint border border-slate-200 rounded text-[11px] font-mono">
                          ✕ NO_PLAN
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono">
                      <span className="font-bold text-accent">{m.papersRemaining ?? 0}</span> papers
                    </td>

                    <td className="py-3.5 px-4 text-xs text-ink-soft font-mono">
                      {new Date(m.createdAt).toLocaleDateString('en-IN', {
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
    </div>
  );
}
