import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './gsapEffects';
import { IMAGENES } from '../imagenes_url';
import { WHATSAPP_URLS } from '../whatsapp_urls';

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
    role: 'Socio Director',
    tagline: 'Defensa estrategica y prevencion de conflictos laborales.',
    description:
      'Experto en la gestion de relaciones obrero-patronales y litigio laboral. Mi enfoque se centra en el blindaje preventivo de las empresas y en la resolucion eficiente de controversias, garantizando seguridad juridica y estabilidad operativa.',
    phone: WHATSAPP_URLS.socios.jose_luis,
    imageFront: IMAGENES.assets.team.jose_luis_frente,
    imageBack: IMAGENES.assets.team.jose_luis_atras,
  },
  {
    name: 'Lic. Jesus Godinez',
    role: 'Lic. en Derecho',
    tagline: 'Asesoria legal integral y enfoque en resultados.',
    description:
      'Perfil profesional en actualizacion. Brindamos acompanamiento juridico con atencion personalizada, analisis tecnico y compromiso etico para proteger los intereses de cada cliente.',
    phone: WHATSAPP_URLS.socios.jesus,
    imageFront: IMAGENES.assets.team.jesus_frente,
    imageBack: IMAGENES.assets.team.jesus_atras,
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
    name: 'Lic. Sarah Robles',
    role: 'Derecho Inmobiliario',
    tagline: 'Estrategia patrimonial y certeza juridica en operaciones inmobiliarias.',
    description:
      'Brinda acompanamiento legal en asuntos de derecho inmobiliario, con enfoque en contratos, revision documental, regularizacion y proteccion patrimonial. Su practica se centra en aportar claridad y seguridad juridica en cada operacion.',
    phone: WHATSAPP_URLS.socios.sarah,
    imageFront: IMAGENES.assets.team.sarah_frente,
    imageBack: IMAGENES.assets.team.sarah_atras,
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


// Orden de presentación: Senen, José Luis, Jesús, Ximena, Yanci, Fabrizio, Sarah, Alfonso y Antonio.
const byName = (name: string) => teamMembers.find((m) => m.name.includes(name))!;
const orderedMembers: TeamMember[] = [
  'Senen',
  'Jose Luis',
  'Jesus',
  'Ximena',
  'Yanci',
  'Fabrizio',
  'Sarah',
  'Alfonso',
  'Antonio',
].map(byName);

// Encuadre vertical/horizontal de cada foto para dejar al abogado centrado en la tarjeta 4:5.
const PHOTO_FOCUS: Record<string, string> = {
  'Lic. Senen Hermosillo': '50% 0%',
  'Lic. Jose Luis Gutierrez': '50% 0%',
  'Lic. Jesus Godinez': '55% 60%',
  'Lic. Ximena Lopez Vazquez': '50% 50%',
  'Lic. Yanci Contreras Garcia': '50% 50%',
  'Fabrizio Ibarra': '50% 10%',
  'Lic. Sarah Robles': '50% 5%',
  'Lic. Alfonso Gonzalez': '55% 0%',
  'Lic. Antonio Guzman': '70% 50%',
};
const focusOf = (m: TeamMember) => PHOTO_FOCUS[m.name] ?? '50% 50%';

gsap.registerPlugin(ScrollTrigger);

const TEAM_IMAGE_FALLBACK = IMAGENES.assets.team.carlos_frente;
const DESKTOP_QUERY = '(min-width: 1024px)';

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = TEAM_IMAGE_FALLBACK;
};

const pad = (n: number) => String(n).padStart(2, '0');

