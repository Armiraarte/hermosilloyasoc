import React, { useState } from 'react';
import Reveal from '@/components/Reveal';
import { IMAGENES } from '../imagenes_url';
import { WHATSAPP_URLS } from '../whatsapp_urls';
import { useMediaQuery } from './useMediaQuery';

interface TeamMember {
  name: string;
  role: string;
  tagline: string;
  description: string;
  phone: string;
  showWhatsapp?: boolean;
  imageFront: string;
  imageBack: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Lic. Senen Hermosillo',
    role: 'Socio Director',
    tagline: 'Abogado de profesion y conviccion.',
    description:
      'Mi trayectoria se ha forjado a traves de anos de experiencia en distintas ramas del derecho, con un enfoque en brindar soluciones practicas, innovadoras y de alto impacto. La base de mi ejercicio profesional es la confianza y la transparencia.',
    phone: WHATSAPP_URLS.socios.senen,
    imageFront: IMAGENES.assets.team.senen_frente,
    imageBack: IMAGENES.assets.team.senen_atras,
  },
  {
    name: 'Lic. Alfonso Gonzalez',
    role: 'Lic. en Derecho',
    tagline: 'Estrategia corporativa y vision de negocios.',
    description:
      'Con una solida formacion en derecho corporativo y notarial, me especializo en brindar certeza juridica a las operaciones comerciales de nuestros clientes, con enfoque en prevencion de conflictos y estructuracion patrimonial.',
    phone: WHATSAPP_URLS.socios.alfonso,
    imageFront: IMAGENES.assets.team.carlos_frente,
    imageBack: IMAGENES.assets.team.carlos_atras,
  },
  {
    name: 'Lic. Antonio Guzman',
    role: 'Lic. en Derecho',
    tagline: 'Especialista y apasionado en materia aduanal.',
    description:
      'Experto en litigio civil y mercantil, mi practica se distingue por el analisis minucioso y la argumentacion solida. Cada controversia requiere una estrategia unica para proteger los intereses de nuestros representados con firmeza y etica.',
    phone: WHATSAPP_URLS.socios.antonio,
    imageFront: IMAGENES.assets.team.alejandro_frente,
    imageBack: IMAGENES.assets.team.alejandro_atras,
  },
  {
    name: 'Lic. Jose Luis Gutierrez',
    role: 'Lic. en Derecho',
    tagline: 'Defensa estrategica y prevencion de conflictos laborales.',
    description:
      'Experto en la gestion de relaciones obrero-patronales y litigio laboral. Mi enfoque se centra en el blindaje preventivo de las empresas y en la resolucion eficiente de controversias, garantizando seguridad juridica y estabilidad operativa.',
    phone: WHATSAPP_URLS.socios.jose_luis,
    imageFront: IMAGENES.assets.team.jose_luis_frente,
    imageBack: IMAGENES.assets.team.jose_luis_atras,
  },
  {
    name: 'Lic. Ximena Lopez Vazquez',
    role: 'Lic. en Derecho',
    tagline: 'Estrategia procesal y seguimiento puntual en derecho civil.',
    description:
      'Brinda acompanamiento juridico en asuntos de derecho civil con enfoque analitico, claridad procesal y atencion cercana. Su practica se orienta a construir estrategias solidas para proteger los intereses patrimoniales y personales.',
    phone: WHATSAPP_URLS.socios.ximena,
    imageFront: IMAGENES.assets.team.ximena_frente,
    imageBack: IMAGENES.assets.team.ximena_atras,
  },
  {
    name: 'Lic. Yanci Contreras Garcia',
    role: 'Lic. en Derecho',
    tagline: 'Atencion humana y defensa firme en derecho familiar.',
    description:
      'Acompana procesos de derecho familiar con sensibilidad, orden y firmeza juridica. Su trabajo se centra en ofrecer atencion personalizada y estrategias claras para resolver conflictos familiares con el mayor cuidado posible.',
    phone: WHATSAPP_URLS.socios.yanci,
    imageFront: IMAGENES.assets.team.yanci_frente,
    imageBack: IMAGENES.assets.team.yanci_atras,
  },
  {
    name: 'Fabrizio Ibarra',
    role: 'Lic. en Derecho',
    tagline: 'Analisis legal puntual para operaciones y gestion inmobiliaria.',
    description:
      'Participa en el acompanamiento juridico de operaciones inmobiliarias con enfoque practico, orden documental y seguimiento cercano. Su trabajo se orienta a fortalecer la certeza legal en compraventas, arrendamientos y procesos de regularizacion.',
    phone: WHATSAPP_URLS.socios.fabrizio,
    imageFront: IMAGENES.assets.team.fabricio_frente,
    imageBack: IMAGENES.assets.team.fabricio_atras,
  },
];

