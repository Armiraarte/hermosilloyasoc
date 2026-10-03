import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './gsapEffects';
import { IMAGENES } from '../imagenes_url';
import { WHATSAPP_URLS } from '../whatsapp_urls';
import SectionLight from './SectionLight';
import './Team.css';

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


// Encuadre de cada foto en la escena (área casi cuadrada): el rostro queda en el tercio superior.
// pos: object-position; zoom: acercamiento fijo hacia `pos` para fotos tomadas de lejos;
// fit: la foto es un primer plano y se muestra completa a lo alto, sin recortar.
interface PhotoFrame {
  pos: string;
  zoom?: number;
  fit?: boolean;
}
const PHOTO_FRAME: Record<string, PhotoFrame> = {
  'Lic. Senen Hermosillo': { pos: '58% 40%', zoom: 1.08 },
  'Lic. Jose Luis Gutierrez': { pos: '60% 45%', zoom: 1.08 },
  'Lic. Jesus Godinez': { pos: '56% 80%' },
  'Lic. Ximena Lopez Vazquez': { pos: '50% 10%' },
  'Lic. Yanci Contreras Garcia': { pos: '50% 10%' },
  'Fabrizio Ibarra': { pos: '58% 62%' },
  'Lic. Sarah Robles': { pos: '47% 60%' },
  'Lic. Alfonso Gonzalez': { pos: '50% 0%', fit: true },
  'Lic. Antonio Guzman': { pos: '68% 42%', zoom: 1.4 },
};
const frameOf = (m: TeamMember): PhotoFrame => PHOTO_FRAME[m.name] ?? { pos: '50% 30%' };
const focusOf = (m: TeamMember) => frameOf(m).pos;

// Tiempo de la escena: cada transición dura 1 y después la persona queda quieta un momento.
const TRANSITION = 1;
const HOLD = 0.3;
const STEP = TRANSITION + HOLD;

gsap.registerPlugin(ScrollTrigger);

const TEAM_IMAGE_FALLBACK = IMAGENES.assets.team.carlos_frente;
// Escena fija a pantalla completa: en escritorio (foto | texto) y en pantallas verticales
// (foto arriba, texto abajo). Los teléfonos en horizontal usan la lista.
const STAGE_QUERY = '(min-width: 900px) and (min-height: 600px), (max-width: 899px) and (min-height: 560px) and (orientation: portrait)';

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = TEAM_IMAGE_FALLBACK;
};

const pad = (n: number) => String(n).padStart(2, '0');
// Mismo filtro que .team-photo en CSS, con brillo y desenfoque animables.
const photoFilter = (brightness: number, blur: number) =>
  `grayscale(1) contrast(1.1) brightness(${brightness}) blur(${blur}px)`;

const WhatsAppButton: React.FC<{ phone: string }> = ({ phone }) => (
  <a
    href={`https://wa.me/${phone}`}
    target="_blank"
    rel="noopener noreferrer"
    className="team-whatsapp rounded-full border border-[#25D366] font-bold uppercase text-[#25D366] transition-all duration-300 hover:bg-[#25D366] hover:text-black hover:shadow-[0_0_20px_#25D366]"
  >
    <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
    <span>Contactar por WhatsApp</span>
  </a>
);

const SectionHeading: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`team-heading ${className}`}>
    <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.35em] text-gray-500">Nuestro equipo</p>
    <h2 className="font-serif text-white">Socios y abogados</h2>
    <div className="mt-5 h-px w-24 bg-gradient-to-r from-gray-200 via-gray-500 to-transparent" />
  </div>
);

// Bloque de información de un miembro. Cada hijo con data-line entra por separado.
const MemberInfo: React.FC<{ member: TeamMember; index: number }> = ({ member, index }) => (
  <>
    <p data-line className="team-info__role">
      <span className="team-info__index">{pad(index + 1)}</span>
      <span className="team-info__rule" aria-hidden="true" />
      {member.role}
    </p>
    <h3 data-line className="team-info__name font-serif">{member.name}</h3>
    <p data-line className="team-info__tagline font-serif">“{member.tagline}”</p>
    <p data-line className="team-info__description">{member.description}</p>
    {member.showWhatsapp !== false && (
      <div data-line className="team-info__contact">
        <WhatsAppButton phone={member.phone} />
      </div>
    )}
  </>
);