const WhatsAppButton: React.FC<{ phone: string }> = ({ phone }) => (
  <a
    href={`https://wa.me/${phone}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 rounded-full border border-[#25D366] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#25D366] transition-all duration-300 hover:bg-[#25D366] hover:text-black hover:shadow-[0_0_20px_#25D366]"
  >
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
    Contactar por WhatsApp
  </a>
);

const SectionHeading: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={className}>
    <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.35em] text-gray-500">Nuestro equipo</p>
    <h2 className="font-serif text-4xl text-white md:text-5xl">Socios y abogados</h2>
    <div className="mt-5 h-px w-24 bg-gradient-to-r from-gray-200 via-gray-500 to-transparent" />
  </div>
);

/* ------------------------------------------------------------------ */
/* ESCRITORIO: escena fija; el scroll va pasando de un miembro al otro */
/* ------------------------------------------------------------------ */
const TeamStage: React.FC<{ onFail: () => void }> = ({ onFail }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const n = orderedMembers.length;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let ctx: gsap.Context | undefined;
    try {
    ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]');
      const infos = gsap.utils.toArray<HTMLElement>('[data-info]');
      const ticks = gsap.utils.toArray<HTMLElement>('[data-tick]');
      const counter = stage.querySelector<HTMLElement>('[data-counter]');

      const clamp = (v: number) => Math.min(1, Math.max(0, v));
      const ease = gsap.parseEase('power2.inOut');
      const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

      // Estado puro: cada fotograma se calcula solo a partir del progreso (u = 0 … n-1).
      // Así no hay estados intermedios heredados que puedan mezclarse tras un salto de scroll.
      const render = (u: number) => {
        cards.forEach((card, i) => {
          const enter = i === 0 ? 1 : ease(clamp(u - (i - 1)));
          const exit = ease(clamp(u - i));
          gsap.set(card, {
            autoAlpha: i === 0 || u > i - 1 ? 1 : 0,
            yPercent: lerp(105, 0, enter) + lerp(0, -3, exit),
            rotate: lerp(5, 0, enter) + lerp(0, -2, exit),
            scale: lerp(1, 0.9, exit),
            filter: exit > 0.001 ? `brightness(${lerp(1, 0.45, exit).toFixed(3)})` : 'none',
          });
        });
        infos.forEach((info, j) => {
          const fadeIn = j === 0 ? 1 : ease(clamp((u - (j - 0.5)) / 0.5));
          const fadeOut = ease(clamp((u - j) / 0.45));
          gsap.set(info, {
            autoAlpha: fadeIn * (1 - fadeOut),
            y: lerp(40, 0, fadeIn) + lerp(0, -40, fadeOut),
          });
        });
        ticks.forEach((tick, j) => {
          const on = j === 0 ? 1 : ease(clamp((u - (j - 0.4)) / 0.4));
          const off = ease(clamp((u - j) / 0.4));
          const k = on * (1 - off);
          gsap.set(tick, { scaleX: lerp(0.35, 1, k), opacity: lerp(0.35, 1, k) });
        });
        if (counter) counter.textContent = pad(Math.min(n, Math.round(u) + 1));
      };

      // Suavizado: el valor mostrado persigue al del scroll
      const state = { u: 0 };
      render(0);

      ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => `+=${(n - 1) * 85}%`,
        pin: true,
        anticipatePin: 1,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.05, ease: 'power2.inOut' },
        onUpdate: (self) => {
          gsap.to(state, { u: self.progress * (n - 1), duration: 0.5, ease: 'power3.out', overwrite: true, onUpdate: () => render(state.u) });
        },
        onRefresh: (self) => {
          state.u = self.progress * (n - 1);
          render(state.u);
        },
      });
    }, stage);
    } catch (err) {
      console.error('Equipo: animación no disponible, se muestra la lista.', err);
      onFail();
    }

    return () => ctx?.revert();
  }, [n, onFail]);

  return (
    <div ref={stageRef} className="relative h-[100svh] overflow-hidden pt-28 pb-8">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-[minmax(0,1fr)_minmax(0,34rem)] gap-16 px-12 xl:gap-24">
        {/* Columna de texto */}
        <div className="relative flex min-h-0 flex-col justify-between">
          <SectionHeading />

          <div className="relative flex-1">
            {orderedMembers.map((m, i) => (
              <div
                key={m.name}
                data-info
                className="absolute inset-0 flex flex-col justify-center pr-4"
                style={i === 0 ? undefined : { opacity: 0, visibility: 'hidden' }}
              >
                <p className="mb-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                  <span className="h-px w-8 bg-gradient-to-r from-blue-500 to-transparent" />
                  {m.role}
                </p>
                <h3 className="font-serif text-4xl font-bold leading-[1.05] text-white xl:text-5xl">{m.name}</h3>
                <p className="mt-5 max-w-lg font-serif text-lg italic leading-snug text-gray-300">“{m.tagline}”</p>
                <p className="mt-6 max-w-lg text-sm font-light leading-relaxed text-gray-400">{m.description}</p>
                {m.showWhatsapp !== false && (
                  <div className="mt-8">
                    <WhatsAppButton phone={m.phone} />
                  </div>
                )}
                <span className="sr-only">{`Perfil ${i + 1} de ${n}`}</span>
              </div>
            ))}
          </div>

          {/* Contador + índice de progreso */}
          <div className="flex items-end justify-between gap-8">
            <div className="font-serif text-white">
              <span data-counter className="text-6xl font-bold tabular-nums">01</span>
              <span className="ml-2 text-lg text-gray-500">/ {pad(n)}</span>
            </div>
            <div className="flex flex-1 items-center gap-2 pb-3" aria-hidden="true">
              {orderedMembers.map((m) => (
                <span key={m.name} data-tick className="h-[3px] flex-1 origin-left rounded bg-gradient-to-r from-white to-gray-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Pila de tarjetas */}
        <div className="relative h-full min-h-0">
          {orderedMembers.map((m, i) => (
            <div
              key={m.name}
              data-card
              className="absolute inset-0 flex items-center justify-center will-change-transform"
              style={i === 0 ? { zIndex: 1 } : { zIndex: i + 1, opacity: 0, visibility: 'hidden' }}
            >
              <div className="aspect-[4/5] rounded-3xl p-[1.5px] shadow-[0_30px_80px_rgba(0,0,0,0.7)]" style={{ width: 'min(100%, calc((100svh - 10rem) * 0.8))', background: 'linear-gradient(135deg, #f4f4f5 0%, #9a9aa0 22%, #3a3a3f 42%, #d8d8dc 60%, #6e6e75 80%, #f4f4f5 100%)' }}>
                <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-neutral-900">
                  <img
                    src={m.imageFront}
                    alt={m.name}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={handleImageError}
                    className="h-full w-full object-cover grayscale contrast-110"
                    style={{ objectPosition: focusOf(m) }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25" />
                  <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
                    {pad(i + 1)} — {m.role}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <div className="mb-3 h-px w-12 bg-gradient-to-r from-white to-transparent" />
                    <p className="font-serif text-2xl font-bold text-white">{m.name}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MÓVIL / TABLET / MOVIMIENTO REDUCIDO: lista que se revela al bajar   */
/* ------------------------------------------------------------------ */
const TeamListCard: React.FC<{ member: TeamMember; index: number; animate: boolean }> = ({ member, index, animate }) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !animate) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
      );
      gsap.fromTo(
        el.querySelector('img'),
        { scale: 1.15 },
        { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    }, el);
    return () => ctx.revert();
  }, [animate]);

  return (
    <article ref={ref} className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-neutral-950">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={member.imageFront}
          alt={member.name}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className="h-full w-full object-cover grayscale contrast-110"
          style={{ objectPosition: focusOf(member) }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
        <span className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
          {pad(index + 1)} / {pad(orderedMembers.length)}
        </span>
      </div>
      <div className="p-6">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400">{member.role}</p>
        <h3 className="font-serif text-2xl font-bold text-white">{member.name}</h3>
        <p className="mt-3 font-serif text-base italic text-gray-300">“{member.tagline}”</p>
        <p className="mt-4 text-sm font-light leading-relaxed text-gray-400">{member.description}</p>
        {member.showWhatsapp !== false && (
          <div className="mt-6">
            <WhatsAppButton phone={member.phone} />
          </div>
        )}
      </div>
    </article>
  );
};

const TeamList: React.FC<{ animate: boolean }> = ({ animate }) => (
  <div className="mx-auto max-w-7xl px-6 py-24">
    <SectionHeading className="mb-14" />
    <div className="flex flex-col gap-10">
      {orderedMembers.map((m, i) => (
        <TeamListCard key={m.name} member={m} index={i} animate={animate} />
      ))}
    </div>
  </div>
);

const Team: React.FC = () => {
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches && !prefersReducedMotion()
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(mq.matches && !prefersReducedMotion());
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <section id="equipo" className="relative bg-transparent">
      {desktop && !failed ? <TeamStage onFail={onFail} /> : <TeamList animate={!prefersReducedMotion() && !failed} />}
    </section>
  );
};

export default Team;
