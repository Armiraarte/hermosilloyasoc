import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './gsapEffects';
import './SectionLight.css';

gsap.registerPlugin(ScrollTrigger);

interface SectionLightProps {
  /** Lado desde el que cae el foco ambiental. */
  side?: 'left' | 'right' | 'center';
}

// Efecto de luz común a todas las secciones. Se coloca como primer hijo de una sección
// con `position: relative`; la sección que lo contiene es el disparador del scroll.
const SectionLight: React.FC<SectionLightProps> = ({ side = 'center' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const section = layer?.parentElement;
    if (!layer || !section) return;

    const rim = layer.querySelector('.section-light__rim');
    const spot = layer.querySelector('.section-light__spot');
    const band = layer.querySelector('.section-light__band');

    if (prefersReducedMotion()) {
      gsap.set(rim, { scaleX: 1, opacity: 0.6 });
      gsap.set(spot, { opacity: 0.7 });
      return;
    }

    const dir = side === 'right' ? -1 : 1;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: section, start: 'top 85%', end: 'bottom 20%', scrub: 0.8 },
        })
        .fromTo(rim, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0)
        .to(rim, { opacity: 0.35, duration: 0.3 }, 0.6)
        .fromTo(spot, { opacity: 0, yPercent: -12, xPercent: -8 * dir }, { opacity: 1, yPercent: 0, xPercent: 0, duration: 0.3, ease: 'sine.out' }, 0)
        .to(spot, { opacity: 0.45, yPercent: 25, duration: 0.7 }, 0.3)
        .fromTo(band, { xPercent: dir > 0 ? -110 : 180 }, { xPercent: dir > 0 ? 180 : -110, duration: 0.65 }, 0.05)
        .fromTo(band, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.05)
        .to(band, { opacity: 0, duration: 0.15 }, 0.55);
    }, layer);

    return () => ctx.revert();
  }, [side]);

  return (
    <div ref={ref} className="section-light" data-side={side} aria-hidden="true">
      <span className="section-light__spot" />
      <span className="section-light__band" />
      <span className="section-light__rim" />
    </div>
  );
};

export default SectionLight;
