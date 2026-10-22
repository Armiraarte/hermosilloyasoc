
import React, { useState, useEffect } from 'react';
import { IMAGENES } from '../imagenes_url';
import Reveal from './Reveal';

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-MX', { hour12: false }) + " MX";
};

// Reloj aislado: solo este nodo se actualiza cada segundo (antes re-renderizaba todo el Footer).
const LiveClock: React.FC = () => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="text-[10px] font-mono text-gray-300 tracking-widest">{formatTime(time)}</span>;
};

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white pt-24 pb-8 border-t border-white/10 font-sans relative z-10">
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 items-start">
            
            {/* --- COL 1: IDENTITY CARD (Estilo Dashboard) --- */}
            <Reveal direction="right" width="100%" className="lg:col-span-4">
                <div className="bg-[#080808] border border-white/10 rounded-2xl p-8 max-w-sm relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-white/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-900/10 transition-colors"></div>

                    {/* Header Card */}
                    <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-4">
                         <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                            <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">ONLINE</span>
                         </div>
                    </div>

                    {/* Logo & Brand */}
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 border border-white/20 rounded-lg flex items-center justify-center bg-white/5">
                             <img 
                                src={IMAGENES.assets.logos.footer} 
                                alt="Logo" 
                                className="w-10 h-10 object-contain filter brightness-0 invert opacity-80" 
                             />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl text-white leading-none mb-1">Hermosillo</h2>
                            <p className="text-[9px] text-gray-500 uppercase tracking-[0.15em]">Y Asociados</p>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 text-xs font-light leading-relaxed border-t border-white/5 pt-6">
                        Excelencia, estrategia y compromiso legal en cada defensa. Tu patrimonio, nuestra prioridad.
                    </p>
                </div>
            </Reveal>

            {/* --- COL 2: NAVEGACIÓN --- */}
            <Reveal direction="right" delay={0.08} width="100%" className="lg:col-span-2 lg:col-start-6 pt-4">
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Navegación</h3>
                </div>
                <ul className="space-y-4">
                    {[
                        { name: 'Inicio', href: '#inicio' },
                        { name: 'Quiénes Somos', href: '#nosotros' },
                        { name: 'Servicios', href: '#servicios' },
                        { name: 'Nuestro Equipo', href: '#equipo' },
                        { name: 'Instalaciones', href: '#instalaciones' },
                        { name: 'Contacto', href: '#contacto' },
                        { name: 'Abogados Guadalajara', href: '/abogados-guadalajara/' },
                        { name: 'Hermosillo y Asociados', href: '/hermosillo-y-asociados/' }
                    ].map((item) => (
                        <li key={item.name}>
                            <a href={item.href} className="text-gray-400 hover:text-white transition-colors text-sm font-light tracking-wide block hover:translate-x-1 transition-transform">
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </Reveal>

            {/* --- COL 3: REDES SOCIALES --- */}
            <Reveal direction="left" delay={0.12} width="100%" className="lg:col-span-2 pt-4">
                 <div className="flex items-center gap-2 mb-6">
                    <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Redes</h3>
                </div>
                <div className="space-y-4">
                    <a
                        href="https://www.instagram.com/hermosilloyasociados/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm font-light tracking-wide"
                    >
                        <span className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-pink-500/50 group-hover:bg-pink-500/10 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <rect x="4" y="4" width="16" height="16" rx="4"></rect>
                                <circle cx="12" cy="12" r="4"></circle>
                                <circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none"></circle>
                            </svg>
                        </span>
                        <span className="group-hover:text-pink-400 transition-colors">Instagram</span>
                    </a>
                    <a
                        href="https://www.facebook.com/share/1aTfrsosZj/?mibextid=wwXIfr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm font-light tracking-wide"
                    >
                        <span className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.5 8.5V7a1 1 0 011-1h1.5V4h-2.2c-2.4 0-3.8 1.4-3.8 3.7v.8H8v2.2h2v7.3h2.7V10.7H16l.4-2.2h-2.2z" />
                            </svg>
                        </span>
                        <span className="group-hover:text-blue-400 transition-colors">Facebook</span>
                    </a>
                </div>
            </Reveal>

            {/* --- COL 4: CONTACTO (COLORES PRO) --- */}
            <Reveal direction="left" delay={0.16} width="100%" className="lg:col-span-3 pt-4">
                 <div className="flex items-center gap-2 mb-8">
                    <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Contacto</h3>
                </div>
                <div className="space-y-6">
                    
                    {/* DIRECCIÓN: Hover Ámbar/Dorado */}
                    <div className="flex gap-4 group cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-all duration-300">
                             <svg className="w-4 h-4 text-gray-500 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                        </div>
                        <p className="text-gray-400 text-sm font-light leading-relaxed group-hover:text-amber-100 transition-colors duration-300">
                            {IMAGENES.contacto.direccion.linea1},<br/>
                            {IMAGENES.contacto.direccion.linea2}
                        </p>
                    </div>

                    {/* TELÉFONO: Hover Esmeralda/Verde */}
                    <div className="flex gap-4 group cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all duration-300">
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-sm font-light tracking-wide group-hover:text-emerald-100 transition-colors duration-300 flex items-center">
                            {IMAGENES.contacto.telefono_visible}
                        </p>
                    </div>

                    {/* EMAIL: Hover Cian/Azul */}
                    <div className="flex gap-4 group cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all duration-300">
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <a href={`mailto:${IMAGENES.contacto.email}`} className="text-gray-400 group-hover:text-cyan-100 transition-colors duration-300 text-sm font-light tracking-wide break-all flex items-center">
                            {IMAGENES.contacto.email}
                        </a>
                    </div>
                </div>
            </Reveal>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <Reveal
            direction="up"
            width="100%"
            className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6"
        >
            
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">
                © {new Date().getFullYear()} Grupo Hermosillo De Occidente S.A De C.V
            </p>

            {/* Time Widget */}
            <div className="hidden md:flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5">
                <div className="flex gap-0.5">
                    <span className="w-0.5 h-2 bg-white/40"></span>
                    <span className="w-0.5 h-3 bg-white/60"></span>
                    <span className="w-0.5 h-2 bg-white/40"></span>
                </div>
                <LiveClock />
            </div>

            <button 
                onClick={scrollToTop}
                className="bg-white text-black hover:bg-gray-200 transition-colors px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-sm"
            >
                SUBIR
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>

        </Reveal>

      </div>
    </footer>
  );
};

export default Footer;
