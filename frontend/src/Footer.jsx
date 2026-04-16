import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="footer-logo" to="/">
              <Plus size={18} strokeWidth={2.6} color="var(--color-blue)" />
              <span>NutriScan.</span>
            </Link>
            <p className="footer-desc">
              Detecting child malnutrition accurately and efficiently using AI and Machine Learning.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="link-col">
              <h4>Navigation</h4>
              <Link to="/">Homepage</Link>
              <Link to="/technology">Technology</Link>
              <Link to="/about-us">About Us</Link>
            </div>
            <div className="link-col">
              <h4>Platform</h4>
              <Link to="/screening-lab">AI Screening Lab</Link>
              <Link to="/resources">Resources</Link>
              <Link to="/contact-us">Contact Us</Link>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NutriScan. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
