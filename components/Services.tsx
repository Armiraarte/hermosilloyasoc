
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SectionLight from './SectionLight';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionFigure from './SectionFigure';
import { BadgeCheck, Car, FileText, Handshake, Landmark, Scale, ShieldCheck, Ship, Stamp, Store, Users, type LucideIcon } from 'lucide-react';
import { IMAGENES } from '../imagenes_url';
import { WHATSAPP_URLS } from '../whatsapp_urls';
import { prefersReducedMotion } from './gsapEffects';
import './Services.css';

gsap.registerPlugin(ScrollTrigger);

// --- DATA STRUCTURE ---
interface SubService {
  title: string;
  description: string;
  items: string[];
  icon?: React.ReactNode;
}

interface ServiceData {
  id: string;
  title: string;
  modalTitle: string;
  description: string;
  image: string;
  icon: LucideIcon;
  fullDescription?: string;
  subServices?: SubService[];
}


const allServices: ServiceData[] = [
  {
    id: "notaria",
    title: "Trámites Ante Notaría y Correduría Pública",
    modalTitle: "Trámites Ante Notaría y Correduría Pública",
    description: "Gestión experta de escrituras, poderes, certificaciones y fe pública para actos comerciales.",
    image: IMAGENES.assets.services.notaria,
    icon: Stamp,
    fullDescription: "En un entorno donde la certeza jurídica y la eficiencia operativa no son negociables, ofrecemos un acompañamiento integral en todos los trámites que involucran notarios y corredores públicos. Garantizamos que cada acto legal se ejecute con máxima seguridad, rapidez y conveniencia.",
    subServices: [
      {
        title: "Trámites Notariales",
        description: "Escrituras, compraventas, testamentos y poderes.",
        items: ["Escrituras públicas", "Compra-venta", "Donaciones", "Poderes notariales"]
      },
      {
        title: "Trámites ante Correduría Pública",
        description: "Protocolización de sociedades, fe pública comercial, contratos y valuaciones.",
        items: [
          "Actas de fe pública comercial",
          "Contratos y convenios entre particulares y empresas",
          "Constitución y protocolización de sociedades mercantiles",
          "Valuaciones comerciales y de empresas",
          "Certificación de hechos jurídicos"
        ]
      }
    ]
  },
  {
    id: "civil",
    title: "Juicio Civil · Familiar · Mercantil",
    modalTitle: "Litigio Civil, Familiar y Mercantil",
    description: "Representación y defensa integral en litigio complejo, disputas familiares y conflictos comerciales.",
    image: IMAGENES.assets.services.civil,
    icon: Scale,
    fullDescription: "En Hermosillo y Asoc., cada juicio es abordado como un proyecto estratégico, donde combinamos el dominio jurídico, el análisis integral del conflicto y una ejecución táctica orientada a resultados concretos. No improvisamos: litigamos con método y visión.",
    subServices: [
      {
        title: "Juicios en Materia Civil",
        description: "Estrategia procesal para controversias contractuales y de propiedad.",
        items: ["Cumplimiento o rescisión de contrato", "Controversias por propiedad", "Reivindicación e interdictos", "Responsabilidad civil y daños"]
      },
      {
        title: "Juicios en Materia Familiar",
        description: "Soluciones sensibles y firmes en divorcio, custodia y sucesiones.",
        items: ["Divorcios incausados y voluntarios", "Custodia y patria potestad", "Juicios de alimentos", "Sucesiones intestadas"]
      },
      {
        title: "Juicios en Materia Mercantil",
        description: "Cobranza eficaz, defensa en títulos de crédito y disputas entre socios.",
        items: ["Juicios ejecutivos mercantiles", "Cobranza de títulos de crédito", "Controversias entre socios", "Incumplimiento de contratos"]
      }
    ]
  },

  {
    id: "ija",
    title: "Convenios de Validación ante el IJA",
    modalTitle: "Justicia Alternativa (IJA)",
    description: "Métodos alternos de solución de conflictos, gestión inmobiliaria y cobranza profesional.",
    image: IMAGENES.assets.services.ija,
    icon: Handshake,
    fullDescription: "En Hermosillo y Asoc., no solo administramos inmuebles: gestionamos activos con visión legal, financiera y patrimonial. Nuestro enfoque va más allá del mantenimiento y la cobranza: garantizamos seguridad jurídica, optimización fiscal y estabilidad contractual para proteger tu inversión.",
    subServices: [
      {
        title: "Gestión integral de arrendamientos",
        description: "Contratos blindados (privados e IJA), revisión de cláusulas y control de renovaciones.",
        items: ["Contratos blindados (privados e IJA)", "Revisión de cláusulas y fianzas", "Control de vencimientos"]
      },
      {
        title: "Cobranza profesional y puntual",
        description: "Emisión de recibos, control de pagos y acciones legales ante mora.",
        items: ["Emisión de recibos", "Control de pagos", "Acciones legales ante mora"]
      },
      {
        title: "Supervisión operativa del inmueble",
        description: "Coordinación de mantenimientos, inspecciones y proveedores certificados.",
        items: ["Coordinación de mantenimientos", "Inspecciones periódicas", "Gestión de proveedores"]
      },
      {
        title: "Representación legal y mediación",
        description: "Atención a controversias con inquilinos y defensa en juicios de arrendamiento.",
        items: ["Representación ante inquilinos", "Juicios de arrendamiento", "Desalojo o incumplimiento"]
      },
      {
        title: "Gestión contable y fiscal",
        description: "Reportes, facturación electrónica y asesoría fiscal para propietarios.",
        items: ["Reportes mensuales", "Facturación electrónica", "Asesoría fiscal"]
      }
    ]
  },
  {
    id: "registro_civil",
    title: "Registro Civil",
    modalTitle: "Registro Civil",
    description: "Corrección de actas, nulidades y trámites administrativos con certeza jurídica.",
    image: IMAGENES.assets.services.registro_civil,
    icon: FileText,
    fullDescription: "Los actos del Registro Civil son fundamentales para la identidad, la familia y el patrimonio. Un error, omisión o trámite mal llevado puede generar consecuencias legales graves. En Hermosillo y Asoc., te ofrecemos gestión completa, revisión jurídica y acompañamiento total en cada etapa.",
    subServices: [
      {
        title: "Actos Civiles",
        description: "Tramitamos y regularizamos actas y asientos del Registro Civil.",
        items: ["Registro extemporáneo", "Rectificación de actas", "Inscripción de divorcio/adopción", "Actos del extranjero"]
      },
      {
        title: "Servicios Legales Complementarios",
        description: "Acompañamiento judicial y administrativo en trámites especiales.",
        items: ["Jurisdicción voluntaria", "Acompañamiento ante Juez", "Recolección nacional de actas", "Constancias de inexistencia"]
      }
    ]
  },

  {
    id: "rh_blindaje",
    title: "Recursos Humanos y Blindaje Laboral",
    modalTitle: "Recursos Humanos y Blindaje Laboral",
    description: "Estrategias preventivas, contratos y defensa patronal alineada a la productividad.",
    image: IMAGENES.assets.services.rh_blindaje,
    icon: Users,
    fullDescription: "En un entorno donde la mala gestión laboral cuesta más que prevenir, las empresas exitosas entienden que el derecho laboral preventivo es un activo. En Hermosillo y Asoc., transformamos tu departamento de Recursos Humanos en una fortaleza jurídica.",
    subServices: [
      {
        title: "Contratación Legal y Relaciones",
        description: "Documentación laboral sólida para relaciones defendibles.",
        items: ["Contratos individuales/colectivos", "Protocolos internos", "Reglamentos y manuales", "Renuncias y despidos"]
      },
      {
        title: "Blindaje Laboral Preventivo",
        description: "Prevención de riesgos laborales con compliance.",
        items: ["Diagnóstico legal de riesgos", "Estrategias anti-demanda", "Compliance laboral"]
      },
      {
        title: "Representación Legal",
        description: "Defensa estratégica ante autoridades y conflictos.",
        items: ["Conciliaciones CFCRL", "Inspecciones STPS", "Juicios laborales", "Negociaciones sindicales"]
      },
      {
        title: "Valor para Directivos",
        description: "Reducción de pasivos y respuesta proactiva.",
        items: ["Reducción de pasivos laborales", "Contrataciones seguras", "Atención a denuncias"]
      }
    ]
  },
  {
    id: "amparo",
    title: "Juicios de Amparo",
    modalTitle: "Juicios de Amparo",
    description: "Defensa constitucional contra actos de autoridad que vulneren derechos humanos.",
    image: IMAGENES.assets.services.amparo,
    icon: ShieldCheck,
    fullDescription: "El juicio de amparo es la herramienta jurídica más poderosa para proteger a las personas frente a actos arbitrarios, ilegales o inconstitucionales por parte de autoridades administrativas, fiscales, judiciales o legislativas. En Hermosillo y Asoc., ejercemos esta figura con visión estratégica.",
    subServices: [
      {
        title: "Amparo Indirecto",
        description: "Protección inmediata contra actos de autoridad fuera de juicio.",
        items: ["Contra leyes inconstitucionales", "Actos fuera de juicio", "Detenciones arbitrarias", "Cuentas congeladas"]
      },
      {
        title: "Amparo Directo",
        description: "Revisión constitucional de sentencias y laudos definitivos.",
        items: ["Contra sentencias definitivas", "Laudos laborales", "Violaciones procesales"]
      }
    ]
  },

  {
    id: "registro_publico",
    title: "Registro Público de la Propiedad",
    modalTitle: "Registro Público de la Propiedad",
    description: "Inscripción de propiedades, gravámenes y obtención de certificados con rigor técnico.",
    image: IMAGENES.assets.services.registro_publico,
    icon: Landmark,
    fullDescription: "La inscripción correcta de un acto jurídico ante el Registro Público de la Propiedad o el Archivo de Instrumentos Públicos garantiza certeza legal, publicidad, oponibilidad y protección patrimonial. En Hermosillo y Asoc., gestionamos estos trámites con visión preventiva.",
    subServices: [
      {
        title: "Registro Público de la Propiedad",
        description: "Inscripciones y regularizaciones registrales con seguimiento puntual.",
        items: ["Compraventas y transmisiones", "Cancelación de gravámenes", "Inscripción de embargos", "Condominios y fideicomisos"]
      },
      {
        title: "Archivo de Instrumentos Públicos",
        description: "Obtención de antecedentes, legalizaciones y certificaciones.",
        items: ["Registro de poderes", "Legalización de documentos", "Búsqueda de antecedentes", "Copias certificadas"]
      }
    ]
  },
  {
    id: "ayuntamiento",
    title: "Licencias y Permisos Ayuntamiento",
    modalTitle: "Gestoría Municipal",
    description: "Gestión y defensa de trámites municipales para operar en regla.",
    image: IMAGENES.assets.services.ayuntamiento,
    icon: Store,
    fullDescription: "En Hermosillo y Asoc., entendemos que un negocio mal regularizado es un negocio en riesgo. Nos especializamos en gestionar y defender trámites ante autoridades municipales, asegurando que nuestros clientes operen bajo el marco legal y con la tranquilidad de que todo está en regla.",
    subServices: [
      {
        title: "Licencias y Permisos",
        description: "Tramitamos licencias y autorizaciones municipales con entrega ágil.",
        items: ["Licencia municipal", "Uso de suelo comercial", "Anuncios y toldos", "Licencias de construcción"]
      },
      {
        title: "Regularización y Defensa",
        description: "Defensa ante clausuras, inspecciones y sanciones municipales.",
        items: ["Solventación de clausuras", "Atención a inspecciones", "Defensa ante multas", "Regularización de negocios"]
      }
    ]
  },
  {
    id: "movilidad",
    title: "Secretaría de Movilidad",
    modalTitle: "Trámites Vehiculares y Movilidad",
    description: "Trámites vehiculares, flotillas y permisos de transporte con exactitud legal.",
    image: IMAGENES.assets.services.movilidad,
    icon: Car,
    fullDescription: "Los trámites ante la Secretaría de Movilidad no solo son engorrosos, sino que pueden volverse un problema legal o administrativo si no se realizan correctamente. En Hermosillo y Asoc., gestionamos tus asuntos de movilidad con exactitud legal, seguimiento puntual y experiencia operativa.",
    subServices: [
      {
        title: "Personas Físicas y Morales",
        description: "Altas, bajas, reemplazamientos y regularizaciones ante SEMOV.",
        items: ["Alta/Baja de vehículos/flotillas", "Reemplazamientos", "Regularización de adeudos", "Tarjetas de circulación", "Placas para empresas"]
      }
    ]
  },

  {
    id: "comercio_exterior",
    title: "Comercio Exterior y Aduanas",
    modalTitle: "Comercio Exterior y Aduanas",
    description: "Asesoría aduanera, importación/exportación y litigio especializado.",
    image: IMAGENES.assets.services.comercio_exterior,
    icon: Ship,
    fullDescription: "El comercio internacional no solo implica logística: implica regulación, cumplimiento normativo, tratados internacionales y defensa legal en frontera. En Hermosillo y Asoc., gestionamos tus operaciones con un enfoque 360° que garantiza agilidad operativa, seguridad jurídica y protección fiscal.",
    subServices: [
      {
        title: "Servicios en Principales Aduanas",
        description: "Asesoría, clasificación y despacho en aduanas.",
        items: ["Clasificación arancelaria", "Despacho marítimo y aéreo", "Importación Definitiva", "Depósito Fiscal"]
      },
      {
        title: "Comercializadora",
        description: "Proyecto de importación, PEO y cumplimiento.",
        items: ["Proyecto de importación", "Previo en Origen (PEO)", "Renta de padrón", "Cumplimiento NOMs/Etiquetado"]
      },
      {
        title: "Logística",
        description: "Fletes internacionales y nacionales.",
        items: ["Fletes Marítimos (Door to Door)", "Fletes Nacionales Sencillo/Full", "Unidades con ingreso a aduana"]
      }
    ]
  },
  {
    id: "marca",
    title: "Registro de Marca y Propiedad Intelectual",
    modalTitle: "Propiedad Intelectual",
    description: "Protección de identidad corporativa ante el IMPI.",
    image: IMAGENES.assets.services.marca,
    icon: BadgeCheck,
    fullDescription: "En Hermosillo y Asociados sabemos que una marca registrada no es un gasto, es una inversión estratégica. No dejes tu futuro en manos del azar: protege lo que te distingue, capitaliza tu creatividad y consolida tu presencia en el mercado.",
    subServices: [
      {
        title: "Tu Activo Más Poderoso",
        description: "Protege lo que te distingue y consolida tu presencia.",
        items: ["Búsqueda de viabilidad", "Solicitud ante IMPI", "Atención a requerimientos", "Obtención de título", "Vigilancia y renovación"]
      }
    ]
  }
];

const WhatsAppIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// El brillo de scroll y la inclinación del cursor usan capas independientes.
const ServiceCard: React.FC<{ service: ServiceData; index: number; onOpen: () => void }> = ({ service, index, onOpen }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    // Un solo cálculo por fotograma, no uno por evento del mouse
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / r.width;
      const y = (clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
      el.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
      el.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
    });
  };

  const handleLeave = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  const subCount = service.subServices?.length ?? 0;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerCancel={handleLeave}
      aria-haspopup="dialog"
      aria-label={`Explorar ${service.title}`}
      className="pt-card group"
    >
      {/* Marco platino metálico */}
      <span className="pt-frame" aria-hidden="true" />

      <span className="pt-card__surface">
        <img
          src={service.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="pt-card__image"
        />
        <span className="pt-card__shade" aria-hidden="true" />
        <span className="pt-spectrum" aria-hidden="true" />
        <span className="pt-light-band" aria-hidden="true" />
        {/* Textura de metal cepillado */}
        <span className="pt-brushed absolute inset-0 pointer-events-none" aria-hidden="true" />
        {/* Brillo platino que sigue al cursor */}
        <span className="pt-sheen absolute inset-0 pointer-events-none" aria-hidden="true" />

        <span className="pt-card__content">
          <span className="flex items-start justify-between">
            <span className="pt-text font-mono text-xs tracking-[0.3em]">{String(index + 1).padStart(2, '0')}</span>
            <span className="pt-card__icon">
              <service.icon className="w-5 h-5 text-white/90" strokeWidth={1.6} aria-hidden="true" />
            </span>
          </span>

          <span className="pt-card__copy">
            <span className="block h-px w-10 mb-4 pt-line transition-all duration-500 group-hover:w-20" />
            <span className="pt-card__title pt-text font-serif">{service.title}</span>
            <span className="pt-card__description">
              {service.description}
            </span>
            <span className="pt-card__footer font-mono">
              <span>{subCount} {subCount === 1 ? 'línea' : 'líneas'} de servicio</span>
              <span className="pt-card__explore">
                Explorar
                <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </span>
          </span>
        </span>
      </span>
    </button>
  );
};

