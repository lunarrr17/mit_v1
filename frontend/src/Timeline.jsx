import { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import './Timeline.css';

const timelineData = [
  {
    year: "Phase 1",
    desc: "Developing state-of-the-art ResNet18 and YOLOv8 models capable of detecting severe clinical signs and global malnutrition from photographs."
  },
  {
    year: "Phase 2",
    desc: "Integrating with the standard WHO LMS Growth Standards to deterministically fuse clinical z-scores with visual AI predictions."
  },
  {
    year: "Phase 3",
    desc: "NutriScan continues to push boundaries, leveraging computer vision and edge computing to eradicate child malnutrition efficiently."
  }
];

const Timeline = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const rows = containerRef.current?.querySelectorAll('.timeline-row');
    rows?.forEach(row => observer.observe(row));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="timeline-section">
      <div className="timeline-container" ref={containerRef}>
        <div className="timeline-intro">
          <p>Building trust and forging lasting partnerships through innovative design.</p>
        </div>
        
        <div className="timeline-list">
          {timelineData.map((item, index) => (
            <div className="timeline-row fade-in-up" key={index} style={{ transitionDelay: `${index * 0.1}s` }}>
              <div className="timeline-icon">
                <Plus size={16} strokeWidth={2} color="var(--color-white)" />
              </div>
              <div className="timeline-content">
                <h2 className="timeline-year">{item.year}</h2>
                <p className="timeline-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
