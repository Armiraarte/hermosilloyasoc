import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, SEQUENCE_START } from './gsapEffects';

gsap.registerPlugin(ScrollTrigger);

// Imágenes que ya tienen su propia coreografía.
const IMAGE_EXCLUDE = '#inicio, .team-section, .pt-card, [role="dialog"]';

// Descubre las imágenes de la página con una cortina, en el mismo punto de la pantalla
// en el que se revelan los contenedores (Reveal), para que todo aparezca en orden.
const SequenceReveal: React.FC = () => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      host.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        if (img.closest(IMAGE_EXCLUDE)) return;
        gsap.fromTo(
          img,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.3,
            ease: 'power3.inOut',
            clearProps: 'clipPath',
            scrollTrigger: { trigger: img, start: `clamp(${SEQUENCE_START})`, once: true },
          }
        );
      });
    }, host);
    return () => ctx.revert();
  }, []);

  return <span ref={ref} hidden />;
};

export default SequenceReveal;
