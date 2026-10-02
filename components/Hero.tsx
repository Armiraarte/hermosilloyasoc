
import React, { useEffect, useState } from 'react';
import Reveal from './Reveal';
import { IMAGENES } from '../imagenes_url';
import { WHATSAPP_URLS } from '../whatsapp_urls';

const Hero: React.FC = () => {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center h-full">
        
        {/* Left Content - Typography & CTA */}
        <div className="flex flex-col justify-center items-start text-left">
          
          <Reveal direction="down" duration={1.0} delay={0.1}>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[0.9] text-white tracking-tight mb-10">
              Hermosillo <br />
              <span className="italic font-light text-gray-400">y Asociados.</span>
            </h1>
          </Reveal>
          
          <div className="mb-12 max-w-lg">
            <Reveal direction="right" delay={0.3} duration={0.8}>
                <div className="flex flex-col gap-5 pl-1">
                    <div className="flex items-center gap-4">
                        <div className="h-[2px] w-12 bg-blue-600 shadow-[0_0_15px_#2563eb]"></div>
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
                className="group relative inline-flex items-center gap-4 px-10 py-4 rounded-full bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-500 overflow-hidden"
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
        <div className="hidden lg:flex justify-end relative h-full items-center">
             <Reveal direction="none" delay={0.2} duration={1.2} className="relative z-10 w-full flex justify-end">
                <img 
                    src={IMAGENES.assets.hero.mainImage}
                    alt="Justicia"
                    className="w-auto max-w-full h-auto max-h-[85vh] object-contain opacity-100 drop-shadow-2xl"
                    style={{ 
                        filter: 'contrast(1.1) brightness(1.1)',
                        maskImage: 'linear-gradient(to left, black 70%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to left, black 70%, transparent 100%)'
                    }}
                />
             </Reveal>
        </div>

      </div>
    </section>
  );
};

export default Hero;

