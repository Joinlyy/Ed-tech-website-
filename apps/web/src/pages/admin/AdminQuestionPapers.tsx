import React, { useEffect, useState } from 'react';
import { fetchSubjects } from '@/lib/admin';
import type { SubjectItem } from '@/types';

interface QuestionPaper {
  id: string;
  title: string;
  boardClass: string;
  stream: string;
  subjectCode: string;
  subjectName: string;
  paperNumber: number;
  totalMarks: number;
  questionPaperFileName: string;
  answerKeyFileName?: string;
  uploadedAt: string;
}

const INITIAL_PAPERS: QuestionPaper[] = [
  {
    id: 'paper-101',
    title: 'Class 12 Physics Official Board Practice Paper #1',
    boardClass: 'CBSE_12',
    stream: 'SCIENCE',
    subjectCode: 'PHYSICS',
    subjectName: 'Physics',
    paperNumber: 1,
    totalMarks: 70,
    questionPaperFileName: 'CBSE_12_Physics_Paper1_2026.pdf',
    answerKeyFileName: 'CBSE_12_Physics_AnswerKey1_2026.pdf',
    uploadedAt: 'Yesterday at 14:30',
  },
  {
    id: 'paper-102',
    title: 'Class 12 Accountancy Board Practice Paper #1',
    boardClass: 'CBSE_12',
    stream: 'COMMERCE',
    subjectCode: 'ACCOUNTANCY',
    subjectName: 'Accountancy',
    paperNumber: 1,
    totalMarks: 80,
    questionPaperFileName: 'CBSE_12_Accountancy_Paper1_2026.pdf',
    answerKeyFileName: 'CBSE_12_Accountancy_AnswerKey1_2026.pdf',
    uploadedAt: '3 days ago',
  },
  {
    id: 'paper-103',
    title: 'Class 10 Mathematics Standard Simulation Paper #1',
    boardClass: 'CBSE_10',
    stream: 'GENERAL',
    subjectCode: 'MATH_10',
    subjectName: 'Mathematics',
    paperNumber: 1,
    totalMarks: 80,
    questionPaperFileName: 'CBSE_10_Maths_Paper1_2026.pdf',
    uploadedAt: '5 days ago',
  },
];

