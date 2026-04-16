import { useEffect, useRef } from 'react';
import { Plus, Play } from 'lucide-react';
import './Hero.css';

const Hero = ({ onPlay, isAutoPlaying }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const elements = entry.target.querySelectorAll('.stagger-anim');
          elements.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('visible');
            }, index * 50);
          });
        }
      });
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" ref={containerRef}>
      <div className="hero-rings">
        <div className="ring ring-1"></div>
        <div className="ring ring-2"></div>
        <div className="ring ring-3"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-typography">
          <h1 className="hero-line-0 stagger-anim">Detecting.</h1>
          <h1 className="hero-line-1 stagger-anim">Malnutrition.</h1>
          <h1 className="hero-line-2 stagger-anim">ML+AI.</h1>
          
          <div className="hero-play-wrap stagger-anim" style={{ position: 'relative', marginTop: '2rem', transform: 'none', bottom: 'auto', left: 'auto' }}>
            <button className="hero-play-btn" onClick={onPlay} aria-label="Auto-play site sections">
              <Play size={16} strokeWidth={2.4} color="var(--color-white)" fill="var(--color-white)" />
            </button>
            <span className="hero-play-label">{isAutoPlaying ? 'AUTO PLAYING' : 'LEARN MORE'}</span>
          </div>
        </div>
      </div>

      <div className="hero-bottom-right stagger-anim">
        <a href="#values" className="learn-more-link">Learn More</a>
        <button className="hero-btn" aria-label="Quick action">
          <Plus size={18} strokeWidth={2.5} color="var(--color-white)" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
