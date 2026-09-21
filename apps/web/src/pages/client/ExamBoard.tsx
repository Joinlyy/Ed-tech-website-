import { useState } from 'react';

interface PaperItem {
  id: string;
  subject: string;
  boardClass: string;
  paperNumber: number;
  status: 'DRAFT' | 'UPLOADED' | 'IN_REVIEW' | 'MARKED' | 'DELIVERED';
  totalMarks: number;
  awardedMarks: number | null;
  uploadedAt?: string;
}

const INITIAL_PAPERS: PaperItem[] = [
  { id: '1', subject: 'PHYSICS', boardClass: 'CBSE Class 12', paperNumber: 1, status: 'MARKED', totalMarks: 70, awardedMarks: 58, uploadedAt: 'Yesterday' },
  { id: '2', subject: 'PHYSICS', boardClass: 'CBSE Class 12', paperNumber: 2, status: 'IN_REVIEW', totalMarks: 70, awardedMarks: null, uploadedAt: '2 hours ago' },
  { id: '3', subject: 'CHEMISTRY', boardClass: 'CBSE Class 12', paperNumber: 1, status: 'UPLOADED', totalMarks: 70, awardedMarks: null, uploadedAt: 'Just now' },
  { id: '4', subject: 'MATHEMATICS', boardClass: 'CBSE Class 12', paperNumber: 1, status: 'DRAFT', totalMarks: 80, awardedMarks: null },
  { id: '5', subject: 'BIOLOGY', boardClass: 'CBSE Class 12', paperNumber: 1, status: 'DRAFT', totalMarks: 70, awardedMarks: null },
];

export default function ExamBoard() {
  const [papers, setPapers] = useState<PaperItem[]>(INITIAL_PAPERS);
  const [selectedPaper, setSelectedPaper] = useState<PaperItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  function handleSimulateUpload(paperId: string) {
    setUploading(true);
    setUploadSuccess(null);
    setTimeout(() => {
      setPapers((prev) =>
        prev.map((p) =>
          p.id === paperId ? { ...p, status: 'UPLOADED', uploadedAt: 'Just now' } : p
        )
      );
      setUploading(false);
      setUploadSuccess('Answer sheet uploaded successfully! Evaluator assigned for review.');
      setSelectedPaper(null);
    }, 1200);
  }

  function getStatusBadge(status: PaperItem['status']) {
    switch (status) {
      case 'MARKED':
        return <span className="px-2.5 py-1 rounded bg-green/10 text-green font-semibold text-xs">Marked & Verified</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-1 rounded bg-blue-wash text-blue-deep font-semibold text-xs">Evaluator Reviewing</span>;
      case 'UPLOADED':
        return <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-semibold text-xs">Uploaded</span>;
      default:
        return <span className="px-2.5 py-1 rounded bg-ink/5 text-ink-soft font-semibold text-xs">Ready to Write</span>;
    }
  }

  return (
    <div className="max-w-5xl">
      <p className="pen text-2xl mb-1">cbse board simulation</p>
      <h1 className="mb-2">Exam Board & Answer Script Portal</h1>
      <p className="text-ink-soft mb-8">
        Download official CBSE-pattern question papers, write by hand, photograph each page, and upload for board evaluation.
      </p>

      {uploadSuccess && (
        <div className="mb-6 p-4 rounded bg-green/10 text-green font-medium text-sm border border-green/20">
          ✓ {uploadSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-5 rounded-lg bg-paper-warm border border-ink/10">
          <p className="text-xs text-ink-faint uppercase tracking-wider font-semibold">Total Papers in Plan</p>
          <p className="font-display text-3xl font-extrabold text-ink mt-1">12 Papers</p>
        </div>
        <div className="p-5 rounded-lg bg-paper-warm border border-ink/10">
          <p className="text-xs text-ink-faint uppercase tracking-wider font-semibold">Evaluated & Marked</p>
          <p className="font-display text-3xl font-extrabold text-green mt-1">1 Completed</p>
        </div>
        <div className="p-5 rounded-lg bg-paper-warm border border-ink/10">
          <p className="text-xs text-ink-faint uppercase tracking-wider font-semibold">In Evaluation Pipeline</p>
          <p className="font-display text-3xl font-extrabold text-blue mt-1">2 Papers</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 text-ink">Your Assigned Board Papers</h2>
      <div className="space-y-4">
        {papers.map((p) => (
          <div key={p.id} className="p-5 rounded-lg bg-paper-warm border border-ink/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-display font-bold text-lg text-ink">{p.subject} — Paper #{p.paperNumber}</span>
                {getStatusBadge(p.status)}
              </div>
              <p className="text-sm text-ink-soft">
                {p.boardClass} · 3 Hours Duration · Max Marks: {p.totalMarks}
                {p.uploadedAt && <span> · Uploaded: {p.uploadedAt}</span>}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {p.status === 'DRAFT' && (
                <button
                  onClick={() => setSelectedPaper(p)}
                  className="btn btn-primary text-sm px-4"
                >
                  Upload Answer Sheet
                </button>
              )}
              {p.status === 'MARKED' && (
                <div className="text-right">
                  <span className="text-sm font-bold text-green block">{p.awardedMarks} / {p.totalMarks} Marks</span>
                  <a href="/portal/reports" className="text-xs text-blue underline font-semibold">
                    View Annotated Script & Report →
                  </a>
                </div>
              )}
              {(p.status === 'UPLOADED' || p.status === 'IN_REVIEW') && (
                <span className="text-xs text-ink-faint italic">Report expected within 24-48 hrs</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal simulation */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <div className="bg-paper-warm max-w-md w-full p-6 rounded-lg border border-ink/20 shadow-xl">
            <h3 className="mb-2">Upload {selectedPaper.subject} Paper #{selectedPaper.paperNumber}</h3>
            <p className="text-sm text-ink-soft mb-6">
              Snap clear photos of every written page using any phone camera or upload a single PDF file.
            </p>

            <div className="border-2 border-dashed border-ink/20 rounded-lg p-8 text-center mb-6 bg-paper hover:border-blue transition-colors cursor-pointer">
              <p className="text-sm font-semibold text-ink mb-1">Click to select photos or drag & drop PDF</p>
              <p className="text-xs text-ink-faint">Supports JPG, PNG, PDF up to 25MB</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedPaper(null)}
                disabled={uploading}
                className="btn btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSimulateUpload(selectedPaper.id)}
                disabled={uploading}
                className="btn btn-primary text-sm"
              >
                {uploading ? 'Uploading Answer Script…' : 'Submit for Board Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
