import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LiquidDonut from './LiquidDonut';
import './Hero.css';

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="hero">
      <LiquidDonut />
      
      <div className="hero-text-layers">
        <h1 className="hero-txt line-1">{t('hero.line1')}</h1>
        <h1 className="hero-txt line-2">{t('hero.line2')}</h1>
        <h1 className="hero-txt line-3">{t('hero.line3')}</h1>
      </div>

      <div className="hero-bottom-right">
        <span className="learn-more-label">{t('hero.learn')}</span>
        <button className="hero-btn-square" aria-label="Learn More">
          <Plus size={20} strokeWidth={2.5} color="var(--color-white)" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