const MemberPhoto: React.FC<{ member: TeamMember; eager?: boolean; className?: string }> = ({ member, eager, className = '' }) => (
  <img
    src={member.imageFront}
    alt={member.name}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    onError={handleImageError}
    className={`team-photo ${className}`}
    style={{ objectPosition: focusOf(member) }}
  />
);

// Foto de la escena con su encuadre fijo; la animación mueve solo la imagen interior.
const StagePhoto: React.FC<{ member: TeamMember }> = ({ member }) => {
  const frame = frameOf(member);
  return (
    <div
      className="team-photo-frame"
      data-fit={frame.fit || undefined}
      style={frame.zoom ? { transform: `scale(${frame.zoom})`, transformOrigin: frame.pos } : undefined}
    >
      {frame.fit && <img src={member.imageFront} alt="" aria-hidden="true" className="team-photo-ambient" />}
      <MemberPhoto member={member} eager />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* ESCRITORIO: escena a pantalla completa; el scroll pasa de un miembro */
/* a otro con una cortina de luz.                                       */
/* ------------------------------------------------------------------ */
const TeamStage: React.FC<{ onFail: () => void }> = ({ onFail }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const n = orderedMembers.length;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const textColumn = stage.querySelector<HTMLElement>('[data-team-text]');
    const fits = () => !textColumn || textColumn.scrollHeight <= textColumn.clientHeight + 2;
    let ctx: gsap.Context | undefined;
    let disposed = false;

    // Se arranca con las fuentes ya cargadas: así se decide una sola vez entre escena y
    // lista, y nunca se cambia a mitad del scroll porque el texto creció al cargar la fuente.
    const init = () => {
      if (disposed) return;
      if (!fits()) {
        onFail();
        return;
      }
      try {
        ctx = gsap.context(() => {
          const slides = gsap.utils.toArray<HTMLElement>('[data-slide]');
          const profiles = gsap.utils.toArray<HTMLElement>('[data-profile]');
          const linesOf = (i: number) => profiles[i].querySelectorAll<HTMLElement>('[data-line]');
          const counter = stage.querySelector<HTMLElement>('[data-counter]');
          const wipe = stage.querySelector<HTMLElement>('[data-wipe]');
          const fill = stage.querySelector<HTMLElement>('[data-fill]');
          // La cortina arranca en el borde de la foto, no en el negro del texto.
          const media = stage.querySelector<HTMLElement>('.team-slide__media');
          const edge = () => (media ? Math.min(100, (media.offsetWidth / stage.offsetWidth) * 100) : 100);
          const hidden = () => `inset(0% 0% 0% ${edge()}%)`;

          // Estado inicial: solo el primer miembro a la vista.
          gsap.set(profiles, { autoAlpha: 1 });
          gsap.set(stage.querySelectorAll('[data-line]'), { filter: 'blur(0px)' });
          gsap.set(stage.querySelectorAll('.team-photo'), { filter: photoFilter(0.94, 0) });
          profiles.forEach((_, i) => i > 0 && gsap.set(linesOf(i), { autoAlpha: 0 }));
          gsap.set(slides.slice(1), { clipPath: hidden });

          const tl = gsap.timeline({ defaults: { ease: 'none' } });
          tl.addLabel('m0', 0);
          tl.fromTo(fill, { scaleX: 1 / n }, { scaleX: 1, duration: (n - 1) * STEP }, 0);

          for (let i = 1; i < n; i++) {
            // La transición termina medio descanso antes de la etiqueta, así cada persona queda centrada en su pausa.
            const t = i * STEP - TRANSITION - HOLD / 2;
            const prev = slides[i - 1];
            const next = slides[i];

            // Foto saliente: se desplaza hacia la izquierda, se desenfoca y se apaga.
            tl.to(prev.querySelector('.team-photo'), { scale: 1.14, xPercent: -6, filter: photoFilter(0.8, 6), duration: 1, ease: 'power2.inOut' }, t)
              .to(prev.querySelector('.team-slide__dim'), { opacity: 0.85, duration: 1, ease: 'power2.inOut' }, t)
              .to(linesOf(i - 1), { y: -32, autoAlpha: 0, filter: 'blur(6px)', duration: 0.32, stagger: 0.035, ease: 'power2.in' }, t);

            // Foto entrante: emerge desde el negro (derecha) con el filo de luz delante.
            tl.fromTo(next, { clipPath: hidden }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, t)
              .fromTo(
                next.querySelector('.team-photo'),
                { scale: 1.3, xPercent: 12, filter: photoFilter(1.9, 0) },
                { scale: 1, xPercent: 0, filter: photoFilter(0.94, 0), duration: 1, ease: 'power3.out' },
                t
              )
              .fromTo(next.querySelector('.team-slide__flash'), { opacity: 0, xPercent: 60 }, { opacity: 1, xPercent: -20, duration: 0.55, ease: 'power2.out' }, t + 0.1)
              .to(next.querySelector('.team-slide__flash'), { opacity: 0, xPercent: -60, duration: 0.45, ease: 'power2.in' }, t + 0.65)
              .fromTo(next.querySelector('.team-slide__key'), { opacity: 0, xPercent: 30 }, { opacity: 1, xPercent: 0, duration: 1, ease: 'sine.out' }, t + 0.15)
              .fromTo(wipe, { x: () => (edge() / 100) * stage.offsetWidth }, { x: 0, duration: 1, ease: 'power3.inOut', immediateRender: false }, t)
              .fromTo(wipe, { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: false }, t)
              .to(wipe, { opacity: 0, duration: 0.2 }, t + 0.8)
              .fromTo(
                linesOf(i),
                { y: 44, autoAlpha: 0, filter: 'blur(8px)' },
                { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.5, stagger: 0.06, ease: 'power3.out', immediateRender: false },
                t + 0.42
              )
              .addLabel(`m${i}`, i * STEP);
          }

          ScrollTrigger.create({
            trigger: stage,
            start: 'top top',
            end: () => `+=${(n - 1) * 110}%`,
            pin: true,
            anticipatePin: 1,
            scrub: 0.9,
            animation: tl,
            invalidateOnRefresh: true,
            snap: { snapTo: 'labelsDirectional', duration: { min: 0.35, max: 0.8 }, delay: 0.08, ease: 'power2.inOut' },
            onUpdate: () => {
              if (counter) counter.textContent = pad(Math.min(n, Math.round(tl.time() / STEP) + 1));
            },
          });

          // Entrada: mientras la sección sube hacia la pantalla, la primera foto sale de la penumbra
          // y el texto se enfoca, para que la escena continúe el scroll de la página sin cortes.
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: stage, start: 'top 90%', end: 'top top', scrub: 0.9 },
            })
            .fromTo(slides[0].querySelector('.team-slide__media'), { scale: 1.12, opacity: 0.25 }, { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' }, 0)
            .fromTo(stage.querySelector('.team-stage__rim'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 0)
            .fromTo(textColumn, { y: 80, autoAlpha: 0, filter: 'blur(8px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, 0.2);
        }, stage);
      } catch (err) {
        console.error('Equipo: animación no disponible, se muestra la lista.', err);
        onFail();
      }
      observer.observe(stage);
      stage.querySelectorAll<HTMLElement>('[data-team-text], [data-profile]').forEach((el) => observer.observe(el));
      ScrollTrigger.refresh();
    };

    // El contenido puede crecer al cambiar el zoom o el tamaño del texto.
    // En ese caso mostramos la lista completa, sin recortar ningún perfil.
    let layoutFrame = 0;
    const checkLayout = () => {
      if (disposed) return;
      window.cancelAnimationFrame(layoutFrame);
      layoutFrame = window.requestAnimationFrame(() => {
        if (!disposed && !fits()) onFail();
      });
    };
    const observer = new ResizeObserver(checkLayout);
    document.fonts.ready.then(init);

    return () => {
      disposed = true;
      observer.disconnect();
      window.cancelAnimationFrame(layoutFrame);
      ctx?.revert();
    };
  }, [n, onFail]);

  return (
    <div ref={stageRef} className="team-stage">
      {/* Fotos a pantalla completa, fundidas a negro hacia la derecha */}
      {orderedMembers.map((m, i) => (
        <div key={m.name} data-slide className="team-slide" style={{ zIndex: i + 1 }}>
          <div className="team-slide__media">
            <StagePhoto member={m} />
            <span className="team-slide__key" aria-hidden="true" />
            <span className="team-slide__flash" aria-hidden="true" />
          </div>
          <span className="team-slide__fade" aria-hidden="true" />
          <span className="team-slide__dim" aria-hidden="true" />
        </div>
      ))}

      {/* Filo de luz que acompaña la cortina */}
      <span data-wipe className="team-wipe" aria-hidden="true" />
      <span className="team-stage__rim" aria-hidden="true" />

      {/* Información del lado derecho, sobre el negro */}
      <div data-team-text className="team-stage__text">
        <SectionHeading />

        <div className="team-profiles">
          {orderedMembers.map((m, i) => (
            <div
              key={m.name}
              data-profile
              className="team-info"
              style={i === 0 ? undefined : { opacity: 0, visibility: 'hidden' }}
            >
              <MemberInfo member={m} index={i} />
              <span className="sr-only">{`Perfil ${i + 1} de ${n}`}</span>
            </div>
          ))}
        </div>

        <div className="team-progress">
          <div className="shrink-0 font-serif leading-none text-white">
            <span data-counter className="team-progress__number font-bold tabular-nums">01</span>
            <span className="ml-2 text-lg text-gray-500">/ {pad(n)}</span>
          </div>
          <div className="team-progress__track" aria-hidden="true">
            <span data-fill className="team-progress__fill" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MÓVIL / TABLET / MOVIMIENTO REDUCIDO: una pantalla por persona       */
/* ------------------------------------------------------------------ */
const TeamPerson: React.FC<{ member: TeamMember; index: number; animate: boolean }> = ({ member, index, animate }) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !animate) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.team-photo',
        { scale: 1.18, yPercent: -4 },
        { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
      gsap
        .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: 0.6 } })
        .fromTo('.team-person__band', { xPercent: -120 }, { xPercent: 220, duration: 1 }, 0)
        .fromTo('.team-person__band', { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0)
        .to('.team-person__band', { opacity: 0, duration: 0.25 }, 0.75);
      gsap.fromTo(
        '[data-line]',
        { y: 40, autoAlpha: 0, filter: 'blur(8px)' },
        {
          y: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 45%', toggleActions: 'play none none reverse' },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [animate]);

  return (
    <article ref={ref} className="team-person" aria-label={member.name}>
      <div className="team-person__media">
        <MemberPhoto member={member} />
      </div>
      <span className="team-person__fade" aria-hidden="true" />
      <span className="team-person__band" aria-hidden="true" />
      <div className="team-person__body">
        <MemberInfo member={member} index={index} />
      </div>
    </article>
  );
};

const TeamList: React.FC<{ animate: boolean }> = ({ animate }) => (
  <div className="team-list">
    <SectionLight side="center" />
    <SectionHeading className="team-list__heading" />
    {orderedMembers.map((m, i) => (
      <TeamPerson key={m.name} member={m} index={i} animate={animate} />
    ))}
  </div>
);

const Team: React.FC = () => {
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [stage, setStage] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(STAGE_QUERY).matches && !prefersReducedMotion()
  );

  useEffect(() => {
    const mq = window.matchMedia(STAGE_QUERY);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let resizeFrame = 0;
    let lastWidth = window.innerWidth;
    const update = () => {
      setStage(mq.matches && !motionQuery.matches);
      setReducedMotion(motionQuery.matches);
      // En móvil la barra del navegador cambia la altura al hacer scroll: solo un cambio
      // de ancho justifica volver a intentar la escena tras haber caído a la lista.
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        setFailed(false);
      }
    };
    const onResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(update);
    };
    mq.addEventListener('change', update);
    motionQuery.addEventListener('change', update);
    window.addEventListener('resize', onResize);
    return () => {
      mq.removeEventListener('change', update);
      motionQuery.removeEventListener('change', update);
      window.removeEventListener('resize', onResize);
      window.cancelAnimationFrame(resizeFrame);
    };
  }, []);

  return (
    <section id="equipo" className="team-section relative bg-black">
      {stage && !failed ? <TeamStage onFail={onFail} /> : <TeamList animate={!reducedMotion && !failed} />}
    </section>
  );
};

export default Team;