const ServiceModal: React.FC<{ service: ServiceData; onClose: () => void }> = ({ service, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6 md:p-6" role="dialog" aria-modal="true" aria-label={service.modalTitle}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />

      <div className="pt-modal-frame relative w-full max-w-6xl max-h-[88dvh] rounded-3xl p-[1.5px] svc-pop">
        <div className="relative flex flex-col md:flex-row w-full max-h-[calc(88dvh-3px)] overflow-hidden rounded-[22px] bg-[#09090b]">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors backdrop-blur-sm border border-white/15"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full md:w-1/3 relative h-44 md:h-auto shrink-0 overflow-hidden bg-neutral-900">
            <img src={service.image} alt="" className="w-full h-full object-cover opacity-60 grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="pt-brushed absolute inset-0 pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 pr-6">
              <div className="h-px w-14 mb-5 pt-line" />
              <div className="mb-4 w-12 h-12 rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <service.icon className="w-6 h-6 text-white" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="pt-text text-xl md:text-2xl lg:text-3xl font-serif font-bold leading-[1.05] tracking-tight uppercase">
                {service.modalTitle}
              </h3>
            </div>
          </div>

          <div className="w-full md:w-2/3 p-6 md:p-10 overflow-y-auto scrollbar-hide">
            <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light border-l border-white/20 pl-4 mb-8 pr-10">
              {service.fullDescription || service.description}
            </p>

            {service.subServices && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.subServices.map((sub) => (
                  <div key={sub.title} className="pt-subcard group/card relative rounded-xl p-6 flex flex-col h-full border border-white/10 bg-[#111113] transition-all duration-500 hover:border-white/40">
                    <h4 className="pt-text font-bold text-lg leading-tight mb-2">{sub.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{sub.description}</p>
                    <ul className="space-y-2 mt-auto border-t border-white/10 pt-4">
                      {sub.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rotate-45 bg-gradient-to-br from-white to-gray-500 shrink-0" />
                          <span className="text-xs text-gray-300 font-light leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <a
                href={`https://wa.me/${WHATSAPP_URLS.general}?text=${encodeURIComponent(`Hola, me interesa información sobre ${service.title}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-7 py-3 rounded-full border border-green-600 text-green-500 font-bold uppercase tracking-widest text-xs hover:bg-green-600 hover:text-white hover:shadow-[0_0_20px_#22c55e] transition-all duration-300"
              >
                <WhatsAppIcon />
                Solicitar Asesoría
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const close = useCallback(() => setSelectedService(null), []);
  const cascadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root: HTMLDivElement | null = cascadeRef.current;
    if (!root) return;

    const media = gsap.matchMedia();
    media.add({
      compact: '(max-width: 899px)',
      desktop: '(min-width: 900px)',
      reducedMotion: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      if (context.conditions?.reducedMotion) return;
      const compact = Boolean(context.conditions?.compact);
      const progress = root.querySelector<HTMLElement>('.service-cascade__progress');
      if (!progress) return;

      gsap.fromTo(progress, { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top 72%', end: 'bottom 72%', scrub: 0.6 },
      });

      root.querySelectorAll<HTMLElement>('.service-step').forEach((step, index) => {
        const panel = step.querySelector<HTMLElement>('.service-reveal');
        const card = step.querySelector<HTMLElement>('.pt-card');
        const spectrum = step.querySelector<HTMLElement>('.pt-spectrum');
        const band = step.querySelector<HTMLElement>('.pt-light-band');
        const node = step.querySelector<HTMLElement>('.service-step__node');
        const link = step.querySelector<HTMLElement>('.service-step__link');
        if (!panel || !card || !spectrum || !band || !node || !link) return;
        const direction = index % 2 === 0 ? -1 : 1;

        // Una secuencia por escalón: responde al scroll en ambos sentidos.
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: step,
            start: 'top 88%',
            end: 'bottom 22%',
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .fromTo(panel,
            { opacity: 0.38, x: direction * (compact ? 12 : 56), y: compact ? 36 : 72, scale: 0.94 },
            { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.48, ease: 'power2.out' }, 0)
          .fromTo(link, { scaleX: 0, opacity: 0.15 }, { scaleX: 1, opacity: 1, duration: 0.4 }, 0)
          .fromTo(node, { '--node-light': 0.15, scale: 0.75 }, { '--node-light': 1, scale: 1, duration: 0.38 }, 0.06)
          .fromTo(card, { '--scroll-light': 0 }, { '--scroll-light': 1, duration: 0.4, ease: 'sine.out' }, 0.06)
          .fromTo(spectrum,
            { opacity: 0, scale: 0.82, xPercent: direction * 12, yPercent: -14 },
            { opacity: 1, scale: 1, xPercent: 0, yPercent: 8, duration: 0.5, ease: 'sine.out' }, 0.1)
          .fromTo(band,
            { xPercent: -direction * 200, opacity: 0 },
            { xPercent: direction * 200, opacity: 1, duration: 0.75 }, 0.06)
          .to(band, { opacity: 0, duration: 0.12 }, 0.8)
          .to(card, { '--scroll-light': 0.32, duration: 0.24 }, 0.76)
          .to(spectrum, { opacity: 0.22, duration: 0.24 }, 0.76);
      });
    }, root);

    return () => media.revert();
  }, []);

  return (
    <section id="servicios" className="services-section bg-transparent relative overflow-hidden border-t border-white/5">
      <SectionLight side="center" />
      <SectionFigure variant="book" className="-right-24 -top-8 hidden h-[24rem] w-[24rem] opacity-40 md:block" />
      <div className="services-container relative z-10">
        <div className="services-heading text-center">
          <p className="services-eyebrow font-mono">Nuestra práctica jurídica</p>
          <h2 className="services-title font-serif text-white">Áreas de Especialización</h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto font-light leading-relaxed text-base md:text-lg">
            Excelencia jurídica aplicada. Soluciones diseñadas para brindar certeza, protección y estrategia en cada aspecto de tu vida y empresa.
          </p>
        </div>

        <div ref={cascadeRef} className="service-cascade">
          <div className="service-cascade__rail" aria-hidden="true">
            <span className="service-cascade__progress" />
          </div>
          {allServices.map((service, index) => (
            <div
              key={service.id}
              className="service-step"
              data-side={index % 2 === 0 ? 'left' : 'right'}
            >
              <span className="service-step__link" aria-hidden="true" />
              <span className="service-step__node" aria-hidden="true" />
              <div className="service-reveal">
                <ServiceCard service={service} index={index} onOpen={() => setSelectedService(service)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* En body: así el modal queda por encima de la barra de navegación y no dentro de la sección */}
      {selectedService && createPortal(<ServiceModal service={selectedService} onClose={close} />, document.body)}
    </section>
  );
};

export default Services;
