import { Link } from 'react-router-dom';
import { siteConfig, footerLinkGroups } from '@/config/site';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Logo />
            <p style={{ marginTop: 14 }}>
              Board exam papers, marked the way the board marks them. Class 10 and 12, CBSE.
            </p>
          </div>
          {footerLinkGroups.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              <ul className="foot-links">
                {group.links.map((link) =>
                  link.href.startsWith('/') ? (
                    <li key={link.href}>
                      <Link to={link.href}>{link.label}</Link>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
          <div>
            <h4>Talk to us</h4>
            <p>
              {siteConfig.hours}
              <br />
              {siteConfig.address}
            </p>
            <a className="wa" href={siteConfig.whatsapp}>
              {siteConfig.whatsappLabel}
            </a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{siteConfig.copyright}</span>
          <div className="legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/refunds">Refunds</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
