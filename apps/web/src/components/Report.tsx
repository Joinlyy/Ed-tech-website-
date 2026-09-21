import { reportBars, trendBars } from '@/config/site';

const checklist = [
  'Every mark lost, tied to the exact line you wrote',
  'Careless slip or concept gap — separated, never guessed at',
  "Chapter-wise marks, so revision goes where it's needed",
  'Presentation marks: headings, units, diagrams, working shown',
  'What we could not assess, stated plainly',
];

/** Smooth cubic path through the 5 paper scores — Catmull-Rom-ish with a fixed tension. */
function buildPath(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return '';
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const t = 0.18;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`);
  }
  return d.join(' ');
}

function TrendChart() {
  const w = 320;
  const h = 130;
  const padX = 16;
  const padY = 14;
  const values = trendBars.map((b) => b.height); // [52, 58, 56, 67, 74]
  const min = Math.min(...values) - 6;
  const max = Math.max(...values) + 6;
  const points = values.map((v, i) => ({
    x: padX + (i * (w - padX * 2)) / (values.length - 1),
    y: h - padY - ((v - min) / (max - min)) * (h - padY * 2),
  }));
  const linePath = buildPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - padY} L ${points[0].x} ${h - padY} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="Score trend across five papers, rising from 52 to 74">
        <defs>
          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2C5FF6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2C5FF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={w - padX}
            y1={padY + f * (h - padY * 2)}
            y2={padY + f * (h - padY * 2)}
            stroke="rgba(22,35,63,0.08)"
            strokeDasharray="2 4"
          />
        ))}
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="#2C5FF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={isLast ? 7 : 4} fill={isLast ? '#1F9D63' : '#FFFFFF'} stroke={isLast ? '#1F9D63' : '#2C5FF6'} strokeWidth="2.5" />
              {isLast && (
                <text
                  x={p.x}
                  y={p.y - 14}
                  textAnchor="middle"
                  fontFamily="'Caveat', cursive"
                  fontSize="18"
                  fontWeight="700"
                  fill="#1F9D63"
                >
                  +22
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="trend-x" style={{ marginTop: -4 }}>
        <span>P1</span>
        <span>P2</span>
        <span>P3</span>
        <span>P4</span>
        <span>P5</span>
      </div>
    </div>
  );
}

/** Small donut summarising where the marks went — visual companion to the chapter bars. */
function MarkLossDonut() {
  const segments = [
    { label: 'Method', value: 54, color: '#1F9D63' },
    { label: 'Working', value: 21, color: '#D93A2B' },
    { label: 'Concept', value: 14, color: '#2C5FF6' },
    { label: 'Time', value: 11, color: '#F5A623' },
  ];
  const size = 96;
  const r = 38;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let offset = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Where marks were lost: method 54%, working 21%, concept 14%, time 11%">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E3EAF7" strokeWidth="12" />
        {segments.map((s) => {
          const frac = s.value / total;
          const dash = frac * c;
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontFamily="'Bricolage Grotesque', sans-serif" fontWeight={800} fontSize={18} fill="#16233F">
          26
        </text>
      </svg>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.83rem', color: '#5B6780', lineHeight: 1.75 }}>
        {segments.map((s) => (
          <li key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              aria-hidden
              style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block' }}
            />
            <span style={{ color: '#16233F', fontWeight: 600, minWidth: 62 }}>{s.label}</span>
            <span>{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Report() {
  return (
    <section className="section" id="report">
      <div className="wrap">
        <div className="split">
          <div>
            <h2>A number tells you nothing. This tells you what to fix.</h2>
            <p style={{ marginTop: 18 }}>
              School gives you 68 out of 100 and a red circle. We give you the same 32 marks back, itemised — which question, which step, which habit, and whether it&apos;s getting better or worse across the five papers.
            </p>
            <ul className="checklist">
              {checklist.map((item, i) => (
                <li key={i}>
                  <svg className="tick" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 13 L9 19 L21 5" stroke="#1F9D63" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 26 }}>
              <a href="#pricing" className="btn">Download a full sample report</a>
            </p>
          </div>

          <div className="report-card">
            <div className="rc-top">
              <div>
                <h4>Progress report</h4>
                <span>Physics · 5 papers · Sept to Jan</span>
              </div>
              <div className="score-ring">
                74<small>latest</small>
              </div>
            </div>
            <div className="rc-body">
              <div className="rc-section-lab">Score across the five papers</div>
              <TrendChart />

              <div className="rc-divider" />

              <div className="rc-section-lab">Where the marks went</div>
              <MarkLossDonut />

              <div className="rc-divider" />

              <div className="rc-section-lab">By chapter</div>
              {reportBars.map((bar) => (
                <div key={bar.label} className="bar-row">
                  <div className="bar-lab">
                    <span>{bar.label}</span>
                    <span>{bar.value}</span>
                  </div>
                  <div className="bar-track">
                    <i
                      className={`bar-fill ${bar.variant === 'ok' ? 'ok' : bar.variant === 'weak' ? 'weak' : ''}`}
                      style={{ width: `${bar.percent}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="leak">
                <b>What to do this fortnight</b>
                <span>Ray optics only. Twenty minutes, four evenings a week, on sign convention in mirror and lens problems. Nothing else needs attention right now.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
