import { steps } from '@/config/site';

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <div className="head">
          <h2>Solve on paper. Post it. Get it marked.</h2>
          <p>
            Board exams are written by hand under time pressure. So is this. No MCQs, no tapping — you sit the paper the way you&apos;ll sit it in March.
          </p>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <div key={step.number} className="step">
              <div className="step-n">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <p className="step-meta">{step.meta}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
