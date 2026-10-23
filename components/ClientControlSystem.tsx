import React from 'react';
import { DOSSIER_PORTAL_URL } from '../config';
import Reveal from './Reveal';

const BRAND_WORDMARK = '/components/media/images/HA ABOGADOS BLANCO Y NEGRO.png';
const BRAND_MONOGRAM = '/components/media/images/HA-BWH.png';

const features = [
  {
    title: 'Seguimiento procesal',
    description: 'Movimientos, acuerdos y etapas en una sola linea de control.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h4.5l2.25-6 3 12 2.25-6h4.5" />
      </svg>
    ),
  },
  {
    title: 'Expedientes claros',
    description: 'Consulta rapida de clientes, juzgado, documentos y avance actual.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-8.25A2.25 2.25 0 0 0 17.25 3.75H6.75A2.25 2.25 0 0 0 4.5 6v12A2.25 2.25 0 0 0 6.75 20.25h10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 7.5h7.5M8.25 11.25h7.5M8.25 15h5.25" />
      </svg>
    ),
  },
  {
    title: 'Vista profesional',
    description: 'Acceso sobrio, ordenado y alineado con la identidad del despacho.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
];

const ClientControlSystem: React.FC = () => {
  return (
    <section id="sistema-control-expedientes" className="relative overflow-hidden bg-black py-20 md:py-24">
      <div className="relative z-10 mx-auto w-[92%] max-w-[1600px] px-4 sm:px-6">
        <Reveal width="100%" className="mb-10 flex justify-center">
          <div className="rounded-sm border border-white/10 bg-black px-5 py-4">
            <img
              src={BRAND_MONOGRAM}
              alt="Hermosillo y Asociados"
              className="h-14 w-auto object-contain md:h-16"
            />
          </div>
        </Reveal>

        <div className="relative overflow-hidden rounded-sm border border-white/10 bg-black p-5 sm:p-8 md:p-12 lg:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal variant="stagger" width="100%" className="mx-auto flex w-full max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
              <span className="inline-flex items-center rounded-sm border border-white/14 bg-[#050505] px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white">
                Plataforma legal
              </span>

              <h2 className="mt-7 max-w-[12ch] font-serif text-[2.35rem] font-bold leading-[0.95] text-white sm:text-5xl lg:max-w-none lg:text-6xl">
                SISTEMA DE CONTROL
                <br />
                DE EXPEDIENTES.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#d8dde2] md:text-lg">
                Portal para control de juicios y expedientes con una experiencia sobria, clara y lista para crecer con el despacho.
              </p>

              <div className="mt-8 w-full max-w-xl space-y-3">
                {features.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-sm border border-white/10 bg-[#050505] px-5 py-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-black text-white shadow-[0_10px_24px_rgba(255,255,255,0.06)]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.2em]">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#9ca3af]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={DOSSIER_PORTAL_URL}
                className="group mt-8 inline-flex items-center gap-4 rounded-sm border border-white/16 bg-black px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all duration-500 hover:scale-[1.02] hover:border-white/28"
              >
                <span>Descubrelo</span>
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </Reveal>

            <Reveal variant="curtain" direction="left" delay={0.1} width="100%">
              <div className="relative mx-auto flex max-w-[520px] items-center justify-center">
                <div className="relative w-[320px] rounded-[3.4rem] border border-white/18 bg-black p-3 shadow-[0_35px_120px_rgba(0,0,0,0.85)] sm:w-[360px]">
                  <div className="rounded-[3rem] border border-black/10 bg-white p-3">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="mx-auto mt-3 h-1.5 w-20 rounded-full bg-black/10" />

                      <div className="space-y-4 p-5">
                        <div className="rounded-[1.5rem] border border-white/8 bg-black px-4 py-4">
                          <img
                            src={BRAND_WORDMARK}
                            alt="Hermosillo y Asociados"
                            className="h-16 w-full object-contain"
                          />
                        </div>

                        <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(135deg,#090909,#171717)] px-5 py-5 text-white shadow-[0_14px_35px_rgba(0,0,0,0.5)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/60">Expediente</p>
                              <p className="mt-1 text-lg font-semibold">EXP-2026-014</p>
                            </div>
                            <span className="rounded-full border border-white/18 bg-white/6 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-white/85">
                              En proceso
                            </span>
                          </div>
                          <div className="mt-4 h-2 rounded-full bg-white/10">
                            <div className="h-2 w-[72%] rounded-full bg-white/85" />
                          </div>
                          <p className="mt-3 text-sm text-white/80">Seguimiento puntual del juicio y movimiento reciente del expediente.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-[1.3rem] border border-white/8 bg-[#080808] px-4 py-4">
                            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/45">Cliente</p>
                            <p className="mt-2 text-sm font-semibold text-white">Juan Perez</p>
                          </div>
                          <div className="rounded-[1.3rem] border border-white/8 bg-[#080808] px-4 py-4">
                            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/45">Juzgado</p>
                            <p className="mt-2 text-sm font-semibold text-white">Civil Primero</p>
                          </div>
                        </div>

                        <div className="rounded-[1.4rem] border border-white/8 bg-[#080808] px-4 py-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">Accion inmediata</p>
                            <span className="h-2.5 w-2.5 rounded-full bg-white/50" />
                          </div>
                          <p className="mt-2 text-sm text-[#9ca3af]">
                            Revisar acuerdo publicado y confirmar documento adjunto desde el panel.
                          </p>
                        </div>
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
