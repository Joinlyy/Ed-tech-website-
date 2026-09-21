import { stats } from '@/config/site';

export default function Stats() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="head center">
          <h2>Papers marked so far</h2>
          <p>Updated at the end of every month. We publish the average change too, including the flat ones.</p>
        </div>
        <div className="stats">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
