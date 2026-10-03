import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './gsapEffects';

gsap.registerPlugin(ScrollTrigger);

export type FigureVariant = 'archive' | 'temple' | 'book' | 'laurel' | 'building' | 'contact';

// Cada figura se dibuja en un lienzo de 400x400 con trazo platino fino.
const Figure: React.FC<{ variant: FigureVariant }> = ({ variant }) => {
  const d = { className: 'sf-draw', pathLength: 1 } as const;

  switch (variant) {
    case 'archive':
      return (
        <>
          <path {...d} d="M100 190 V310 H300 V190 H206 L190 170 H116 Q100 170 100 190 Z" />
          <path {...d} d="M100 220 H300" />
          <path {...d} d="M120 170 V130 H260 V190" />
          <path {...d} d="M140 150 H235 M140 166 H215" />
          <circle {...d} cx="286" cy="296" r="32" fill="#05060a" />
          <path {...d} d="M270 296 l12 13 l22 -26" strokeWidth={3} />
          <path {...d} d="M126 250 H250 M126 270 H214" />
        </>
      );
    case 'temple':
      return (
        <>
          <path {...d} d="M70 150 L200 80 L330 150 Z" />
          <circle {...d} cx="200" cy="125" r="13" />
          <path {...d} d="M84 162 H316 M84 174 H316" />
          {[110, 155, 200, 245, 290].map((x) => (
            <g key={x}>
              <path {...d} d={`M${x - 14} 182 H${x + 14}`} />
              <path {...d} d={`M${x - 9} 182 V292 M${x + 9} 182 V292`} />
              <path {...d} d={`M${x - 14} 292 H${x + 14}`} />
            </g>
          ))}
          <path {...d} d="M76 304 H324 M66 316 H334 M56 328 H344" />
        </>
      );
    case 'book':
      return (
        <>
          <path {...d} d="M200 150 Q135 126 72 150 V300 Q135 276 200 300 Z" />
          <path {...d} d="M200 150 Q265 126 328 150 V300 Q265 276 200 300 Z" />
          <path {...d} d="M96 180 Q135 168 176 180 M96 204 Q135 192 176 204 M96 228 Q135 216 176 228 M96 252 Q135 240 176 252" />
          <path {...d} d="M224 180 Q265 168 304 180 M224 204 Q265 192 304 204" />
          <text x="264" y="268" textAnchor="middle" fontSize="52" fill="#dfe6ff" fillOpacity="0.8" stroke="none" fontFamily="'Cormorant Garamond', serif">§</text>
          <path {...d} d="M276 296 V345 L288 334 L300 345 V300" />
        </>
      );
    case 'laurel': {
      const leaves = [...Array(9)].map((_, i) => {
        const a = ((130 + i * 13) * Math.PI) / 180;
        return { x: 200 + 128 * Math.cos(a), y: 220 + 128 * Math.sin(a), rot: (a * 180) / Math.PI };
      });
      return (
        <>
          <path {...d} d="M200 96 L292 128 V212 Q292 274 200 316 Q108 274 108 212 V128 Z" />
          <path {...d} d="M200 118 L272 142 V210 Q272 260 200 296 Q128 260 128 210 V142 Z" strokeOpacity={0.5} />
          <text x="200" y="228" textAnchor="middle" fontSize="54" fill="#fff" fillOpacity="0.85" stroke="none" fontFamily="'Cinzel', serif" fontWeight="700">HA</text>
          {leaves.map((l, i) => (
            <g key={i}>
              <ellipse {...d} cx={l.x} cy={l.y} rx="5" ry="14" transform={`rotate(${l.rot} ${l.x} ${l.y})`} />
              <ellipse {...d} cx={400 - l.x} cy={l.y} rx="5" ry="14" transform={`rotate(${180 - l.rot} ${400 - l.x} ${l.y})`} />
            </g>
          ))}
        </>
      );
    }
    case 'building':
      return (
        <>
          <path {...d} d="M130 320 V92 H270 V320" />
          <path {...d} d="M200 92 V56 M190 70 H210" />
          {[...Array(7)].flatMap((_, r) =>
            [0, 1, 2, 3].map((c) => (
              <rect key={`${r}-${c}`} {...d} x={146 + c * 29} y={112 + r * 26} width="16" height="14" rx="2" />
            ))
          )}
          <path {...d} d="M130 320 H270 M186 320 V296 H214 V320" />
          <path {...d} d="M70 320 V210 H130 M270 240 H330 V320" />
          <path {...d} d="M84 232 H116 M84 254 H116 M84 276 H116 M284 260 H316 M284 282 H316" />
          <path {...d} d="M40 320 H360" />
        </>
      );
    case 'contact':
      return (
        <>
          <path {...d} d="M200 170 C200 170 148 128 148 96 A52 52 0 0 1 252 96 C252 128 200 170 200 170 Z" />
          <circle {...d} cx="200" cy="96" r="17" />
          <rect {...d} x="86" y="200" width="228" height="130" rx="10" />
          <path {...d} d="M86 208 L200 282 L314 208" />
          <path {...d} d="M86 322 L160 262 M314 322 L240 262" strokeOpacity={0.5} />
        </>
      );
  }
};

interface SectionFigureProps {
  variant: FigureVariant;
  className?: string;
}

const SectionFigure: React.FC<SectionFigureProps> = ({ variant, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.set(q('.sf-draw'), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q('.sf-ring, .sf-glow'), { opacity: 0 });

      gsap
        .timeline({ scrollTrigger: { trigger: root, start: 'top 85%', once: true } })
        .to(q('.sf-glow'), { opacity: 1, duration: 1.6, ease: 'power2.out' }, 0)
        .to(q('.sf-ring'), { opacity: 1, duration: 1.2, stagger: 0.2 }, 0.1)
        .to(q('.sf-draw'), { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.06 }, 0.2);

      // Movimiento continuo: se pausa cuando la figura sale de pantalla
      const idle = [
        gsap.to(q('.sf-ring-a'), { rotation: 360, svgOrigin: '200 200', duration: 120, ease: 'none', repeat: -1 }),
        gsap.to(q('.sf-ring-b'), { rotation: -360, svgOrigin: '200 200', duration: 180, ease: 'none', repeat: -1 }),
        gsap.to(q('.sf-art'), { y: -8, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
      ];
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => idle.forEach((tw) => tw.paused(!self.isActive)),
      });
      idle.forEach((tw) => tw.paused(true));
    }, root);

    return () => ctx.revert();
  }, [variant]);

  const id = `sf-grad-${variant}`;
  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute z-0 ${className}`}>
      <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="40" y1="40" x2="360" y2="360">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#9a9aa4" />
            <stop offset="1" stopColor="#f2f2f6" />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#6f9bff" stopOpacity="0.3" />
            <stop offset="1" stopColor="#6f9bff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="sf-glow" cx="200" cy="200" r="200" fill={`url(#${id}-glow)`} />
        <g className="sf-ring-a" fill="none">
          <circle className="sf-ring" cx="200" cy="200" r="190" stroke="#fff" strokeOpacity="0.16" strokeDasharray="2 9" />
        </g>
        <g className="sf-ring-b" fill="none">
          <circle className="sf-ring" cx="200" cy="200" r="172" stroke="#fff" strokeOpacity="0.07" />
          <circle className="sf-ring" cx="200" cy="28" r="3" fill="#cfdcff" />
        </g>
        <g className="sf-art" fill="none" stroke={`url(#${id})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <Figure variant={variant} />
        </g>
      </svg>
    </div>
  );
};

export default SectionFigure;
