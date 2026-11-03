
import React, { lazy } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import ClientControlSystem from './ClientControlSystem';
import Services from './Services';
import Team from './Team';
import Contact from './Contact';
import Facilities from './Facilities';
import Reveal from './Reveal';
import SplitText from './SplitText';
import { IMAGENES } from '../imagenes_url';
import DeferredSection from './DeferredSection';
import { Frieze } from './Greek';

const SeoContent = lazy(() => import('./SeoContent'));
const LocationMap = lazy(() => import('./LocationMap'));
const Footer = lazy(() => import('./Footer'));

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white font-sans selection:bg-gray-700 selection:text-white">
      <div className="scroll-progress" aria-hidden="true"></div>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ClientControlSystem />
        
        {/* About Section - "¿Quiénes somos?" - CLEAN BLACK BACKGROUND */}
        <section id="nosotros" className="py-20 bg-transparent relative">
           <div className="w-[90%] max-w-[1600px] mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
              
              {/* Left Content */}
              <Reveal
                variant="stagger"
                direction="right"
                width="100%"
                className="flex flex-col justify-center relative z-10 max-w-xl text-center lg:text-center mx-auto lg:mx-0 w-full items-center lg:items-center"
              >
                <SplitText as="h2" unit="chars" className="font-serif text-4xl mb-4 text-white font-bold tracking-tight text-center">
                  ¿Quiénes somos?
                </SplitText>
                <SplitText as="p" unit="words" delay={0.2} className="text-gray-400 text-base leading-relaxed mb-6 font-light text-center">
                  Somos un despacho con vocación estratégica y humana. 
                  Acompañamos a empresas y personas en decisiones clave, 
                  combinando experiencia en litigio y consultoría con un enfoque 
                  claro: proteger tus intereses.
                </SplitText>

                <div className="space-y-3 mb-8 w-full max-w-md mx-auto text-left">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-sm shrink-0 platinum-shine transition-transform group-hover:scale-105">
                      <svg className="w-4 h-4 text-gray-200 relative z-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                      </svg>
                    </div>
                    <div>
                        <p className="text-white text-sm font-medium group-hover:text-gray-200 transition-colors">Ética y confidencialidad en cada asunto.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-sm shrink-0 platinum-shine transition-transform group-hover:scale-105">
                       <svg className="w-4 h-4 text-gray-200 relative z-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.48 0-2.194-2.03-2.803-5.566-.196-1.136-.363-2.256-.525-3.328m3.328 8.894c1.48 0 2.194-2.03 2.803-5.566.196-1.136.363-2.256.525-3.328m-9.728 0h19.456M3.75 6.75h16.5M3.75 6.75A2.25 2.25 0 0 1 6 4.5m-2.25 2.25c0 1.933 1.258 3.585 3 4.195m13.5-4.195A2.25 2.25 0 0 0 18 4.5m2.25 2.25c0 1.933-1.258 3.585-3 4.195" />
                       </svg>
                    </div>
                    <div>
                        <p className="text-white text-sm font-medium group-hover:text-gray-200 transition-colors">Soluciones precisas en las principales ramas del Derecho.</p>
                    </div>
                  </div>

                   <div className="flex items-center gap-4 group">
                     <div className="w-10 h-10 flex items-center justify-center rounded-sm shrink-0 platinum-shine transition-transform group-hover:scale-105">
                        <svg className="w-4 h-4 text-gray-200 relative z-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                    </div>
                    <div>
                         <p className="text-white text-sm font-medium group-hover:text-gray-200 transition-colors">Acompañamiento cercano, claro y orientado a resultados.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <a href="#contacto" className="relative group px-8 py-3 w-fit overflow-hidden rounded bg-neutral-900 border border-neutral-800 transition-all hover:border-gray-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[sheen-slide_0.6s_ease-in-out_forwards] z-0 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center gap-4">
                      <span className="text-sm font-medium tracking-wide text-gray-300 group-hover:text-white transition-colors uppercase">Contacto</span>
                      
                      <div className="relative w-4 h-4 overflow-hidden">
                        <svg className="absolute inset-0 w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-500 ease-out transform group-hover:translate-x-[150%] group-hover:-translate-y-[150%]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                        
                        <svg className="absolute inset-0 w-4 h-4 text-white transition-all duration-500 ease-out transform -translate-x-[150%] translate-y-[150%] group-hover:translate-x-0 group-hover:translate-y-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                      </div>
                    </div>
                  </a>
                </div>

              </Reveal>

              {/* Right Image */}
              <Reveal
                variant="curtain"
                direction="left"
                delay={0.1}
                width="100%"
                className="relative h-full min-h-[600px] flex items-center justify-end"
              >
                 
                 <div className="relative w-full lg:w-[85%] h-full">
                   <img 
                      src={IMAGENES.assets.about.mainImage}
                      alt="Nosotros - Grupo Hermosillo" 
                      width={1200}
                      height={1600}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover rounded-sm shadow-2xl relative z-10 grayscale brightness-75 contrast-125" 
                   />
                   
                   {/* Top Right - Glassmorphism Card */}
                   <div className="absolute -top-8 -right-8 z-20 animate-float-slow hidden md:block">
                      <div className="bg-white/75 border border-white/40 p-4 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center gap-1 min-w-[150px] text-center">
                         <h3 className="font-serif text-xl text-black font-bold leading-none drop-shadow-sm">
                            Buffete de<br/>Abogados
                         </h3>
                         <span className="text-[0.55rem] uppercase tracking-widest text-white font-extrabold bg-black px-2 py-0.5 rounded-sm mt-1 shadow-sm">
                            Guadalajara
                         </span>
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-sm pointer-events-none"></div>
                      </div>
                   </div>

                   {/* Bottom Left - Glassmorphism Card */}
                   <div className="absolute bottom-8 -left-12 z-20 animate-float hidden md:block">
                      <div className="bg-white/75 border border-white/40 p-4 pr-8 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                            </svg>
                         </div>
                         <div>
                            <p className="font-serif font-bold text-black text-sm drop-shadow-sm">Excelencia Legal</p>
                            <p className="text-gray-800 text-xs font-medium drop-shadow-sm">Resultados comprobados</p>
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-sm pointer-events-none"></div>
                      </div>
                   </div>

                 </div>
                 
              </Reveal>
           </div>
        </section>

        <Frieze className="text-platinum-500/45" />
        <Services />
        <Team />
        <DeferredSection minHeightClassName="min-h-[1455px] md:min-h-[1031px] lg:min-h-[959px]">
          <SeoContent />
        </DeferredSection>
        {/* En la página principal mantenemos el Contacto integrado, pero también tendremos la página individual */}
        <Frieze className="text-platinum-500/45" />
        <Contact />
        <DeferredSection minHeightClassName="min-h-[500px]">
          <LocationMap />
        </DeferredSection>
        <Facilities />
      </main>
      <DeferredSection minHeightClassName="min-h-[1474px] md:min-h-[1416px] lg:min-h-[620px]">
        <Footer />
      </DeferredSection>
    </div>
  );
};

export default Home;
