import { whoCards } from '@/config/site';

export default function WhoMarks() {
  return (
    <section className="section" id="who">
      <div className="wrap">
        <div className="head">
          <h2>Who actually marks your paper</h2>
          <p>
            The honest answer, because it&apos;s the first thing every parent asks. Nothing reaches you until a human has signed it off.
          </p>
        </div>
        <div className="who-grid">
          {whoCards.map((card) => (
            <div key={card.tag} className="who-card">
              <span className="who-tag">{card.tag}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
        <p className="who-foot">
          <b>What we never write:</b> weak, careless, lazy, lacks interest, at risk. We report what your paper shows, not what kind of student we think you are. Comparisons and ranks against other children don&apos;t appear anywhere.
        </p>
      </div>
    </section>
  );
}
