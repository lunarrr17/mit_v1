import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import './Timeline.css';

const Timeline = () => {
  const { t } = useTranslation();

  const timelineData = [
    {
      year: t("time.p1"),
      desc: t("time.d1")
    },
    {
      year: t("time.p2"),
      desc: t("time.d2")
    },
    {
      year: t("time.p3"),
      desc: t("time.d3")
    }
  ];

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
          <p>{t("time.intro")}</p>
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
