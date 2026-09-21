import { Link, useNavigate } from 'react-router-dom';
import { plans } from '@/config/site';

export default function Pricing() {
  const nav = useNavigate();

  return (
    <section className="section" id="pricing">
      <div className="wrap">
        <div className="head center">
          <h2>One price. Five papers. No course.</h2>
          <p>
            Pay once for the year. We don&apos;t sell tuition, we don&apos;t take referral fees, and there&apos;s no upsell inside the report.
          </p>
        </div>
        <div className="plans">
          {plans.map((plan) => (
            <div
              key={plan.code}
              className={`plan ${plan.primary ? 'pick' : ''}`}
              role="link"
              tabIndex={0}
              onClick={(e) => {
                // The inner CTA <Link> handles its own click; don't double-navigate.
                if ((e.target as HTMLElement).closest('a')) return;
                nav(plan.ctaHref);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  nav(plan.ctaHref);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {plan.flag && <span className="plan-flag">{plan.flag}</span>}
              <h3>{plan.name}</h3>
              <p className="who-for">{plan.whoFor}</p>
              <p className="price">{plan.price}</p>
              <p className="per">{plan.per}</p>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link to={plan.ctaHref} className={`btn ${plan.primary ? 'btn-primary' : ''}`}>
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      
      </div>
    </section>
  );
}
