import React, { useEffect, useRef, useState } from 'react';
import Reveal from '@/components/Reveal';
import SplitText from './SplitText';
import { IMAGENES } from '../imagenes_url';
import { WHATSAPP_URLS } from '../whatsapp_urls';
import { Column, Ornament } from './Greek';

interface TeamMember {
  name: string;
  role: string;
  tagline: string;
  description: string;
  phone: string;
  showWhatsapp?: boolean;
  imageFront: string;
}

// El orden de este arreglo es el orden en que aparecen al hacer scroll.
const teamMembers: TeamMember[] = [
  {
    name: 'Lic. Senen Hermosillo',
    role: 'Socio Director',
    tagline: 'Abogado de profesion y conviccion.',
    description:
      'Mi trayectoria se ha forjado a traves de anos de experiencia en distintas ramas del derecho, con un enfoque en brindar soluciones practicas, innovadoras y de alto impacto. La base de mi ejercicio profesional es la confianza y la transparencia.',
    phone: WHATSAPP_URLS.socios.senen,
    imageFront: IMAGENES.assets.team.senen_frente,
  },
  {
    name: 'Lic. Jose Luis Gutierrez',
    role: 'Lic. en Derecho',
    tagline: 'Defensa estrategica y prevencion de conflictos laborales.',
    description:
      'Experto en la gestion de relaciones obrero-patronales y litigio laboral. Mi enfoque se centra en el blindaje preventivo de las empresas y en la resolucion eficiente de controversias, garantizando seguridad juridica y estabilidad operativa.',
    phone: WHATSAPP_URLS.socios.jose_luis,
    imageFront: IMAGENES.assets.team.jose_luis_frente,
  },
  {
    name: 'Lic. Ximena Lopez Vazquez',
    role: 'Lic. en Derecho',
    tagline: 'Estrategia procesal y seguimiento puntual en derecho civil.',
    description:
      'Brinda acompanamiento juridico en asuntos de derecho civil con enfoque analitico, claridad procesal y atencion cercana. Su practica se orienta a construir estrategias solidas para proteger los intereses patrimoniales y personales.',
    phone: WHATSAPP_URLS.socios.ximena,
    imageFront: IMAGENES.assets.team.ximena_frente,
  },
  {
    name: 'Lic. Yanci Contreras Garcia',
    role: 'Lic. en Derecho',
    tagline: 'Atencion humana y defensa firme en derecho familiar.',
    description:
      'Acompana procesos de derecho familiar con sensibilidad, orden y firmeza juridica. Su trabajo se centra en ofrecer atencion personalizada y estrategias claras para resolver conflictos familiares con el mayor cuidado posible.',
    phone: WHATSAPP_URLS.socios.yanci,
    imageFront: IMAGENES.assets.team.yanci_frente,
  },
  {
    name: 'Lic. Sabrina Trujillo',
    role: 'Lic. en Derecho',
    tagline: 'Atencion humana y defensa firme en derecho familiar.',
    description:
      'Acompana procesos de derecho familiar con sensibilidad, orden y firmeza juridica. Su trabajo se centra en ofrecer atencion personalizada y estrategias claras para resolver conflictos familiares con el mayor cuidado posible.',
    phone: WHATSAPP_URLS.socios.sabrina,
    imageFront: IMAGENES.assets.team.sabrina_frente,
  },
  {
    name: 'Fabrizio Ibarra',
    role: 'Lic. en Derecho',
    tagline: 'Analisis legal puntual para operaciones y gestion inmobiliaria.',
    description:
      'Participa en el acompanamiento juridico de operaciones inmobiliarias con enfoque practico, orden documental y seguimiento cercano. Su trabajo se orienta a fortalecer la certeza legal en compraventas, arrendamientos y procesos de regularizacion.',
    phone: WHATSAPP_URLS.socios.fabrizio,
    imageFront: IMAGENES.assets.team.fabricio_frente,
  },
  {
    name: 'Lic. Alfonso Gonzalez',
    role: 'Lic. en Derecho',
    tagline: 'Estrategia corporativa y vision de negocios.',
    description:
      'Con una solida formacion en derecho corporativo y notarial, me especializo en brindar certeza juridica a las operaciones comerciales de nuestros clientes, con enfoque en prevencion de conflictos y estructuracion patrimonial.',
    phone: WHATSAPP_URLS.socios.alfonso,
    imageFront: IMAGENES.assets.team.alfonso_frente,
  },
  {
    name: 'Lic. Antonio Guzman',
    role: 'Lic. en Derecho',
    tagline: 'Especialista y apasionado en materia aduanal.',
    description:
      'Experto en litigio civil y mercantil, mi practica se distingue por el analisis minucioso y la argumentacion solida. Cada controversia requiere una estrategia unica para proteger los intereses de nuestros representados con firmeza y etica.',
    phone: WHATSAPP_URLS.socios.antonio,
    imageFront: IMAGENES.assets.team.alejandro_frente,
  },
];

