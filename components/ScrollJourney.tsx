import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './gsapEffects';

gsap.registerPlugin(ScrollTrigger);

const ScrollJourney: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    // 1) Barra de progreso global
    const barTween = reduced
      ? null
      : gsap.fromTo(
          barRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
          }
        );

    // 2) Los cambios de altura (imágenes, secciones diferidas) desajustan los triggers
    let refreshTimer = 0;
    let lastHeight = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        const h = document.body.scrollHeight;
        if (Math.abs(h - lastHeight) > 4) {
          lastHeight = h;
          ScrollTrigger.refresh();
        }
      }, 400);
    });
    ro.observe(document.body);

    return () => {
      ro.disconnect();
      window.clearTimeout(refreshTimer);
      barTween?.scrollTrigger?.kill();
      barTween?.kill();
    };
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[70] pointer-events-none">
        <div
          ref={barRef}
          className="h-full origin-left bg-gradient-to-r from-gray-500 via-white to-blue-400 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

    </>
  );
};

export default ScrollJourney;
