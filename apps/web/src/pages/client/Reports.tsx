import { useState } from 'react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'summary' | 'script'>('summary');

  return (
    <div className="max-w-4xl">
      <p className="pen text-2xl mb-1">evaluator feedback</p>
      <h1 className="mb-2">CBSE Class 12 Physics — Paper #1 Report</h1>
      <p className="text-ink-soft mb-6">
        Evaluated line-by-line by a CBSE-experienced examiner against official marking scheme guidelines.
      </p>

      {/* Report navigation tabs */}
      <div className="flex border-b border-ink/10 mb-8 gap-4">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-blue text-blue-deep'
              : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          Performance Summary
        </button>
        <button
          onClick={() => setActiveTab('script')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'script'
              ? 'border-blue text-blue-deep'
              : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          Annotated Answer Script (Red Pen Marks)
        </button>
      </div>

      {activeTab === 'summary' ? (
        <div className="space-y-8">
          {/* Top Score Box */}
          <div className="p-6 rounded-lg bg-paper-warm border border-ink/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs text-ink-faint uppercase font-semibold">Total Score Awarded</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl font-extrabold text-ink">58</span>
                <span className="text-xl text-ink-soft font-semibold">/ 70 Marks</span>
                <span className="ml-2 text-xs font-bold text-green px-2 py-0.5 rounded bg-green/10">+12.4 vs Baseline</span>
              </div>
            </div>
            <a
              href="#script"
              onClick={() => setActiveTab('script')}
              className="btn btn-primary text-sm"
            >
              View Red Pen Marked PDF
            </a>
          </div>

          {/* Biggest Leak Section */}
          <div className="p-6 rounded-lg bg-pen-soft/40 border border-pen/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-pen font-bold uppercase text-xs tracking-wider">⚠️ Single Biggest Mark Leak Habit</span>
            </div>
            <h3 className="text-ink font-bold mb-2">Skipping Intermediate Derivation Working Steps</h3>
            <p className="text-sm text-ink-soft">
              In Question 14 (Gauss Law Application) and Question 19 (Lens Maker Formula), the final formula answer was correct, but 2 intermediate steps were omitted. According to CBSE marking scheme guidelines, method credit cannot be granted without explicit intermediate steps.
            </p>
          </div>

          {/* Chapter-wise Breakdown */}
          <div className="p-6 rounded-lg bg-paper-warm border border-ink/10">
            <h3 className="font-bold mb-4">Chapter-wise Performance Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>Electrostatics & Capacitance</span>
                  <span className="text-green font-semibold">18 / 20 Marks (90%)</span>
                </div>
                <div className="w-full bg-ink/5 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-green h-full rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>Current Electricity</span>
                  <span className="text-ink font-semibold">15 / 20 Marks (75%)</span>
                </div>
                <div className="w-full bg-ink/5 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>Ray Optics & Optical Instruments</span>
                  <span className="text-pen font-semibold">7 / 20 Marks (35%) — Action Required</span>
                </div>
                <div className="w-full bg-ink/5 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-pen h-full rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mockup of Red Pen Annotated Answer Sheet */
        <div className="p-6 rounded-lg bg-paper-warm border border-ink/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Annotated Page 3 of 12</h3>
            <span className="text-xs text-ink-faint">Examiner ID: #CBSE-EVAL-882</span>
          </div>

          <div className="relative border border-ink/20 rounded bg-white p-6 shadow-inner font-mono text-sm leading-relaxed text-slate-800 min-h-[350px]">
            <p className="font-sans text-xs text-slate-400 border-b pb-2 mb-4">Question 14 — State & Prove Gauss Law in Electrostatics (5 Marks)</p>
            
            <p className="mb-2">
              Flux &Phi; = &oint; E &middot; dA = q_enclosed / &epsilon;_0
            </p>
            <p className="mb-2">
              E &middot; (4 &pi; r^2) = q / &epsilon;_0
            </p>

            {/* Red Pen Examiner Annotation overlay */}
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs font-sans">
              <span className="font-bold block text-red-800">✍️ Examiner Red Pen Note (-2 Marks):</span>
              Diagram of Gaussian surface missing. State SI units for permittivity &epsilon;_0 explicitly in final derivation step.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
