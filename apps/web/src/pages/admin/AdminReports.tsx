import { useState } from 'react';
import { regenerateReport } from '@/lib/admin';

interface DemoEvaluationReport {
  id: string;
  paperTitle: string;
  subjectCode: string;
  subjectName: string;
  boardClass: string;
  stream: string;
  studentName: string;
  scorePercentage: number;
  status: 'COMPLETED' | 'PENDING' | 'REGENERATING';
  lastEvaluatedAt: string;
}

const MOCK_REPORTS: DemoEvaluationReport[] = [
  {
    id: 'eval-101',
    paperTitle: 'Class 12 Physics Term 1 Mock Test 2026',
    subjectCode: 'PHYS-12',
    subjectName: 'Physics',
    boardClass: 'CBSE_12',
    stream: 'SCIENCE',
    studentName: 'Aarav Sharma',
    scorePercentage: 78,
    status: 'COMPLETED',
    lastEvaluatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'eval-102',
    paperTitle: 'Class 12 Accountancy Board Practice Set 1',
    subjectCode: 'ACCT-12',
    subjectName: 'Accountancy',
    boardClass: 'CBSE_12',
    stream: 'COMMERCE',
    studentName: 'Ananya Gupta',
    scorePercentage: 85,
    status: 'COMPLETED',
    lastEvaluatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'eval-103',
    paperTitle: 'Class 10 Mathematics Standard Model Paper',
    subjectCode: 'MATH-10',
    subjectName: 'Mathematics',
    boardClass: 'CBSE_10',
    stream: 'GENERAL',
    studentName: 'Rohan Verma',
    scorePercentage: 92,
    status: 'COMPLETED',
    lastEvaluatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'eval-104',
    paperTitle: 'Class 12 History Board Practice 2026',
    subjectCode: 'HIST-12',
    subjectName: 'History',
    boardClass: 'CBSE_12',
    stream: 'HUMANITIES',
    studentName: 'Meera Pillai',
    scorePercentage: 71,
    status: 'COMPLETED',
    lastEvaluatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export default function AdminReports() {
  const [reports, setReports] = useState<DemoEvaluationReport[]>(MOCK_REPORTS);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'ALL' | 'CBSE_10' | 'CBSE_12'>('ALL');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const handleRegenerate = async (report: DemoEvaluationReport) => {
    try {
      setRegeneratingId(report.id);
      setError(null);
      setSuccessMessage(null);

      // Call backend AI report regeneration service
      await regenerateReport(report.id);

      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? { ...r, status: 'COMPLETED', lastEvaluatedAt: new Date().toISOString() }
            : r
        )
      );

      setSuccessMessage(
        `AI Diagnostic Report for "${report.paperTitle}" successfully re-generated!`
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to re-generate AI evaluation report');
    } finally {
      setRegeneratingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesClass = classFilter === 'ALL' || r.boardClass === classFilter;
    const matchesQuery =
      r.paperTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="bg-paper-warm p-6 rounded-xl border border-ink/10 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-2xl font-bold font-display text-ink">Evaluation Reports &amp; AI Re-generation</h1>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            Monitor examiner AI evaluations, review diagnostic scoring breakdowns, and trigger 1-click re-generation of evaluation reports.
          </p>
        </div>

        <button
          onClick={() => {
            if (filteredReports.length > 0) {
              handleRegenerate(filteredReports[0]);
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent hover:bg-blue-deep text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer border border-accent shrink-0"
        >
          <span className="text-base">✨</span>
          <span>1-Click AI Re-generate</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-pen-soft border border-pen/20 text-pen rounded-lg flex items-center gap-3 text-sm">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-success rounded-lg flex items-center gap-3 text-sm">
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-paper-warm rounded-xl border border-ink/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-1 bg-paper p-1 rounded-lg border border-ink/10">
          <button
            onClick={() => setClassFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-colors ${
              classFilter === 'ALL'
                ? 'bg-paper-warm text-accent shadow-sm font-semibold'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setClassFilter('CBSE_10')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-colors ${
              classFilter === 'CBSE_10'
                ? 'bg-paper-warm text-accent shadow-sm font-semibold'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            Class 10
          </button>
          <button
            onClick={() => setClassFilter('CBSE_12')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-colors ${
              classFilter === 'CBSE_12'
                ? 'bg-paper-warm text-accent shadow-sm font-semibold'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            Class 12
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="🔍 Search by paper, subject, student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-paper border border-ink/20 rounded-lg text-ink focus:outline-none focus:border-accent text-xs"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-paper-warm rounded-xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-ink/10 flex items-center justify-between">
          <h2 className="font-semibold font-display text-ink">Diagnostic AI Reports</h2>
          <span className="text-xs px-2.5 py-1 bg-blue-wash text-accent rounded-full font-mono font-medium">
            {filteredReports.length} Reports
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-ink-soft">
            <div className="text-4xl mb-3">📚</div>
            <p className="font-medium text-ink">No evaluation reports found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-ink-soft border-b border-ink/10 font-medium">
                <tr>
                  <th className="py-3.5 px-4">Evaluation Details</th>
                  <th className="py-3.5 px-4">Subject & Class</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">AI Score</th>
                  <th className="py-3.5 px-4">Last Evaluated</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-paper/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ink text-xs">{report.paperTitle}</div>
                      <div className="text-[11px] font-mono text-ink-soft">Ref ID: {report.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-ink">{report.subjectName}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="px-1.5 py-0.5 bg-blue-wash text-accent rounded text-[10px] font-mono font-medium">
                          {report.boardClass.replace('_', ' ')}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                          {report.stream}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-ink font-medium">
                      {report.studentName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-accent font-mono text-sm">
                        {report.scorePercentage}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-ink-soft font-mono">
                      {new Date(report.lastEvaluatedAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRegenerate(report)}
                        disabled={regeneratingId === report.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-blue-deep text-white font-bold rounded-lg text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap border border-accent hover:scale-105"
                      >
                        {regeneratingId === report.id ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Re-evaluating...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>1-Click AI Re-generate</span>
                          </>
                        )}
                      </button>
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
