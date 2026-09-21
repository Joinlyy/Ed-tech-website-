import { heroBars } from '@/config/site';

export default function Hero() {
  return (
    <section className="hero ruled">
      <div className="wrap">
        <span className="pen scribble s1">+2 method mark</span>
        <span className="pen scribble s2">step missing</span>
        <span className="pen scribble s3">✓ 3/3</span>
        <span className="pen scribble s4">unit not written</span>

        <div className="hero-inner">
          <h1>
            Your child scored 68.<br />
            <span className="hl">Nobody told them why.</span>
          </h1>
          <p className="hero-sub">
            Five full board papers per subject, solved by hand and marked against the official CBSE marking scheme — with a report that shows exactly where the marks went.
          </p>
          <div className="hero-actions">
            <a href="#pricing" className="btn btn-primary">Get the first paper marked</a>
            <a href="#report" className="btn">See a real report</a>
          </div>
          <p className="hero-note">Class 10 &amp; 12 · CBSE · report back in 48 hours</p>
        </div>

        <div className="script" role="img" aria-label="Example of a marked answer script beside its report summary">
          <div className="script-bar">
            <span className="dot" style={{ background: '#F0605A' }} />
            <span className="dot" style={{ background: '#F5BF4F' }} />
            <span className="dot" style={{ background: '#5BC46E' }} />
            <span className="script-name">Class 12 · Physics · Paper 3 of 5 · marked 14 Feb</span>
          </div>
          <div className="script-body">
            <div className="script-left">
              <p className="q-head">
                Q14. Derive the expression for the electric field on the axis of a dipole.{' '}
                <span style={{ color: '#93A0B8', fontWeight: 500 }}>[3 marks]</span>
              </p>
              <span className="margin-mark" style={{ top: 78 }}>1</span>
              <p className="ans">
                E = kq/r² at each charge, so net field<br />
                = kq/(r−a)² <span className="strike">+</span> kq/(r+a)²<br />
                = 2kp/r³ &nbsp;for r ≫ a
              </p>
              <p className="pen-note">
                Sign error — the fields subtract, not add.<br />
                Final answer right, working isn&apos;t. 1/3.
              </p>
              <span className="margin-mark" style={{ top: 262 }}>2</span>
              <p className="ans" style={{ marginTop: 22 }}>
                Direction: along the axis, from −q to +q
              </p>
              <p className="pen-note">✓ Correct. Full marks here.</p>
            </div>
            <div className="script-right">
              <p className="rp-title">Where your marks went</p>
              <p className="rp-sub">Physics · across 3 papers so far</p>

              {heroBars.map((bar) => (
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
                <b>Biggest single leak: 9 marks</b>
                <span>Skipping intermediate steps in derivations. The board awards method marks separately from the final answer.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
