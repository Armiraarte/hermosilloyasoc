
import React, { useState, useEffect, useRef } from 'react';
import { IMAGENES } from '../imagenes_url';
import Reveal from './Reveal';
import SplitText from './SplitText';
import { Ornament } from './Greek';

// Utilizamos los datos del archivo de configuración
const facilitiesData = IMAGENES.assets.facilities;

const Facilities: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    // Solo se rota mientras la seccion esta cerca de la pantalla (antes cambiaba fotos de varios MB desde el inicio).
    useEffect(() => {
        const node = sectionRef.current;
        if (!node || typeof IntersectionObserver === 'undefined') {
            setIsInView(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
            rootMargin: '100px 0px',
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    // Auto-rotation
    useEffect(() => {
        if (!isInView) return;
        const timer = setInterval(() => {
            if (!document.hidden) handleNext();
        }, 6000); // Un poco más lento para apreciar las fotos
        return () => clearInterval(timer);
    }, [currentIndex, isInView]);

    const handleNext = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % facilitiesData.length);
            setIsAnimating(false);
        }, 500);
    };

    const handleSelect = (index: number) => {
        if (index === currentIndex) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsAnimating(false);
        }, 500);
    };

    const currentFacility = facilitiesData[currentIndex];

    return (
        <section ref={sectionRef} id="instalaciones" className="relative w-full py-20 min-h-screen bg-black overflow-hidden flex items-center">

            {/* ================= 1. FONDO ATMOSFÉRICO (Blur Extremo) ================= */}
            {/* Este fondo asegura que no haya espacios negros vacíos, tomando el color de la foto actual */}
            <div className="absolute inset-0 z-0 hidden lg:block">
                <div className="absolute inset-0 bg-black/60 z-10"></div> {/* Oscurecedor */}
                <img
                    key={`bg-${currentIndex}`} // Key fuerza re-render suave
                    src={currentFacility.image}
                    alt="Atmosphere"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover blur-[50px] opacity-40 scale-110 transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 z-20"></div>
            </div>

            {/* ================= 2. CONTENIDO PRINCIPAL ================= */}
            {/* CHANGE: Increased max-width to 95% and added a larger breakpoint for ultra-wide screens */}
            <div className="relative z-30 w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center h-full">

                {/* --- COLUMNA IZQUIERDA: LA FOTO (Marco Flotante) --- */}
                {/* Aquí está el truco: h-[75vh] define la altura máxima para que la foto vertical sea grande */}
                <Reveal
                    direction="right"
                    width="100%"
                    className="lg:col-span-9 flex justify-center lg:justify-center relative group w-full h-full items-center"
                >

                    {/* Marco Decorativo */}
                    <div className={`relative w-full h-[55vh] md:h-[85vh] flex items-center justify-center transition-[opacity,transform] duration-500 ease-out ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

                        {/* Sombra de la foto */}
                        <div className="absolute inset-0 bg-black/50 blur-3xl -z-10 rounded-sm transform translate-y-12 scale-90 opacity-60 hidden lg:block"></div>

                        <img
                            src={currentFacility.image}
                            alt={currentFacility.title}
                            // RETORNO A OBJECT-CONTAIN:
                            // Esto asegura que NO se haga zoom (no se recorte nada).
                            // Se verá la imagen completa. Si es vertical, tendrá espacio a los lados.
                            className="w-full h-full object-cover object-center rounded-sm shadow-2xl border border-white/5"
                            loading="lazy"
                            decoding="async"
                        />

                        {/* Etiqueta flotante sobre la foto - Ajustada al centro/bottom para que no tape si la foto es angosta */}
                        <div className="absolute bottom-8 left-8 md:left-12 bg-black/80 px-8 py-4 border-l-4 border-platinum-500 rounded-r-md shadow-2xl z-20 whitespace-nowrap">
                            <span className="text-platinum-400 font-mono text-xs uppercase tracking-widest block mb-2">
                                Espacio 0{currentFacility.id}
                            </span>
                            <h3 className="text-white font-serif text-2xl md:text-3xl leading-none">
                                {currentFacility.title}
                            </h3>
                        </div>
                    </div>

                </Reveal>

                {/* --- COLUMNA DERECHA: NAVEGACIÓN Y DETALLES --- */}
                <Reveal
                    variant="stagger"
                    direction="left"
                    delay={0.1}
                    width="100%"
                    className="lg:col-span-3 flex flex-col justify-center h-full lg:pl-8"
                >

                    <div className="mb-12">
                        <SplitText as="h2" unit="chars" className="font-serif text-4xl md:text-5xl text-white mb-6">Nuestras Instalaciones</SplitText>
                        <Ornament align="left" className="mb-8" />
                        <p className={`text-gray-300 font-light text-lg leading-relaxed transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                            {currentFacility.phrase}
                        </p>
                    </div>

                    {/* Lista de Navegación Vertical */}
                    <div className="space-y-4">
                        {facilitiesData.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(index)}
                                className={`group w-full text-left py-5 px-8 rounded-sm transition-all duration-300 border border-transparent flex items-center justify-between ${index === currentIndex
                                    ? 'bg-white/10 border-white/10 shadow-lg translate-x-2'
                                    : 'hover:bg-white/5 hover:border-white/5 hover:translate-x-1'
                                    }`}
                            >
                                <span className={`font-serif text-lg transition-colors ${index === currentIndex ? 'text-white font-medium' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                    {item.title}
                                </span>

                                {index === currentIndex ? (
                                    <div className="w-2.5 h-2.5 bg-platinum-500 rounded-full shadow-[0_0_15px_#C5C8CE] animate-pulse"></div>
                                ) : (
                                    <span className="text-xs text-gray-700 font-mono group-hover:text-gray-500">0{index + 1}</span>
                                )}
                            </button>
                        ))}
                    </div>

                </Reveal>

            </div>

        </section>
    );
};

export default Facilities;
