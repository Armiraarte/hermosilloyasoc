
import React, { useEffect, useRef, useState } from 'react';
import { IMAGENES } from '../imagenes_url';
import Reveal from './Reveal';

// Lista sincronizada con los títulos de la sección de Servicios
const serviceOptions = [
  "Trámites ante Notaría y Correduría",
  "Juicio Civil · Familiar · Mercantil",
  "Convenios de Validación IJA",
  "Registro Civil",
  "Juicios de Amparo",
  "Registro Público de la Propiedad",
  "Recursos Humanos y Blindaje Laboral",
  "Licencias y Permisos Ayuntamiento",
  "Secretaría de Movilidad",
  "Comercio Exterior y Aduanas",
  "Registro de Marca (IMPI)",
  "Otro Asunto"
];

const Contact: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState("");
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const alertTimerRef = useRef<number | null>(null);

  const handleSelect = (option: string) => {
    setSelectedInterest(option);
    setIsDropdownOpen(false);
  };

  const triggerAlert = (type: 'success' | 'error', text: string) => {
    setAlertMessage({ type, text });
    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
    }
    alertTimerRef.current = window.setTimeout(() => {
      setAlertMessage(null);
    }, 3500);
  };

  const dismissAlert = () => {
    setAlertMessage(null);
    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nombre = String(data.get('nombre') || '').trim();
    const telefono = String(data.get('telefono') || '').trim();
    const email = String(data.get('email') || '').trim();
    const mensaje = String(data.get('mensaje') || '').trim();
    const interes = selectedInterest.trim();

    if (!nombre || !telefono || !email || !mensaje || !interes) {
      triggerAlert('error', 'Completa el formulario para enviar.');
      return;
    }

    triggerAlert('success', 'Correo enviado. Nos pondremos en contacto contigo lo más rápido posible.');
    form.reset();
    setSelectedInterest('');
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
      }
    };
  }, []);

  return (
    // Se quitó bg-[#050505] para transparencia
    <section id="contacto" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      
      {/* ================= BACKGROUND ATMOSPHERE ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {/* IMAGEN DE FONDO AGREGADA */}
         <div className="absolute inset-0 z-0">
             <img 
                src={IMAGENES.assets.contactSection.backgroundImage} 
                alt="Fondo Corporativo" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-10 grayscale contrast-125"
             />
             {/* Gradient Overlay para integrar la imagen con el negro */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-[#050505]/60"></div>
             <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent"></div>
         </div>

         {/* Grid sutil local ELIMINADO para usar el global del body */}
         
         {/* Blue ambient glow */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse-glow z-10"></div>
      </div>

      {alertMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismissAlert}
            aria-hidden="true"
          ></div>
          <div
            role="dialog"
            aria-modal="true"
            className={`relative w-full max-w-md rounded-2xl border px-6 py-5 shadow-[0_0_30px_rgba(0,0,0,0.6)] ${
              alertMessage.type === 'success'
                ? 'bg-black/90 border-white/15 text-white'
                : 'bg-black/90 border-red-500/30 text-red-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Aviso</p>
                <p className="text-base font-medium tracking-wide">{alertMessage.text}</p>
              </div>
              <button
                type="button"
                onClick={dismissAlert}
                className="w-9 h-9 rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center"
                aria-label="Cerrar alerta"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-24">
          
          {/* ================= LEFT: FORMULARIO ================= */}
          <Reveal direction="right" width="100%" className="lg:col-span-7 relative">
            
            <div className="mb-8 md:mb-12">
               <div className="flex items-center gap-3 mb-4">
                  <div className="h-[2px] w-8 bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                  <span className="text-blue-400 font-sans font-bold text-xs tracking-[0.2em] uppercase">Inicia tu solución</span>
               </div>
               <h2 className="font-serif text-3xl md:text-5xl text-white mb-6 leading-tight">
                 Consulta <span className="text-gray-400 italic">Estratégica</span>
               </h2>
               <p className="text-gray-400 font-light text-sm md:text-base leading-relaxed max-w-xl">
                 Cada minuto cuenta en la estrategia legal. Envíanos los detalles de tu caso y nuestro equipo analizará la viabilidad jurídica de inmediato.
               </p>
            </div>

            <form className="space-y-8 md:space-y-10" onSubmit={handleSubmit}>
                
                {/* ROW 1: Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="group relative">
                        <input 
                            type="text" 
                            name="nombre"
                            className="peer w-full bg-transparent border-b border-gray-800 py-3 text-white focus:outline-none focus:border-blue-500 transition-all duration-500 font-sans text-base md:text-lg placeholder-transparent focus:shadow-[0_15px_20px_-10px_rgba(59,130,246,0.3)]"
                            placeholder="Nombre"
                            id="nombre"
                        />
                        <label htmlFor="nombre" className="absolute left-0 -top-4 text-gray-500 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-blue-400 peer-focus:text-xs uppercase tracking-wide font-medium">
                            Nombre Completo
                        </label>
                        {/* Glow indicator line */}
                        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-blue-400 shadow-[0_0_10px_#3b82f6] transition-all duration-500 peer-focus:w-full"></div>
                    </div>

                    <div className="group relative">
                        <input 
                            type="tel" 
                            name="telefono"
                            className="peer w-full bg-transparent border-b border-gray-800 py-3 text-white focus:outline-none focus:border-blue-500 transition-all duration-500 font-sans text-base md:text-lg placeholder-transparent focus:shadow-[0_15px_20px_-10px_rgba(59,130,246,0.3)]"
                            placeholder="Telefono"
                            id="telefono"
                        />
                        <label htmlFor="telefono" className="absolute left-0 -top-4 text-gray-500 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-blue-400 peer-focus:text-xs uppercase tracking-wide font-medium">
                            Teléfono / WhatsApp
                        </label>
                        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-blue-400 shadow-[0_0_10px_#3b82f6] transition-all duration-500 peer-focus:w-full"></div>
                    </div>
                </div>

                {/* ROW 2: Email & Subject (CUSTOM DROPDOWN) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="group relative">
                        <input 
                            type="email" 
                            name="email"
                            className="peer w-full bg-transparent border-b border-gray-800 py-3 text-white focus:outline-none focus:border-blue-500 transition-all duration-500 font-sans text-base md:text-lg placeholder-transparent focus:shadow-[0_15px_20px_-10px_rgba(59,130,246,0.3)]"
                            placeholder="Email"
                            id="email"
                        />
                        <label htmlFor="email" className="absolute left-0 -top-4 text-gray-500 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-blue-400 peer-focus:text-xs uppercase tracking-wide font-medium">
                            Correo Electrónico
                        </label>
                        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-blue-400 shadow-[0_0_10px_#3b82f6] transition-all duration-500 peer-focus:w-full"></div>
                    </div>

                    {/* CUSTOM CYBER DROPDOWN */}
                    <div className="relative">
                        {/* Invisible Backdrop to close on click outside */}
                        {isDropdownOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                        )}

                        <div 
                            className={`peer w-full bg-transparent border-b py-3 text-base md:text-lg cursor-pointer flex justify-between items-center transition-all duration-500 ${isDropdownOpen ? 'border-blue-500 shadow-[0_15px_20px_-10px_rgba(59,130,246,0.3)]' : 'border-gray-800'}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                             <span className={`${selectedInterest ? 'text-white' : 'text-gray-500'} truncate`}>
                                 {selectedInterest || "Seleccionar opción..."}
                             </span>
                             <svg 
                                className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                             >
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                             </svg>
                        </div>
                        
                        <label className={`absolute left-0 -top-4 text-xs uppercase tracking-wide transition-colors ${isDropdownOpen || selectedInterest ? 'text-blue-400' : 'text-gray-400'}`}>
                            Área de Interés
                        </label>
                        
                        {/* The Glowing Line */}
                        <div className={`absolute bottom-0 left-0 h-[1px] bg-blue-400 shadow-[0_0_10px_#3b82f6] transition-all duration-500 ${isDropdownOpen ? 'w-full' : 'w-0'}`}></div>

                        {/* Dropdown Menu */}
                        <div className={`absolute top-full left-0 w-full mt-2 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden transition-all duration-300 origin-top ${isDropdownOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}>
                            
                            {/* Decorative Top Line */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                            <ul className="max-h-64 overflow-y-auto py-2 scrollbar-hide">
                                {serviceOptions.map((option, index) => (
                                    <li 
                                        key={index}
                                        onClick={() => handleSelect(option)}
                                        className="relative group/option px-6 py-3 cursor-pointer transition-all hover:bg-white/5"
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <span className={`text-sm font-light transition-colors ${selectedInterest === option ? 'text-blue-400 font-medium' : 'text-gray-300 group-hover/option:text-white'}`}>
                                                {option}
                                            </span>
                                            {selectedInterest === option && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                                            )}
                                        </div>
                                        
                                        {/* Hover Left Bar */}
                                        <div className="absolute left-0 top-0 h-full w-[2px] bg-blue-500 scale-y-0 group-hover/option:scale-y-100 transition-transform duration-300 origin-center"></div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ROW 3: Message */}
                <div className="group relative">
                    <textarea 
                        rows={3} 
                        name="mensaje"
                        className="peer w-full bg-transparent border-b border-gray-800 py-3 text-white focus:outline-none focus:border-blue-500 transition-all duration-500 font-sans text-base md:text-lg placeholder-transparent resize-none focus:shadow-[0_15px_20px_-10px_rgba(59,130,246,0.3)]"
                        placeholder="Mensaje"
                        id="mensaje"
                    ></textarea>
                    <label htmlFor="mensaje" className="absolute left-0 -top-4 text-gray-500 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-blue-400 peer-focus:text-xs uppercase tracking-wide font-medium">
                        Detalles del Caso (Confidencial)
                    </label>
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-blue-400 shadow-[0_0_10px_#3b82f6] transition-all duration-500 peer-focus:w-full"></div>
                </div>

                {/* Submit Action */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-xs text-gray-500 font-medium">Respuesta estimada: Menos de 24h</span>
                    </div>

                    {/* BUTTON STYLE UPDATED TO MATCH HERO (Rounded, Sheen, Neutral) */}
                    <button 
                        type="submit" 
                        className="group relative px-12 py-4 w-full md:w-fit overflow-hidden rounded-full bg-neutral-900 border border-neutral-800 transition-all hover:border-gray-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] flex items-center justify-center"
                    >
                         {/* Sheen Effect */}
                         <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[sheen-slide_0.6s_ease-in-out_forwards] z-0 pointer-events-none"></div>
                         
                         <div className="relative z-10 flex items-center gap-4">
                            <span className="text-base font-medium tracking-wide text-gray-300 group-hover:text-white transition-colors uppercase">
                                Enviar Solicitud
                            </span>
                            
                            {/* Icon Animation */}
                            <div className="relative w-4 h-4 overflow-hidden">
                               <svg className="absolute inset-0 w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-500 ease-out transform group-hover:translate-x-[150%] group-hover:-translate-y-[150%]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                               </svg>
                               
                               <svg className="absolute inset-0 w-4 h-4 text-white transition-all duration-500 ease-out transform -translate-x-[150%] translate-y-[150%] group-hover:translate-x-0 group-hover:translate-y-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                               </svg>
                            </div>
                         </div>
                    </button>
                </div>
            </form>
          </Reveal>

          {/* ================= RIGHT: INFO EMPRESARIAL (NEON BOX) ================= */}
          <Reveal
            direction="left"
            delay={0.12}
            width="100%"
            className="lg:col-span-5 flex flex-col justify-center h-full pt-8 lg:pt-0"
          >
            
            <div className="relative group p-5 md:p-10 border border-white/10 bg-black/40 backdrop-blur-md rounded-xl transition-all duration-500 hover:border-white/30 hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden">
                
                {/* Neon Background Glow on Hover (Changed Pink to Amber) */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-amber-900/10 group-hover:via-emerald-900/10 group-hover:to-cyan-900/10 transition-all duration-700"></div>
                
                {/* Tech Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

                <div className="relative z-10">
                    <h3 className="font-sans font-bold text-xs text-white uppercase tracking-[0.2em] mb-8 md:mb-10 border-b border-white/10 pb-4 group-hover:border-white/30 transition-colors">
                        Información de Contacto
                    </h3>

                    <div className="space-y-8 md:space-y-12">
                        {/* Item 1: Dirección (CAMBIADO A AMARILLO/GOLD) */}
                        <div className="flex gap-4 md:gap-6 group/item">
                            <div className="w-14 h-14 flex items-center justify-center text-gray-500 group-hover/item:text-yellow-400 transition-all duration-300 group-hover/item:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] shrink-0">
                                <img 
                                    src={IMAGENES.icons.contact.location} 
                                    alt="Ubicación" 
                                    className="w-7 h-7 object-contain filter brightness-0 invert opacity-80 group-hover/item:opacity-100 transition-all duration-300" 
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold group-hover/item:text-yellow-300 transition-colors">Oficina Corporativa</p>
                                <p className="text-white font-sans text-sm md:text-base leading-relaxed text-gray-300 group-hover/item:text-white transition-colors">
                                    {IMAGENES.contacto.direccion.linea1},<br />{IMAGENES.contacto.direccion.linea2}
                                </p>
                            </div>
                        </div>

                        {/* Item 2: Teléfono (VERDE EMERALD) */}
                        <div className="flex gap-4 md:gap-6 group/item">
                            <div className="w-14 h-14 flex items-center justify-center text-gray-500 group-hover/item:text-emerald-400 transition-all duration-300 group-hover/item:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0">
                                <img 
                                    src={IMAGENES.icons.contact.phone} 
                                    alt="Teléfono" 
                                    className="w-7 h-7 object-contain filter brightness-0 invert opacity-80 group-hover/item:opacity-100 transition-all duration-300" 
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold group-hover/item:text-emerald-300 transition-colors">Línea Directa</p>
                                <p className="text-white font-sans text-lg md:text-xl font-medium tracking-tight group-hover/item:text-white transition-colors">{IMAGENES.contacto.telefono_visible}</p>
                            </div>
                        </div>

                        {/* Item 3: Email (CIAN/CELESTE) */}
                        <div className="flex gap-4 md:gap-6 group/item">
                            <div className="w-14 h-14 flex items-center justify-center text-gray-500 group-hover/item:text-cyan-400 transition-all duration-300 group-hover/item:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] shrink-0">
                                <img 
                                    src={IMAGENES.icons.contact.email} 
                                    alt="Email" 
                                    className="w-7 h-7 object-contain filter brightness-0 invert opacity-80 group-hover/item:opacity-100 transition-all duration-300" 
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold group-hover/item:text-cyan-300 transition-colors">Correo Electrónico</p>
                                <p className="text-white font-sans text-sm md:text-base text-gray-300 group-hover/item:text-white transition-colors break-all">{IMAGENES.contacto.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer clean box info */}
                    <div className="mt-12 pt-6 border-t border-white/5 flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-sans">
                            Lunes a Viernes: 9:00 AM - 7:00 PM
                        </p>
                    </div>
                </div>
            </div>

          </Reveal>
          
        </div>

      </div>
    </section>
  );
};

export default Contact;
