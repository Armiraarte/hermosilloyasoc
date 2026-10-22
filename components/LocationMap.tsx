
import React from 'react';
import { IMAGENES } from '../imagenes_url';
import Reveal from './Reveal';

const LocationMap: React.FC = () => {
  return (
    <section className="relative w-full h-[500px] bg-black overflow-hidden border-t border-white/10 group">
      
      {/* ================= MAPA (IFRAME COLORIDO & INTERACTIVO) ================= */}
      <div className="absolute inset-0 z-0">
        <iframe 
          title="Ubicación Grupo Hermosillo"
          width="100%" 
          height="100%" 
          frameBorder="0" 
          marginHeight={0} 
          marginWidth={0} 
          src={IMAGENES.contacto.direccion.googleMapsLink}
          className="w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-700"
          style={{ filter: 'contrast(1.1) saturate(1.2)' }}
          allowFullScreen
          loading="lazy"
        ></iframe>
        
        {/* Vignette Overlay - pointer-events-none is crucial here */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#000000_100%)] pointer-events-none"></div>
        
        {/* Scanline Effect - pointer-events-none */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-10"></div>
      </div>

      {/* ================= HUD OVERLAYS (Futuristic UI) ================= */}
      <div className="absolute inset-0 z-20 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
        
        {/* Top Bar HUD */}
        <div className="flex justify-between items-start">
            <Reveal direction="right" className="flex flex-col gap-1 pointer-events-auto">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
                    <span className="text-[10px] md:text-xs font-mono text-blue-400 tracking-[0.2em] uppercase">Ubicación</span>
                </div>
                <h3 className="text-xl md:text-3xl font-serif text-white font-bold tracking-tight drop-shadow-lg text-shadow-black">
                    Oficinas Corporativas
                </h3>
            </Reveal>
            
            {/* Coordinates Box */}
            <Reveal
                direction="left"
                delay={0.08}
                className="hidden md:block bg-black/75 border border-white/10 p-3 rounded-sm shadow-lg pointer-events-auto"
            >
                <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
                    <div>
                        <span className="block text-gray-500 uppercase tracking-widest text-[8px]">Latitud</span>
                        <span className="text-white">20.6652° N</span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/20"></div>
                    <div>
                         <span className="block text-gray-500 uppercase tracking-widest text-[8px]">Longitud</span>
                        <span className="text-white">103.4024° W</span>
                    </div>
                </div>
            </Reveal>
        </div>

        {/* Center Target/Reticle - kept for aesthetics but pointer-events-none ensures it doesn't block map */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-64 md:h-64 border border-white/20 rounded-full flex items-center justify-center pointer-events-none opacity-40">
            <div className="absolute inset-0 rounded-full border border-t-white/40 border-b-transparent border-l-transparent border-r-transparent"></div>
            <div className="w-[1px] h-4 bg-white/40 absolute top-0"></div>
            <div className="w-[1px] h-4 bg-white/40 absolute bottom-0"></div>
            <div className="h-[1px] w-4 bg-white/40 absolute left-0"></div>
            <div className="h-[1px] w-4 bg-white/40 absolute right-0"></div>
            
            {/* The Pin Point */}
            <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] animate-pulse"></div>
            </div>
        </div>

        {/* Bottom Bar HUD */}
        <div className="flex justify-between items-end">
             <Reveal
                 direction="right"
                 className="bg-black/80 border-l-2 border-blue-500 pl-4 py-3 pr-8 rounded-r-lg shadow-xl pointer-events-auto"
             >
                 <p className="text-[10px] text-gray-300 font-mono mb-1 uppercase tracking-widest">Dirección Corporativa</p>
                 <p className="text-sm md:text-base text-white font-medium">{IMAGENES.contacto.direccion.linea1}</p>
                 <p className="text-xs text-gray-400">{IMAGENES.contacto.direccion.linea2}</p>
             </Reveal>

             {/* Decorative Tech Lines */}
             <Reveal
                 direction="left"
                 delay={0.08}
                 className="hidden md:flex flex-col items-end gap-1 opacity-70"
             >
                <div className="flex gap-1">
                    <div className="w-8 h-1 bg-white/20"></div>
                    <div className="w-2 h-1 bg-white/20"></div>
                    <div className="w-12 h-1 bg-white/60"></div>
                </div>
                <div className="flex gap-1">
                    <div className="w-4 h-1 bg-white/20"></div>
                    <div className="w-16 h-1 bg-white/40"></div>
                </div>
             </Reveal>
        </div>

      </div>

    </section>
  );
};

export default LocationMap;
