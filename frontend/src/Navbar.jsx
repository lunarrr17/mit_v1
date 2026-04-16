import { useState, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar-shell ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar">
        <div className="navbar-left">
          <Link className="logo" to="/">
            <Plus size={18} strokeWidth={2.6} color="#0A0F2C" />
            <span>NutriScan</span>
          </Link>
        </div>

        <div className="navbar-center">
          <ul className="nav-links">
            <li><NavLink to="/" end>{t('navbar.home')}</NavLink></li>
            <li><NavLink to="/technology">{t('navbar.tech')}</NavLink></li>
            <li><NavLink to="/about-us">{t('navbar.about')}</NavLink></li>
            <li className="dropdown">
              <NavLink to="/main-menu">{t('navbar.menu')} <ChevronDown size={13} className="dropdown-icon" /></NavLink>
              <div className="dropdown-menu">
                <Link to="/main-menu">{t('navbar.overview')}</Link>
                <Link to="/screening-lab">{t('navbar.lab')}</Link>
              </div>
            </li>
            <li><NavLink to="/resources">{t('navbar.resources')}</NavLink></li>
          </ul>
        </div>

        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="lang-switcher" style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#0A0F2C' }}>
            <span onClick={() => i18n.changeLanguage('en')} style={{ opacity: i18n.language === 'en' ? 1 : 0.5 }}>EN</span>
            <span onClick={() => i18n.changeLanguage('hi')} style={{ opacity: i18n.language === 'hi' ? 1 : 0.5 }}>HI</span>
          </div>
          <NavLink to="/contact-us" className="contact-btn">
            {t('navbar.contact')} <Plus size={14} strokeWidth={2.5} style={{ marginLeft: '6px' }} />
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
