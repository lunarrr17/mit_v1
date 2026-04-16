import { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import './Values.css';

const Values = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const elements = entry.target.querySelectorAll('.fade-in-up');
          elements.forEach(el => el.classList.add('visible'));
        }
      });
    }, { threshold: 0.2 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="values" ref={containerRef}>
      <div className="values-content">
        <div className="cards-container">
          <div className="value-card card-1 fade-in-up">
            <div className="bracket-icon"></div>
            <h3 className="card-title">Accuracy & Precision</h3>
            <p className="card-body">We prioritize high-fidelity AI models to deliver the most reliable, deterministic scanning for child malnutrition symptoms.</p>
          </div>
          
          <div className="value-card card-2 fade-in-up" style={{ transitionDelay: '0.2s' }}>
            <div className="bracket-icon"></div>
            <h3 className="card-title">Early Detection</h3>
            <p className="card-body">By leveraging ML and computer vision, we provide rapid screening workflows to ensure no child slips through the cracks.</p>
          </div>
        </div>
        
        <div className="values-bottom-left fade-in-up" style={{ transitionDelay: '0.4s' }}>
          <span className="join-label">INTERESTED IN JOINING?</span>
          <button className="join-btn">
            <Plus size={18} strokeWidth={2} color="var(--color-dark)" />
          </button>
        </div>
      </div>
      
      {/* Visual transition to the blue section */}
      <div className="blue-band-transition"></div>
    </section>
  );
};

export default Values;
