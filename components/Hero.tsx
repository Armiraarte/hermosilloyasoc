
import React, { useEffect, useState } from 'react';
import Reveal from './Reveal';
import { IMAGENES } from '../imagenes_url';
import { WHATSAPP_URLS } from '../whatsapp_urls';
import { Column } from './Greek';

const Hero: React.FC = () => {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const isSlowConnection = Boolean(connection?.saveData) || /^(slow-2g|2g|3g)$/.test(connection?.effectiveType ?? '');

    if (!isDesktop || prefersReducedMotion || isSlowConnection) {
      return;
    }

    // El video es decorativo: se pide hasta que la pagina termino de cargar para no competir con el contenido.
    let timer: number | undefined;
    const scheduleVideo = () => {
      timer = window.setTimeout(() => setShouldLoadVideo(true), 1200);
    };

    if (document.readyState === 'complete') {
      scheduleVideo();
    } else {
      window.addEventListener('load', scheduleVideo, { once: true });
    }

    return () => {
      window.removeEventListener('load', scheduleVideo);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section id="inicio" className="relative min-h-[100dvh] flex items-center pt-32 pb-20 overflow-hidden bg-black">
      
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
              className="w-full h-full object-cover opacity-40"
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
              decoding="async"
              className="w-full h-full object-cover opacity-40"
            />
          )}

          {/* Overlay Gradient: Negro puro a transparente para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center h-full">
        
        {/* Left Content - Typography & CTA */}
        <div className="flex flex-col justify-center items-start text-left">
          
          <Reveal direction="down" duration={1.0} delay={0.1}>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl xl:text-[4.25rem] leading-[1.05] text-white tracking-[0.04em] uppercase mb-10">
              Hermosillo
              <span className="mt-3 block text-xl sm:text-2xl md:text-3xl font-normal tracking-[0.32em] text-gray-400">y Asociados.</span>
            </h1>
          </Reveal>
          
          <div className="mb-12 max-w-lg">
            <Reveal direction="right" delay={0.3} duration={0.8}>
                <div className="flex flex-col gap-5 pl-1">
                    <div className="flex items-center gap-4">
                        <div className="h-[2px] w-12 bg-platinum-600 shadow-[0_0_15px_#C5C8CE]"></div>
                        <h2 className="text-lg md:text-xl text-white font-sans font-medium uppercase tracking-[0.25em] drop-shadow-lg">
                          Abogados en Guadalajara
                        </h2>
                    </div>
                    <div className="pl-[4rem] border-l border-white/20">
                        <p className="text-gray-300 text-base md:text-lg font-light tracking-wide leading-relaxed pl-6">
                          Defensa estratégica y certeza legal para quienes exigen excelencia.
                        </p>
                    </div>
                </div>
            </Reveal>
          </div>

          <Reveal direction="up" delay={0.5}>
            <div>
                <a 
                href={`https://wa.me/${WHATSAPP_URLS.general}?text=Hola, deseo agendar una cita o recibir informes.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-4 px-10 py-4 rounded-sm bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-500 overflow-hidden"
                >
                    <span className="relative z-10 text-sm font-bold tracking-[0.15em] uppercase">
                        Agendar Cita
                    </span>
                    
                    {/* Flecha simple animada */}
                    <svg className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </a>
            </div>
          </Reveal>
        </div>

        {/* Right Content - Abstract or Image */}
        <div className="hidden lg:flex justify-end relative h-full min-h-[85vh] items-center">
             {/* Columnas doricas a los lados de la estatua */}
             <Column className="pointer-events-none absolute bottom-0 left-0 z-0 h-full w-auto text-platinum-500/30" />
             <Column className="pointer-events-none absolute bottom-0 right-0 z-0 h-full w-auto text-platinum-500/30" />
             <Reveal direction="none" delay={0} duration={0.7} className="relative z-10 w-full flex justify-end">
                <img 
                    src={IMAGENES.assets.hero.mainImage}
                    alt="Justicia"
                    width={1024}
                    height={1536}
                    loading="lazy"
                    decoding="async"
                    className="statue-drift w-auto max-w-full h-auto max-h-[85vh] object-contain opacity-100 drop-shadow-2xl"
                    style={{ 
                        filter: 'contrast(1.1) brightness(1.1)',
                        maskImage: 'linear-gradient(to left, black 70%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to left, black 70%, transparent 100%)'
                    }}
                />
             </Reveal>
        </div>

      </div>

      {/* Greca griega al pie del Hero */}
      <div className="greek-key absolute inset-x-0 bottom-0 z-10 opacity-70" aria-hidden="true"></div>
    </section>
  );
};

export default Hero;

