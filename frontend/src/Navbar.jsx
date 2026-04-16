import { useState, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
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
            <Plus size={18} strokeWidth={2.6} color="var(--color-blue)" />
            <span>NutriScan</span>
          </Link>
        </div>

        <div className="navbar-center">
          <ul className="nav-links">
            <li><NavLink to="/" end>Homepage</NavLink></li>
            <li><NavLink to="/technology">Technology</NavLink></li>
            <li><NavLink to="/about-us">About Us</NavLink></li>
            <li className="dropdown">
              <NavLink to="/main-menu">Main Menu <ChevronDown size={13} className="dropdown-icon" /></NavLink>
              <div className="dropdown-menu">
                <Link to="/main-menu">Overview</Link>
                <Link to="/screening-lab">AI Screening Lab</Link>
              </div>
            </li>
            <li><NavLink to="/resources">Resources</NavLink></li>
          </ul>
        </div>

        <div className="navbar-right">
          <NavLink to="/contact-us" className="contact-btn">Contact Us ↗</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
