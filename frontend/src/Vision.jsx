import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import './Vision.css';

const Vision = () => {
  const { t } = useTranslation();

  const textRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });

    if (textRef.current) {
      observer.observe(textRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="vision-section">
      <div className="vision-mosaic">
        <div className="mosaic-landscape">
          <img src="https://images.unsplash.com/photo-1542868726-2580540ab3ce?auto=format&fit=crop&w=1400&q=80" alt="Clinical Environment" />
          <span className="image-caption">{t("vis.img1")}</span>
        </div>

        <div className="mosaic-portrait">
          <img src="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=700&q=80" alt="Smiling Healthcare Professional" />
          <span className="image-caption">{t("vis.img2")}</span>
          <div className="mosaic-blue-block"></div>
        </div>
      </div>

      <div className="vision-statement-container">
        <div className="vision-statement fade-in-up" ref={textRef}>
          <div className="vision-icon">
            <Plus size={32} strokeWidth={2} color="var(--color-blue)" />
          </div>
          <h2>{t("vis.text")}</h2>
        </div>
      </div>
    </section>
  );
};

export default Vision;
