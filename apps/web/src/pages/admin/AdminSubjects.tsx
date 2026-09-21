import { useEffect, useState } from 'react';
import { createSubject, fetchSubjects } from '@/lib/admin';
import type { ApiError, SubjectItem } from '@/types';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [boardClass, setBoardClass] = useState('CBSE_12');
  const [stream, setStream] = useState('SCIENCE');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSubjects();
  }, [selectedClass, selectedStream]);

  function loadSubjects() {
    setLoading(true);
    const cls = selectedClass !== 'ALL' ? selectedClass : undefined;
    const stm = selectedStream !== 'ALL' ? selectedStream : undefined;

    fetchSubjects(cls, stm)
      .then(setSubjects)
      .catch((err: ApiError) => setError(err.message ?? 'Could not load subjects.'))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await createSubject({ name, code, boardClass, stream });
      setSuccess(`Subject "${created.name}" (${created.code}) created successfully!`);
      setName('');
      setCode('');
      loadSubjects();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message ?? 'Could not create subject.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <p className="pen text-2xl mb-1">academic setup</p>
        <h1 className="mb-2">Subject Manager (Class 10 & 12 Streams)</h1>
        <p className="text-ink-soft">
          Manage subjects across Class 10 (General) and Class 12 (Science, Commerce, Humanities).
        </p>
      </div>

      {/* Add New Subject Form */}
      <section className="p-6 rounded-lg bg-paper-warm border border-ink/10">
        <h2 className="text-lg font-bold mb-4">Add New Subject</h2>
        {success && <div className="mb-4 p-3 rounded bg-green/10 text-green text-sm">✓ {success}</div>}
        {error && <div className="mb-4 p-3 rounded bg-pen-soft text-pen text-sm">{error}</div>}

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Subject Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-ink/20 rounded text-sm focus:outline-none focus:border-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Subject Code</label>
            <input
              type="text"
              required
              placeholder="e.g. COMP_SCI"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-ink/20 rounded text-sm uppercase focus:outline-none focus:border-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Board Class</label>
            <select
              value={boardClass}
              onChange={(e) => {
                setBoardClass(e.target.value);
                if (e.target.value === 'CBSE_10') setStream('GENERAL');
              }}
              className="w-full px-3 py-2 border border-ink/20 rounded text-sm focus:outline-none focus:border-blue bg-white"
            >
              <option value="CBSE_12">Class 12</option>
              <option value="CBSE_10">Class 10</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Stream</label>
            <select
              value={stream}
              disabled={boardClass === 'CBSE_10'}
              onChange={(e) => setStream(e.target.value)}
              className="w-full px-3 py-2 border border-ink/20 rounded text-sm focus:outline-none focus:border-blue bg-white disabled:bg-gray-100"
            >
              <option value="SCIENCE">Science</option>
              <option value="COMMERCE">Commerce</option>
              <option value="HUMANITIES">Humanities</option>
              <option value="GENERAL">General (Class 10)</option>
            </select>
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button type="submit" disabled={submitting} className="btn btn-primary text-sm px-6">
              {submitting ? 'Creating Subject…' : 'Add Subject to Database'}
            </button>
          </div>
        </form>
      </section>

      {/* Filter & Subject Directory */}
      <section className="p-6 rounded-lg bg-paper-warm border border-ink/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-lg font-bold">Active Subject Database ({subjects.length})</h2>

          <div className="flex gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 border border-ink/20 rounded text-xs bg-white"
            >
              <option value="ALL">All Classes</option>
              <option value="CBSE_12">Class 12</option>
              <option value="CBSE_10">Class 10</option>
            </select>

            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-3 py-1.5 border border-ink/20 rounded text-xs bg-white"
            >
              <option value="ALL">All Streams</option>
              <option value="SCIENCE">Science</option>
              <option value="COMMERCE">Commerce</option>
              <option value="HUMANITIES">Humanities</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-ink-soft text-sm">Loading subjects from database…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div key={sub.id || sub.code} className="p-4 rounded bg-paper border border-ink/10">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-ink text-base">{sub.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-wash text-blue-deep font-semibold">
                    {sub.code}
                  </span>
                </div>
                <div className="flex gap-2 text-xs text-ink-faint mt-2">
                  <span className="px-2 py-0.5 rounded bg-ink/5 font-medium">{sub.boardClass.replace('_', ' ')}</span>
                  <span className="px-2 py-0.5 rounded bg-ink/5 font-medium">{sub.stream}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