const MEMBER_COUNT = teamMembers.length;
// Cuanto hay que bajar (en alto de pantalla) para pasar al siguiente miembro.
const STEP_SVH = 40;

const getInitials = (name: string) =>
  name
    .replace(/^(Lic\.|Lic)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

// Si la foto no existe todavia se muestra un monograma, no la foto de otra persona.
const MemberPhoto: React.FC<{ member: TeamMember }> = ({ member }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-950">
        <span className="font-serif text-7xl text-white/30 lg:text-8xl">{getInitials(member.name)}</span>
      </div>
    );
  }

  return (
    <img
      src={member.imageFront}
      alt={member.name}
      width={900}
      height={1200}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover object-[50%_15%] grayscale"
    />
  );
};

const WhatsappIcon: React.FC = () => (
  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Miembro activo segun el avance del scroll dentro de la pista. Solo escucha el scroll
// mientras la pista esta cerca de la pantalla y solo actualiza el estado cuando cambia el indice.
const useActiveMember = (
  trackRef: React.RefObject<HTMLDivElement>,
  stageRef: React.RefObject<HTMLDivElement>
) => {
  const [active, setActive] = useState(0);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === 'undefined') {
      setIsNear(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setIsNear(entry.isIntersecting), {
      rootMargin: '100% 0px',
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [trackRef]);

  useEffect(() => {
    if (!isNear) return;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = track.offsetHeight - stage.offsetHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(1, Math.max(0, -track.getBoundingClientRect().top / scrollable));
      const next = Math.min(MEMBER_COUNT - 1, Math.floor(progress * MEMBER_COUNT));
      setActive((current) => (current === next ? current : next));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [isNear, trackRef, stageRef]);

  return active;
};

const Team: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const active = useActiveMember(trackRef, stageRef);
  // Solo se monta la foto del miembro activo y sus vecinos; las demas se piden al acercarse.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1]));

  useEffect(() => {
    setMounted((prev) => {
      const next = new Set(prev);
      [active - 1, active, active + 1].forEach((index) => {
        if (index >= 0 && index < MEMBER_COUNT) next.add(index);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [active]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const scrollable = track.offsetHeight - stage.offsetHeight;
    const top = window.scrollY + track.getBoundingClientRect().top + ((index + 0.5) / MEMBER_COUNT) * scrollable;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section id="equipo" className="relative bg-transparent pt-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal variant="stagger" direction="up" duration={1.0} width="100%" className="mb-10 text-center">
          <SplitText as="h2" unit="chars" className="mb-4 font-serif text-4xl text-white md:text-5xl">Nuestro Equipo</SplitText>
          <Ornament className="mb-6" />
          <p className="mx-auto max-w-2xl text-sm font-light leading-relaxed text-gray-400 md:text-base">
            Profesionales comprometidos con la excelencia juridica y la etica profesional.
            Cada socio aporta una vision estrategica unica para blindar tus intereses.
          </p>
        </Reveal>
      </div>

      {/* Pista de scroll: mientras se recorre, el escenario se queda fijo y cambia de miembro. */}
      <div ref={trackRef} className="relative" style={{ height: `calc(100svh + ${MEMBER_COUNT * STEP_SVH}svh)` }}>
        <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden">
          {/* Columnas laterales del "templo" (solo pantallas amplias) */}
          <Column className="pointer-events-none absolute bottom-14 left-[2%] hidden h-[80%] w-auto text-platinum-500/25 xl:block" />
          <Column className="pointer-events-none absolute bottom-14 right-[2%] hidden h-[80%] w-auto text-platinum-500/25 xl:block" />
          <div className="relative mx-auto h-full max-w-6xl">
            {teamMembers.map((member, index) => {
              const isActive = index === active;

              return (
                <div
                  key={member.name}
                  className="team-panel px-4 pb-14 pt-[76px] md:px-6 md:pb-16 md:pt-24 lg:pb-24 lg:pt-28"
                  data-active={isActive ? '' : undefined}
                  aria-hidden={!isActive}
                >
                  <div className="mx-auto flex h-full max-w-5xl flex-col gap-3 md:gap-4 lg:grid lg:grid-cols-[minmax(0,400px)_1fr] lg:items-center lg:gap-16">
                    <div className="team-photo relative mx-auto min-h-[160px] w-full max-w-[460px] flex-1 overflow-hidden rounded-sm border border-white/10 bg-neutral-900 lg:h-full lg:max-h-[640px] lg:max-w-none lg:flex-none">
                      {mounted.has(index) ? (
                        <MemberPhoto member={member} />
                      ) : (
                        <div className="h-full w-full bg-neutral-900" />
                      )}
                      {/* Brillo plateado que cruza la foto (solo escritorio, ver index.css) */}
                      <div className="team-sheen" aria-hidden="true"></div>

                      {/* Celular y tablet: la foto es la protagonista y el nombre va encima */}
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-4 pt-16 text-center lg:hidden">
                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.3em] text-platinum-400">
                          {String(index + 1).padStart(2, '0')} / {String(MEMBER_COUNT).padStart(2, '0')}
                        </span>
                        <h3 className="font-serif text-2xl font-bold leading-tight text-white">{member.name}</h3>
                        <p className="mt-1 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">{member.role}</p>
                      </div>
                    </div>

                    <div className="team-copy flex shrink-0 flex-col text-center lg:text-left">
                      <span className="mb-3 hidden font-mono text-xs uppercase tracking-[0.3em] text-platinum-400 lg:block">
                        {String(index + 1).padStart(2, '0')} / {String(MEMBER_COUNT).padStart(2, '0')}
                      </span>
                      <h3 className="mb-2 hidden font-serif text-3xl font-bold leading-tight text-white lg:block lg:text-5xl">
                        {member.name}
                      </h3>
                      <p className="mb-4 hidden font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 lg:block lg:text-xs">
                        {member.role}
                      </p>
                      <p className="mb-3 text-sm font-light leading-relaxed text-gray-400 max-md:hidden lg:mb-4 lg:text-lg">
                        "{member.tagline}"
                      </p>
                      <p className="mb-5 line-clamp-6 text-sm font-light leading-relaxed text-gray-300 max-md:hidden lg:mb-6 lg:line-clamp-none lg:text-base">
                        {member.description}
                      </p>

                      {member.showWhatsapp !== false && (
                        <a
                          href={`https://wa.me/${member.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-3 self-center rounded-sm border border-[#25D366] bg-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-wide text-[#25D366] transition-colors duration-300 hover:bg-[#25D366] hover:text-black lg:w-auto lg:self-start"
                        >
                          <WhatsappIcon />
                          Contactar por WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 px-6" role="tablist" aria-label="Miembros del equipo">
            {teamMembers.map((member, index) => (
              <button
                key={member.name}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Ver a ${member.name}`}
                onClick={() => goTo(index)}
                className="group flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`block h-1.5 w-full rounded-full transition-colors duration-300 ${
                    index === active ? 'bg-white' : 'bg-white/25 group-hover:bg-white/50'
                  }`}
                ></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
