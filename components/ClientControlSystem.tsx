import React from 'react';
import SectionFigure from './SectionFigure';
import { DOSSIER_PORTAL_URL } from '../config';
import Reveal from './Reveal';

const BRAND_WORDMARK = '/components/media/images/HA ABOGADOS BLANCO Y NEGRO.png';
const BRAND_MONOGRAM = '/components/media/images/HA-BWH.png';

const features = [
  {
    title: 'Seguimiento procesal',
    description: 'Movimientos, acuerdos y etapas en una sola linea de control.',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h4.5l2.25-6 3 12 2.25-6h4.5" />
      </svg>
    ),
  },
  {
    title: 'Expedientes claros',
    description: 'Consulta rapida de clientes, juzgado, documentos y avance actual.',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-8.25A2.25 2.25 0 0 0 17.25 3.75H6.75A2.25 2.25 0 0 0 4.5 6v12A2.25 2.25 0 0 0 6.75 20.25h10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 7.5h7.5M8.25 11.25h7.5M8.25 15h5.25" />
      </svg>
    ),
  },
  {
    title: 'Vista profesional',
    description: 'Acceso sobrio, ordenado y alineado con la identidad del despacho.',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
];

const ClientControlSystem: React.FC = () => {
  return (
    <section id="sistema-control-expedientes" className="relative overflow-hidden bg-black py-14 md:py-16">
      <div className="relative z-10 mx-auto w-[92%] max-w-[1600px] px-4 sm:px-6">
        <Reveal width="100%" className="mb-6 flex justify-center">
          <div className="rounded-[1.4rem] border border-white/10 bg-black px-3.5 py-2.5">
            <img
              src={BRAND_MONOGRAM}
              alt="Hermosillo y Asociados"
              className="h-9 w-auto object-contain md:h-11"
            />
          </div>
        </Reveal>

        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-black p-4 sm:p-6 md:p-8 lg:p-11 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <SectionFigure variant="archive" className="-right-12 -top-12 hidden h-[17rem] w-[17rem] opacity-40 lg:block" />
          <div className="relative z-10 grid items-center gap-9 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal width="100%" className="mx-auto flex w-full max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
              <span className="inline-flex items-center rounded-full border border-white/14 bg-[#050505] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                Plataforma legal
              </span>

              <h2 className="mt-5 max-w-[14ch] font-serif text-[1.6rem] font-bold leading-[1] text-white sm:text-[2rem] lg:max-w-none lg:text-[2.5rem]">
                SISTEMA DE CONTROL
                <br />
                DE EXPEDIENTES.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#d8dde2]">
                Portal para control de juicios y expedientes con una experiencia sobria, clara y lista para crecer con el despacho.
              </p>

              <div className="mt-5 w-full max-w-md space-y-2">
                {features.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-[#050505] px-3.5 py-2.5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black text-white shadow-[0_10px_24px_rgba(255,255,255,0.06)]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em]">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#9ca3af]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={DOSSIER_PORTAL_URL}
                className="group mt-5 inline-flex items-center gap-3 rounded-full border border-white/16 bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-500 hover:scale-[1.02] hover:border-white/28"
              >
                <span>Descubrelo</span>
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </Reveal>

            <Reveal direction="left" delay={0.1} width="100%">
              <div className="relative mx-auto flex max-w-[340px] items-center justify-center py-2">
                {/* Resplandor y sombra de apoyo */}
                <div className="pointer-events-none absolute -bottom-3 h-6 w-48 rounded-[50%] bg-white/10 blur-xl" aria-hidden="true" />

                <div className="relative w-[236px] sm:w-[250px]">
                  {/* Botones laterales */}
                  <span className="absolute -left-[3px] top-[84px] h-7 w-[3px] rounded-l bg-gradient-to-b from-[#8a8a92] to-[#3a3a40]" aria-hidden="true" />
                  <span className="absolute -left-[3px] top-[124px] h-11 w-[3px] rounded-l bg-gradient-to-b from-[#8a8a92] to-[#3a3a40]" aria-hidden="true" />
                  <span className="absolute -left-[3px] top-[176px] h-11 w-[3px] rounded-l bg-gradient-to-b from-[#8a8a92] to-[#3a3a40]" aria-hidden="true" />
                  <span className="absolute -right-[3px] top-[140px] h-16 w-[3px] rounded-r bg-gradient-to-b from-[#8a8a92] to-[#3a3a40]" aria-hidden="true" />

                  {/* Marco de titanio */}
                  <div
                    className="rounded-[2.5rem] p-[2.5px] shadow-[0_30px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)]"
                    style={{ background: 'linear-gradient(145deg,#d9d9de 0%,#6e6e76 20%,#2b2b30 45%,#9a9aa2 70%,#e6e6ea 100%)' }}
                  >
                    {/* Bisel negro */}
                    <div className="rounded-[2.35rem] bg-black p-[5px]">
                      {/* Pantalla */}
                      <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-[#f3f4f6]">
                        {/* Barra de estado */}
                        <div className="relative z-10 flex items-center justify-between px-5 pt-2.5 text-[9px] font-semibold text-black">
                          <span>9:41</span>
                          <span className="flex items-center gap-1" aria-hidden="true">
                            <svg className="h-2.5 w-3" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2" width="3" height="10" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
                            <svg className="h-2.5 w-4" viewBox="0 0 26 12" fill="none" stroke="currentColor"><rect x="0.5" y="0.5" width="21" height="11" rx="3" /><rect x="2" y="2" width="14" height="8" rx="1.5" fill="currentColor" stroke="none" /><rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor" stroke="none" /></svg>
                          </span>
                        </div>
                        {/* Isla dinámica */}
                        <div className="absolute left-1/2 top-2 z-20 h-[18px] w-[64px] -translate-x-1/2 rounded-full bg-black" aria-hidden="true">
                          <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#14141c] ring-1 ring-[#2a2a36]" />
                        </div>

                        {/* Aplicación */}
                        <div className="space-y-2.5 px-3.5 pb-8 pt-4">
                          <div className="flex items-center justify-between rounded-2xl bg-black px-3 py-2">
                            <img src={BRAND_WORDMARK} alt="Hermosillo y Asociados" className="h-8 w-auto object-contain" />
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white">JP</span>
                          </div>

                          <div className="rounded-2xl bg-[linear-gradient(135deg,#0b0b0d,#1a1a1e)] px-3.5 py-3 text-white shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-[7px] uppercase tracking-[0.22em] text-white/55">Expediente</p>
                                <p className="mt-0.5 text-[13px] font-semibold leading-none">EXP-2026-014</p>
                              </div>
                              <span className="whitespace-nowrap rounded-full border border-white/20 bg-white/8 px-2 py-0.5 text-[7px] uppercase tracking-[0.15em] text-white/90">En proceso</span>
                            </div>
                            <div className="mt-2.5 h-1 rounded-full bg-white/10">
                              <div className="h-1 w-[72%] rounded-full bg-white/85" />
                            </div>
                            <p className="mt-2 text-[9px] leading-snug text-white/75">Seguimiento puntual del juicio y movimiento reciente del expediente.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-white px-2.5 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                              <p className="text-[7px] uppercase tracking-[0.2em] text-black/40">Cliente</p>
                              <p className="mt-0.5 text-[10px] font-semibold text-black">Juan Perez</p>
                            </div>
                            <div className="rounded-xl bg-white px-2.5 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                              <p className="text-[7px] uppercase tracking-[0.2em] text-black/40">Juzgado</p>
                              <p className="mt-0.5 text-[10px] font-semibold text-black">Civil Primero</p>
                            </div>
                          </div>

                          <div className="rounded-xl bg-white px-2.5 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center justify-between">
                              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-black">Accion inmediata</p>
                              <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                            </div>
                            <p className="mt-1 text-[9px] leading-snug text-black/55">
                              Revisar acuerdo publicado y confirmar documento adjunto desde el panel.
                            </p>
                          </div>
                        </div>

                        {/* Indicador de inicio */}
                        <div className="absolute bottom-1.5 left-1/2 h-[3px] w-20 -translate-x-1/2 rounded-full bg-black/80" aria-hidden="true" />
                        {/* Reflejo de cristal */}
                        <div
                          className="pointer-events-none absolute inset-0 z-30"
                          style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 28%, transparent 42%)' }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientControlSystem;
