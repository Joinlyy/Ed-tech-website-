import { testimonialsCol1, testimonialsCol2, testimonialsCol3 } from '@/config/site';
import type { Testimonial } from '@/types';

function Stars() {
  return (
    <div className="voice-stars" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} aria-hidden="true">★</span>
      ))}
    </div>
  );
}

function VoiceCard({ t }: { t: Testimonial }) {
  return (
    <article className="voice-card">
      <div className="voice-head">
        <div
          className="voice-avatar"
          style={{ background: t.avatarColor, borderColor: t.avatarColor }}
        >
          {t.initials}
        </div>
        <div>
          <div className="voice-name">{t.name}</div>
          <div className="voice-role">{t.role}</div>
        </div>
      </div>
      <Stars />
      <p className="voice-quote">&ldquo;{t.quote}&rdquo;</p>
      {t.gain && <div className="voice-gain">{t.gain}</div>}
    </article>
  );
}

/** One column of cards, duplicated in-place so the -50% translate loops seamlessly. */
function Column({ items, keyPrefix }: { items: Testimonial[]; keyPrefix: string }) {
  const doubled = [...items, ...items];
  return (
    <div className="mcol">
      {doubled.map((t, i) => (
        <VoiceCard key={`${keyPrefix}-${i}`} t={t} />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="voices">
      <div className="wrap voices-inner">
        <div style={{ textAlign: 'center' }}>
          <span className="voices-badge">what students &amp; parents say</span>
          <h2 className="voices-title">
            12,400 scripts and <span className="grad">counting</span>.
          </h2>
          <p className="voices-sub">
            We don&apos;t ask for these — they come in on WhatsApp, mostly. Hover to pause and read.
          </p>
        </div>
        <div
          className="marquee"
          tabIndex={0}
          aria-label="Testimonials, scrolling. Hover or focus to pause."
        >
          <Column items={testimonialsCol1} keyPrefix="c1" />
          <Column items={testimonialsCol2} keyPrefix="c2" />
          <Column items={testimonialsCol3} keyPrefix="c3" />
        </div>
        <p className="marq-note">Names shortened at the family&apos;s request. Full reviews and marks on file.</p>
      </div>
    </section>
  );
}