const displayOrder = [teamMembers[0], ...teamMembers.slice(3, 7), ...teamMembers.slice(1, 3)];

const TEAM_IMAGE_FALLBACK = IMAGENES.assets.team.carlos_frente;

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = TEAM_IMAGE_FALLBACK;
};

const WhatsappIcon: React.FC = () => (
  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Version ligera para celular/tablet: sin 3D, sin hover, sin animaciones y con render diferido fuera de pantalla.
const MemberCardLite: React.FC<{ member: TeamMember }> = ({ member }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-neutral-900 [content-visibility:auto] [contain-intrinsic-size:auto_620px]">
      <div className="relative aspect-[3/4] w-full bg-neutral-900">
        <img
          src={member.imageFront}
          alt={member.name}
          width={900}
          height={1200}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className="h-full w-full object-cover object-[50%_15%] grayscale"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-20">
          <h3 className="mb-1 font-serif text-2xl font-bold leading-tight text-white">{member.name}</h3>
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">{member.role}</p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-light italic leading-relaxed text-gray-400">"{member.tagline}"</p>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-4 text-xs font-bold uppercase tracking-widest text-gray-300"
        >
          {isOpen ? 'Ocultar perfil' : 'Ver perfil'}
          <span aria-hidden="true" className="text-base leading-none">{isOpen ? '−' : '+'}</span>
        </button>

        {isOpen && (
          <div className="mt-4">
            <p className="text-sm font-light leading-relaxed text-gray-300">{member.description}</p>
            {member.showWhatsapp !== false && (
              <a
                href={`https://wa.me/${member.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-lg border border-[#25D366] px-6 py-3 text-xs font-bold uppercase tracking-wide text-[#25D366]"
              >
                <WhatsappIcon />
                Contactar por WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

const MemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e: React.MouseEvent, flipState: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFlipped(flipState);
  };

  return (
    <div className="group h-[780px] w-full [perspective:1000px]">
      <div
        className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <div
          className={`absolute inset-0 h-full w-full overflow-hidden rounded-xl bg-neutral-900 [backface-visibility:hidden] ${
            isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          <div
            className="absolute inset-[-2px] bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{ backgroundSize: '200% 200%' }}
          ></div>
          <div className="absolute inset-[1px] z-0 rounded-xl bg-neutral-900"></div>

          <div className="relative z-10 h-full w-full">
            <img
              src={member.imageFront}
              alt={member.name}
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              className="h-full w-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
            />

            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-xl opacity-20">
              <div className="h-full w-full -translate-x-[150%] bg-gradient-to-tr from-transparent via-white/40 to-transparent group-hover:animate-[sheen-slide_1.4s_ease-in-out_forwards]"></div>
            </div>

            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>

            <div className="absolute bottom-0 left-0 z-30 w-full p-6 text-left md:p-8">
              <div className="mb-4 translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                <h3 className="mb-2 text-2xl font-bold leading-tight text-white drop-shadow-md md:text-3xl font-serif">
                  {member.name}
                </h3>
                <p className="pl-1 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 md:text-xs">
                  {member.role}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/20 pt-4 opacity-0 transition-opacity duration-500 delay-100 group-hover:opacity-100">
                <div className="flex-grow pr-2">
                  <p className="break-words whitespace-normal text-xs italic leading-relaxed text-gray-400 md:text-sm font-light">
                    "{member.tagline}"
                  </p>
                </div>

                <button
                  onClick={(e) => handleFlip(e, true)}
                  className="group/btn relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-all hover:bg-white hover:text-black"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-0 h-full w-full overflow-hidden rounded-xl border border-gray-700 bg-neutral-950 shadow-[0_0_30px_rgba(255,255,255,0.1)] [backface-visibility:hidden] [transform:rotateY(180deg)] ${
            isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div className="relative z-10 flex h-full flex-col justify-between p-8 text-center">
            <div className="flex-shrink-0">
              <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-gray-600 p-1 shadow-lg">
                <img
                  src={member.imageFront}
                  className="h-full w-full rounded-full object-cover grayscale"
                  alt="thumb"
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                />
              </div>
              <h3 className="mb-1 font-serif text-2xl text-white">{member.name}</h3>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">{member.role}</p>
              <div className="mx-auto h-[1px] w-12 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
            </div>

            <div className="my-4 flex flex-grow items-center overflow-y-auto scrollbar-hide">
              <p className="w-full px-2 text-justify text-sm leading-relaxed text-gray-300 font-light">
                {member.description}
              </p>
            </div>

            <div className="flex w-full flex-shrink-0 flex-col items-center gap-3">
              {member.showWhatsapp !== false && (
                <a
                  href={`https://wa.me/${member.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#25D366] bg-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-wide text-[#25D366] shadow-[0_0_10px_rgba(37,211,102,0.2)] transition-all duration-300 hover:bg-[#25D366] hover:text-black hover:shadow-[0_0_20px_#25D366]"
                >
                  <WhatsappIcon />
                  Contactar por WhatsApp
                </a>
              )}

              <button
                onClick={(e) => handleFlip(e, false)}
                className="flex cursor-pointer items-center gap-2 py-2 text-xs uppercase tracking-widest text-gray-500 transition-colors hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Regresar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Team: React.FC = () => {
  const isCompact = useMediaQuery('(max-width: 1023px)');

  return (
    <section id="equipo" className="relative bg-transparent py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal direction="up" duration={1.0} width="100%">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-4xl text-white md:text-5xl">Nuestro Equipo</h2>
            <div className="mx-auto mb-6 h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            <p className="mx-auto max-w-2xl text-sm font-light leading-relaxed text-gray-400 md:text-base">
              Profesionales comprometidos con la excelencia juridica y la etica profesional.
              Cada socio aporta una vision estrategica unica para blindar tus intereses.
            </p>
          </div>
        </Reveal>

        {isCompact ? (
          <div className="mx-auto grid max-w-[440px] grid-cols-1 gap-6 md:max-w-none md:grid-cols-2">
            {displayOrder.map((member) => (
              <Reveal key={member.name} direction="none" width="100%" threshold={0.1} blur={false}>
                <MemberCardLite member={member} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12">
            <div className="z-30 w-full max-w-[400px]">
              <Reveal direction="up" delay={0.1} width="100%">
                <MemberCard member={teamMembers[0]} />
              </Reveal>
            </div>

            <div className="z-20 flex w-full flex-wrap justify-center gap-8 lg:gap-12">
              {teamMembers.slice(3, 7).map((member, index) => (
                <div key={member.name} className="w-full max-w-[400px]">
                  <Reveal
                    direction={index % 2 === 0 ? 'right' : 'left'}
                    delay={0.2 + index * 0.12}
                    width="100%"
                  >
                    <MemberCard member={member} />
                  </Reveal>
                </div>
              ))}
            </div>

            <div className="z-10 flex w-full flex-wrap justify-center gap-8 lg:gap-12">
              {teamMembers.slice(1, 3).map((member, index) => (
                <div key={member.name} className="w-full max-w-[400px]">
                  <Reveal
                    direction={index % 2 === 0 ? 'right' : 'left'}
                    delay={0.4 + index * 0.12}
                    width="100%"
                  >
                    <MemberCard member={member} />
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Team;
