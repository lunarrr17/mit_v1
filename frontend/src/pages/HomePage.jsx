import { useRef, useState } from 'react';
import Hero from '../Hero';
import Values from '../Values';
import Timeline from '../Timeline';
import Vision from '../Vision';
import Team from '../Team';

const HomePage = () => {
  const [autoPlaying, setAutoPlaying] = useState(false);
  const autoPlayRef = useRef(null);

  const stopAutoplay = () => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    setAutoPlaying(false);
  };

  const runSectionAutoplay = () => {
    const sections = Array.from(document.querySelectorAll('[data-autoplay-section]'));
    if (!sections.length) return;

    stopAutoplay();
    setAutoPlaying(true);

    let index = 0;
    const scrollNext = () => {
      if (index >= sections.length) {
        stopAutoplay();
        return;
      }

      sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
      index += 1;
      autoPlayRef.current = setTimeout(scrollNext, 1500);
    };

    scrollNext();
  };

  return (
    <>
      <div data-autoplay-section id="hero">
        <Hero />
      </div>
      <div data-autoplay-section id="values">
        <Values />
      </div>
      <div data-autoplay-section id="timeline">
        <Timeline />
      </div>
      <div data-autoplay-section id="vision">
        <Vision />
      </div>
      <div data-autoplay-section id="team">
        <Team />
      </div>
    </>
  );
};

export default HomePage;

