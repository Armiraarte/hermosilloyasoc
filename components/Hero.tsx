
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './gsapEffects';
import { IMAGENES } from '../imagenes_url';
import { WHATSAPP_URLS } from '../whatsapp_urls';

gsap.registerPlugin(ScrollTrigger);

// Balanza de la justicia: línea fina platino con anillos orbitales.
// Se dibuja dos veces (escritorio y móvil); uid evita ids de gradiente repetidos.
const ScaleArt: React.FC<{ uid: string; className?: string }> = ({ uid, className }) => (
    <svg viewBox="0 0 600 600" className={className} data-scale-art>
      <defs>
        <linearGradient id={`${uid}-sg`} gradientUnits="userSpaceOnUse" x1="60" y1="60" x2="540" y2="540">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#9a9aa4" />
          <stop offset="1" stopColor="#f2f2f6" />
        </linearGradient>
        <radialGradient id={`${uid}-sc-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#6f9bff" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#6f9bff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#6f9bff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-sc-pan`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
        </linearGradient>
        <path id={`${uid}-sc-text-ring`} d="M 300 300 m -262 0 a 262 262 0 1 1 524 0 a 262 262 0 1 1 -524 0" />
      </defs>

      <circle className="sc-glow" cx="300" cy="300" r="300" fill={`url(#${uid}-sc-glow)`} />

      {/* Anillos orbitales */}
      <g className="sc-ring-a" fill="none">
        <circle cx="300" cy="300" r="280" stroke="#fff" strokeOpacity="0.16" strokeDasharray="2 10" />
        <circle cx="300" cy="300" r="244" stroke="#fff" strokeOpacity="0.07" />
        <text fill="#fff" fillOpacity="0.32" fontSize="11" letterSpacing="9" fontFamily="'Cinzel', serif">
          <textPath href={`#${uid}-sc-text-ring`} startOffset="0">IUSTITIA · FIDES · VERITAS · AEQUITAS · IUSTITIA · FIDES · VERITAS · AEQUITAS ·</textPath>
        </text>
      </g>
      <g className="sc-ring-b" fill="none" stroke="#fff">
        <circle cx="300" cy="300" r="214" strokeOpacity="0.1" />
        {[...Array(72)].map((_, i) => {
          const a = (i * 5 * Math.PI) / 180;
          const long = i % 6 === 0;
          const r1 = 214;
          const r2 = long ? 200 : 207;
          return (
            <line
              key={i}
              x1={300 + r1 * Math.cos(a)}
              y1={300 + r1 * Math.sin(a)}
              x2={300 + r2 * Math.cos(a)}
              y2={300 + r2 * Math.sin(a)}
              strokeOpacity={long ? 0.45 : 0.2}
            />
          );
        })}
      </g>

      {/* Partículas en órbita */}
      {[
        { r: 280, a: 20, s: 3 },
        { r: 244, a: 140, s: 2.4 },
        { r: 214, a: 250, s: 2.8 },
        { r: 280, a: 300, s: 2 },
      ].map((o, i) => (
        <g key={i} className="sc-orbit" data-speed={i % 2 ? -1 : 1}>
          <circle cx={300 + o.r * Math.cos((o.a * Math.PI) / 180)} cy={300 + o.r * Math.sin((o.a * Math.PI) / 180)} r={o.s} fill="#cfdcff" />
        </g>
      ))}

      {/* Balanza */}
      <g fill="none" stroke={`url(#${uid}-sg)`} strokeLinecap="round" strokeLinejoin="round">
        {/* base y columna */}
        <path className="sc-draw" pathLength={1} d="M 220 500 L 380 500" strokeWidth="2.5" />
        <path className="sc-draw" pathLength={1} d="M 240 500 Q 300 470 360 500" strokeWidth="1.8" />
        <path className="sc-draw" pathLength={1} d="M 300 194 L 300 486" strokeWidth="3" />
        <path className="sc-draw" pathLength={1} d="M 288 400 Q 300 388 312 400 M 290 330 Q 300 320 310 330" strokeWidth="1.5" />
        <circle className="sc-draw" pathLength={1} cx="300" cy="170" r="12" strokeWidth="2.2" />
      </g>

      {/* Astil (se inclina) */}
      <g className="sc-beam" fill="none" stroke={`url(#${uid}-sg)`} strokeLinecap="round">
        <path className="sc-draw" pathLength={1} d="M 112 190 L 488 190" strokeWidth="3.2" />
        <path className="sc-draw" pathLength={1} d="M 112 190 Q 206 168 300 190 Q 394 168 488 190" strokeWidth="1.4" />
        <circle className="sc-draw" pathLength={1} cx="112" cy="190" r="7" strokeWidth="2" />
        <circle className="sc-draw" pathLength={1} cx="488" cy="190" r="7" strokeWidth="2" />
        <circle cx="300" cy="190" r="9" fill="#05060a" strokeWidth="2.4" />
        <circle cx="300" cy="190" r="3" fill="#bcd0ff" stroke="none" />
      </g>

      {/* Platillos: cuelgan siempre rectos */}
      {['sc-pan-l', 'sc-pan-r'].map((cls) => (
        <g key={cls} className={cls} fill="none" stroke={`url(#${uid}-sg)`} strokeLinecap="round">
          <path className="sc-draw" pathLength={1} d="M 0 0 L -74 128 M 0 0 L 74 128 M 0 0 L 0 140" strokeWidth="1.2" strokeOpacity="0.8" />
          <path className="sc-draw" pathLength={1} d="M -82 128 Q 0 205 82 128 Z" strokeWidth="2.4" fill={`url(#${uid}-sc-pan)`} />
          <ellipse cx="0" cy="128" rx="82" ry="7" strokeWidth="1.6" />
        </g>
      ))}
    </svg>
);

const Hero: React.FC = () => {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Entrada coreografiada
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-bigword', { opacity: 0, y: 80, duration: 1.6 }, 0.1)
        .from('.hero-rule', { scaleX: 0, duration: 0.9 }, 0.4)
        .from('.hero-kicker', { opacity: 0, x: -20, duration: 0.9 }, 0.4)
        .from('.hero-line', { yPercent: 110, duration: 1.1, stagger: 0.14 }, 0.5)
        .from('.hero-fade', { opacity: 0, y: 24, duration: 0.9, stagger: 0.12 }, 1.0);

      // Balanza: se dibuja, se pesa (oscilación amortiguada) y respira
      const BEAM_Y = 190;
      const HALF = 188;
      const pose = { th: 0 };
      const applyPose = () => {
        const rad = (pose.th * Math.PI) / 180;
        gsap.set('.sc-beam', { svgOrigin: `300 ${BEAM_Y}`, rotation: pose.th });
        gsap.set('.sc-pan-l', { x: 300 - HALF * Math.cos(rad), y: BEAM_Y - HALF * Math.sin(rad) });
        gsap.set('.sc-pan-r', { x: 300 + HALF * Math.cos(rad), y: BEAM_Y + HALF * Math.sin(rad) });
      };
      applyPose();

      gsap.set('.sc-draw', { strokeDasharray: 1, strokeDashoffset: 1 });
      const intro = gsap.timeline({ delay: 0.3 });
      intro
        .fromTo('.sc-glow', { opacity: 0, scale: 0.7, svgOrigin: '300 300' }, { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
        .fromTo('.sc-ring-a, .sc-ring-b', { opacity: 0 }, { opacity: 1, duration: 1.4, stagger: 0.2 }, 0.1)
        // Cada copia de la balanza (escritorio y móvil) se dibuja a la vez, no una tras otra
        .add(gsap.utils.toArray<SVGSVGElement>('[data-scale-art]').map((svg) =>
          gsap.to(svg.querySelectorAll('.sc-draw'), { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.07 })
        ), 0.3)
        .add(() => weigh(8), 1.9);

      // "Pesaje": el astil parte inclinado y se estabiliza con rebote elástico
      const weigh = (from: number) => {
        pose.th = from;
        gsap.to(pose, { th: 0, duration: 3.6, ease: 'elastic.out(1, 0.28)', onUpdate: applyPose });
      };
      const idle: gsap.core.Animation[] = [];
      const recurring = gsap.delayedCall(8, function again() {
        weigh(gsap.utils.random([-7, 7, -9, 9]));
        recurring.restart(true);
      });
      idle.push(recurring);
      // Respiración continua, muy sutil
      const breath = { v: 0 };
      idle.push(gsap.to(breath, { v: 1, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: () => {
        // solo se aplica cuando el pesaje terminó (th ≈ 0)
        if (Math.abs(pose.th) < 0.05) {
          const th = (breath.v - 0.5) * 1.6;
          const rad = (th * Math.PI) / 180;
          gsap.set('.sc-beam', { svgOrigin: `300 ${BEAM_Y}`, rotation: th });
          gsap.set('.sc-pan-l', { x: 300 - HALF * Math.cos(rad), y: BEAM_Y - HALF * Math.sin(rad) });
          gsap.set('.sc-pan-r', { x: 300 + HALF * Math.cos(rad), y: BEAM_Y + HALF * Math.sin(rad) });
        }
      } }));

      // Anillos y partículas giran lentamente
      idle.push(gsap.to('.sc-ring-a', { rotation: 360, svgOrigin: '300 300', duration: 140, ease: 'none', repeat: -1 }));
      idle.push(gsap.to('.sc-ring-b', { rotation: -360, svgOrigin: '300 300', duration: 200, ease: 'none', repeat: -1 }));
      gsap.utils.toArray<SVGGElement>('.sc-orbit').forEach((el, i) => {
        const dir = Number(el.dataset.speed ?? 1);
        idle.push(gsap.to(el, { rotation: 360 * dir, svgOrigin: '300 300', duration: 50 + i * 18, ease: 'none', repeat: -1 }));
      });
      idle.push(gsap.to('.sc-glow', { opacity: 0.6, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 }));

      idle.push(gsap.fromTo('.hero-scroll', { scaleY: 0 }, { scaleY: 1, duration: 1.4, ease: 'power2.inOut', repeat: -1, repeatDelay: 0.4 }));

      // Los bucles infinitos solo corren mientras el hero está en pantalla
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => idle.forEach((a) => a.paused(!self.isActive)),
      });

      // Parallax con el mouse (solo punteros finos): cada capa se mueve según su profundidad
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const layers = gsap.utils.toArray<HTMLElement>('.hero-layer');
      const setters = layers.map((el) => ({
        depth: parseFloat(el.dataset.depth ?? '0'),
        x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'yPercent', { duration: 1.1, ease: 'power3.out' }),
      }));
      const onMove = (e: MouseEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        setters.forEach((s) => {
          s.x(-nx * 60 * s.depth);
          s.y(-ny * 3 * s.depth);
        });
      };
      if (fine) section.addEventListener('mousemove', onMove);

      // Parallax con el scroll: la figura se queda atrás y el texto se desvanece
      gsap.to('.hero-layer[data-depth="0.6"]', { y: 120, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-layer[data-depth="0.25"]', { y: 40, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true } });

      return () => section.removeEventListener('mousemove', onMove);
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isDesktop || prefersReducedMotion) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShouldLoadVideo(true);
    }, 150);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} id="inicio" className="relative min-h-[100dvh] flex items-center pt-32 pb-24 overflow-hidden bg-black">
      
      {/* ================= BACKGROUND VIDEO LAYER ================= */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          {shouldLoadVideo ? (
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              preload="metadata"
              poster={IMAGENES.assets.hero.videoPoster}
              aria-label="Video de fondo de Hermosillo y Asociados"
              className="w-full h-full object-cover opacity-40 grayscale contrast-125"
            >
               <source src={IMAGENES.assets.hero.videoBackgroundWebm} type="video/webm" />
               <source src={IMAGENES.assets.hero.videoBackground} type="video/mp4" />
            </video>
          ) : (
            <img
              src={IMAGENES.assets.hero.videoPoster}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              className="w-full h-full object-cover opacity-40 grayscale contrast-125"
            />
          )}

          {/* Overlay Gradient: Negro puro a transparente para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      {/* Palabra gigante en contorno, detrás de la figura (capa de profundidad) */}
      <div
        data-depth="0.25"
        className="hero-layer pointer-events-none absolute inset-x-0 bottom-[6%] z-[1] select-none text-center font-serif font-bold leading-none"
        aria-hidden="true"
      >
        <span
          className="hero-bigword block text-[11.5vw] tracking-[0.02em]"
          style={{ fontFamily: "'Cinzel', serif", WebkitTextStroke: '1px rgba(255,255,255,0.14)', color: 'transparent' }}
        >
          HERMOSILLO
        </span>
      </div>

      {/* Retícula de líneas finas */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage: 'radial-gradient(ellipse at 70% 50%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 70% 50%, black 10%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Balanza en escritorio: a la derecha del texto */}
      <div
        data-depth="0.6"
        className="hero-layer pointer-events-none absolute right-0 top-[14%] bottom-[2%] z-[2] hidden w-[52%] items-center justify-center lg:flex"
        aria-hidden="true"
      >
        <ScaleArt uid="d" className="h-full max-h-[82vh] w-full overflow-visible" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 md:px-12">
        <div className="max-w-3xl">
          <p className="hero-kicker mb-8 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.35em] text-gray-300 md:text-xs">
            <span className="hero-rule block h-px w-14 origin-left bg-gradient-to-r from-blue-500 to-transparent" />
            Abogados en Guadalajara
          </p>

          <h1 className="text-white">
            <span className="block overflow-hidden pb-1">
              <span
                className="hero-line block text-[clamp(2rem,10.5vw,3rem)] font-bold uppercase leading-[1.05] tracking-[0.06em] md:text-6xl lg:text-7xl"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Hermosillo
              </span>
            </span>
            <span className="block overflow-hidden pb-3">
              <span
                className="hero-line block text-6xl font-medium italic leading-[1] text-gray-300 md:text-7xl lg:text-8xl"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                y Asociados<span className="text-blue-400">.</span>
              </span>
            </span>
          </h1>

          {/* Balanza en móvil y tablet: debajo del título, sin encimarse al texto */}
          <div className="pointer-events-none mx-auto mt-8 w-full max-w-[300px] sm:max-w-[360px] lg:hidden" aria-hidden="true">
            <ScaleArt uid="m" className="h-auto w-full overflow-visible" />
          </div>

          <p className="hero-fade mt-10 max-w-md border-l border-white/20 pl-6 text-base font-light leading-relaxed tracking-wide text-gray-300 md:text-lg">
            Defensa estratégica y certeza legal para quienes exigen excelencia.
          </p>

          <div className="hero-fade mt-12 flex flex-wrap items-center gap-6">
            <a
              href={`https://wa.me/${WHATSAPP_URLS.general}?text=Hola, deseo agendar una cita o recibir informes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full border border-white bg-white px-10 py-4 text-black transition-all duration-500 hover:bg-transparent hover:text-white"
            >
              <span className="relative z-10 text-sm font-bold uppercase tracking-[0.15em]">Agendar Cita</span>
              <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="#servicios"
              className="text-xs font-medium uppercase tracking-[0.25em] text-gray-400 transition-colors hover:text-white"
            >
              Ver áreas ↓
            </a>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="hero-fade pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex" aria-hidden="true">
        <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-gray-500">Scroll</span>
        <span className="hero-scroll block h-10 w-px origin-top bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
};

export default Hero;