export default function AdminQuestionPapers() {
  const [boardClass, setBoardClass] = useState('CBSE_12');
  const [stream, setStream] = useState('SCIENCE');
  const [dbSubjects, setDbSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [paperNumber, setPaperNumber] = useState(1);
  const [totalMarks, setTotalMarks] = useState(70);

  // File state
  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);

  // Repository & Filters
  const [papersList, setPapersList] = useState<QuestionPaper[]>(INITIAL_PAPERS);
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);

  // Feedback state
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects(boardClass, boardClass === 'CBSE_10' ? 'GENERAL' : stream)
      .then((subs) => {
        setDbSubjects(subs);
        if (subs.length > 0) setSelectedSubjectCode(subs[0].code);
      })
      .catch(() => {});
  }, [boardClass, stream]);

  function resetForm() {
    setQuestionPaperFile(null);
    setAnswerKeyFile(null);
    setEditingPaperId(null);
    setError(null);
  }

  function handleUploadPaper(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Mandatory check for Question Paper file
    if (!questionPaperFile && !editingPaperId) {
      setError('Question Paper PDF file is MANDATORY for uploading.');
      return;
    }

    if (!selectedSubjectCode) {
      setError('Please select a subject from your database.');
      return;
    }

    setUploading(true);

    const subObj = dbSubjects.find((s) => s.code === selectedSubjectCode);
    const subName = subObj ? subObj.name : selectedSubjectCode;

    setTimeout(() => {
      if (editingPaperId) {
        // Update existing paper
        setPapersList((prev) =>
          prev.map((p) =>
            p.id === editingPaperId
              ? {
                  ...p,
                  boardClass,
                  stream: boardClass === 'CBSE_10' ? 'GENERAL' : stream,
                  subjectCode: selectedSubjectCode,
                  subjectName: subName,
                  paperNumber,
                  totalMarks,
                  questionPaperFileName: questionPaperFile ? questionPaperFile.name : p.questionPaperFileName,
                  answerKeyFileName: answerKeyFile ? answerKeyFile.name : p.answerKeyFileName,
                }
              : p
          )
        );
        setSuccess(`Question paper "${subName} Paper #${paperNumber}" updated successfully!`);
      } else {
        // Create new paper
        const newPaper: QuestionPaper = {
          id: `paper-${Date.now()}`,
          title: `Class ${boardClass === 'CBSE_10' ? '10' : '12'} ${subName} Board Practice Paper #${paperNumber}`,
          boardClass,
          stream: boardClass === 'CBSE_10' ? 'GENERAL' : stream,
          subjectCode: selectedSubjectCode,
          subjectName: subName,
          paperNumber,
          totalMarks,
          questionPaperFileName: questionPaperFile?.name || 'QuestionPaper_Document.pdf',
          answerKeyFileName: answerKeyFile?.name,
          uploadedAt: 'Just now',
        };
        setPapersList([newPaper, ...papersList]);
        setSuccess(`Question paper "${newPaper.title}" uploaded & published successfully!`);
      }

      setUploading(false);
      resetForm();
    }, 800);
  }

  function handleEdit(paper: QuestionPaper) {
    setEditingPaperId(paper.id);
    setBoardClass(paper.boardClass);
    setStream(paper.stream);
    setSelectedSubjectCode(paper.subjectCode);
    setPaperNumber(paper.paperNumber);
    setTotalMarks(paper.totalMarks);
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setPapersList((prev) => prev.filter((p) => p.id !== id));
      setSuccess(`Paper "${title}" deleted.`);
    }
  }

  const filteredPapers = papersList.filter(
    (p) => filterClass === 'ALL' || p.boardClass === filterClass
  );

  return (
    <div className="max-w-5xl space-y-8">
      {/* Page Header */}
      <div>
        <p className="pen text-2xl mb-1">exam repository</p>
        <h1 className="mb-2">Board Question Paper Uploader</h1>
        <p className="text-ink-soft">
          Upload and manage official CBSE board question papers and solution answer keys linked to your Subject Database.
        </p>
      </div>

      {/* Upload / Edit Paper Form */}
      <section className="p-6 rounded-xl bg-paper-warm border border-ink/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-lg font-bold text-ink">
              {editingPaperId ? 'Edit Question Paper' : 'Upload New Board Question Paper'}
            </h2>
          </div>
          {editingPaperId && (
            <button
              onClick={resetForm}
              className="text-xs px-3 py-1 bg-paper border border-ink/20 rounded hover:bg-paper-warm transition-colors"
            >
              ✕ Cancel Editing
            </button>
          )}
        </div>

        {success && (
          <div className="p-3.5 rounded-lg bg-green/10 text-green border border-green/20 text-xs font-medium flex items-center gap-2">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-pen-soft text-pen border border-pen/20 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUploadPaper} className="space-y-5">
          {/* Top Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Class *</label>
              <select
                value={boardClass}
                onChange={(e) => {
                  setBoardClass(e.target.value);
                  if (e.target.value === 'CBSE_10') setStream('GENERAL');
                }}
                className="w-full px-3 py-2 border border-ink/20 rounded-lg text-sm bg-paper focus:outline-none focus:border-blue"
              >
                <option value="CBSE_12">Class 12</option>
                <option value="CBSE_10">Class 10</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Stream *</label>
              <select
                value={stream}
                disabled={boardClass === 'CBSE_10'}
                onChange={(e) => setStream(e.target.value)}
                className="w-full px-3 py-2 border border-ink/20 rounded-lg text-sm bg-paper disabled:bg-gray-100 focus:outline-none focus:border-blue"
              >
                <option value="SCIENCE">Science</option>
                <option value="COMMERCE">Commerce</option>
                <option value="HUMANITIES">Humanities</option>
                <option value="GENERAL">General (Class 10)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Subject (From DB) *</label>
              <select
                value={selectedSubjectCode}
                onChange={(e) => setSelectedSubjectCode(e.target.value)}
                className="w-full px-3 py-2 border border-ink/20 rounded-lg text-sm bg-paper focus:outline-none focus:border-blue"
              >
                {dbSubjects.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-faint uppercase mb-1">Paper No. &amp; Marks *</label>
              <div className="flex gap-2">
                <select
                  value={paperNumber}
                  onChange={(e) => setPaperNumber(Number(e.target.value))}
                  className="w-1/2 px-2 py-2 border border-ink/20 rounded-lg text-sm bg-paper"
                >
                  <option value={1}>Paper 1</option>
                  <option value={2}>Paper 2</option>
                  <option value={3}>Paper 3</option>
                  <option value={4}>Paper 4</option>
                  <option value={5}>Paper 5</option>
                </select>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  placeholder="Marks"
                  className="w-1/2 px-2 py-2 border border-ink/20 rounded-lg text-sm bg-paper"
                />
              </div>
            </div>
          </div>

          {/* File Upload Attachment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Mandatory Question Paper PDF */}
            <div className="border-2 border-dashed border-accent/40 rounded-xl p-5 bg-blue-wash/30 hover:border-accent transition-colors relative">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-accent text-white rounded text-[10px] font-mono font-bold mb-1">
                    MANDATORY
                  </span>
                  <h3 className="font-semibold text-ink text-sm">Question Paper PDF Document</h3>
                </div>
                <span className="text-xl">📄</span>
              </div>
              <p className="text-xs text-ink-soft mb-3">
                Select official CBSE question paper PDF. Students solve this paper.
              </p>

              <input
                type="file"
                accept=".pdf"
                id="qp-file-input"
                onChange={(e) => setQuestionPaperFile(e.target.files?.[0] || null)}
                className="hidden"
              />

              <label
                htmlFor="qp-file-input"
                className="inline-flex items-center gap-2 px-3 py-2 bg-paper-warm border border-accent/30 rounded-lg text-xs font-semibold text-accent hover:bg-blue-wash cursor-pointer transition-colors"
              >
                <span>📎</span>
                {questionPaperFile ? 'Change Question Paper' : 'Choose Question Paper PDF'}
              </label>

              {questionPaperFile && (
                <div className="mt-3 p-2 bg-paper rounded border border-ink/10 flex items-center justify-between text-xs">
                  <span className="font-mono text-ink truncate font-medium max-w-[200px]">
                    {questionPaperFile.name}
                  </span>
                  <span className="text-ink-faint text-[10px]">
                    {(questionPaperFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>

            {/* 2. Optional Answer Key / Solution Scheme PDF */}
            <div className="border-2 border-dashed border-ink/20 rounded-xl p-5 bg-paper/50 hover:border-ink/40 transition-colors relative">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-mono font-bold mb-1">
                    OPTIONAL
                  </span>
                  <h3 className="font-semibold text-ink text-sm">Answer Key / Marking Scheme PDF</h3>
                </div>
                <span className="text-xl">🔑</span>
              </div>
              <p className="text-xs text-ink-soft mb-3">
                Attach evaluator answer key &amp; chapter marking scheme for AI evaluator grading.
              </p>

              <input
                type="file"
                accept=".pdf"
                id="ak-file-input"
                onChange={(e) => setAnswerKeyFile(e.target.files?.[0] || null)}
                className="hidden"
              />

              <label
                htmlFor="ak-file-input"
                className="inline-flex items-center gap-2 px-3 py-2 bg-paper-warm border border-ink/20 rounded-lg text-xs font-semibold text-ink-soft hover:bg-paper cursor-pointer transition-colors"
              >
                <span>📎</span>
                {answerKeyFile ? 'Change Answer Key' : 'Attach Answer Key PDF (Optional)'}
              </label>

              {answerKeyFile && (
                <div className="mt-3 p-2 bg-paper rounded border border-ink/10 flex items-center justify-between text-xs">
                  <span className="font-mono text-ink truncate font-medium max-w-[200px]">
                    {answerKeyFile.name}
                  </span>
                  <span className="text-ink-faint text-[10px]">
                    {(answerKeyFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={uploading || !selectedSubjectCode}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-blue-deep text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {uploading && <span className="animate-spin">⏳</span>}
              {editingPaperId ? 'Save & Update Paper' : 'Publish Question Paper'}
            </button>
          </div>
        </form>
      </section>

      {/* Published Question Papers Repository */}
      <section className="p-6 rounded-xl bg-paper-warm border border-ink/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Published Question Papers Repository</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Showing {filteredPapers.length} active question papers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ink-faint">Filter:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-1.5 border border-ink/20 rounded-lg text-xs bg-paper font-mono"
            >
              <option value="ALL">All Classes</option>
              <option value="CBSE_12">Class 12</option>
              <option value="CBSE_10">Class 10</option>
            </select>
          </div>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="p-12 text-center text-ink-soft">
            <div className="text-4xl mb-2">📚</div>
            <p className="font-medium text-ink">No question papers published yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPapers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-paper border border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent/30 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">{p.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-50 text-success border border-green-200">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft font-mono">
                    <span className="px-1.5 py-0.5 bg-blue-wash text-accent rounded">
                      {p.boardClass.replace('_', ' ')}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                      {p.stream}
                    </span>
                    <span>Max Marks: {p.totalMarks}</span>
                    <span>· Uploaded {p.uploadedAt}</span>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="text-accent flex items-center gap-1 font-mono text-[11px]">
                      📄 QP: {p.questionPaperFileName}
                    </span>
                    {p.answerKeyFileName ? (
                      <span className="text-amber-700 flex items-center gap-1 font-mono text-[11px]">
                        🔑 Key: {p.answerKeyFileName}
                      </span>
                    ) : (
                      <span className="text-ink-faint italic text-[11px]">No answer key attached</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1.5 border border-ink/20 rounded-lg text-xs font-medium text-ink hover:bg-paper-warm transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="px-3 py-1.5 border border-pen/20 text-pen rounded-lg text-xs font-medium hover:bg-pen-soft transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
