
import React, { useState } from 'react';
import Reveal from './Reveal';
import { IMAGENES } from '../imagenes_url';
import { WHATSAPP_URLS } from '../whatsapp_urls';

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
  icon: string;
  className?: string; // Controla el ancho (col-span)
  fullDescription?: string;
  subServices?: SubService[];
}

// DATOS ORDENADOS PARA GRID DE 3 COLUMNAS SIN ESPACIOS (Total spans = 15)
// FILA 1: Wide + Small (3)
// FILA 2: Wide + Small (3)
// FILA 3: Wide + Small (3)
// FILA 4: Small + Small + Small (3)
// FILA 5: Wide + Small (3)

const allServices: ServiceData[] = [
  // --- FILA 1 ---
  {
    id: "notaria",
    title: "Trámites Ante Notaría y Correduría Pública",
    modalTitle: "Trámites Ante Notaría y Correduría Pública",
    description: "Gestión experta de escrituras, poderes, certificaciones y fe pública para actos comerciales.",
    image: IMAGENES.assets.services.notaria,
    icon: IMAGENES.icons.services.notaria,
    className: "md:col-span-2", // ANCHA
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
    icon: IMAGENES.icons.services.civil,
    className: "md:col-span-1", // PEQUEÑA
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

  // --- FILA 2 ---
  {
    id: "ija",
    title: "Convenios de Validación ante el IJA",
    modalTitle: "Justicia Alternativa (IJA)",
    description: "Métodos alternos de solución de conflictos, gestión inmobiliaria y cobranza profesional.",
    image: IMAGENES.assets.services.ija,
    icon: IMAGENES.icons.services.ija,
    className: "md:col-span-2", // ANCHA
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
    icon: IMAGENES.icons.services.registro_civil,
    className: "md:col-span-1", // PEQUEÑA
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

  // --- FILA 3 ---
  {
    id: "rh_blindaje",
    title: "Recursos Humanos y Blindaje Laboral",
    modalTitle: "Recursos Humanos y Blindaje Laboral",
    description: "Estrategias preventivas, contratos y defensa patronal alineada a la productividad.",
    image: IMAGENES.assets.services.rh_blindaje,
    icon: IMAGENES.icons.services.rh_blindaje,
    className: "md:col-span-2", // ANCHA
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
    icon: IMAGENES.icons.services.amparo,
    className: "md:col-span-1", // PEQUEÑA
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

  // --- FILA 4 (3 Pequeñas) ---
  {
    id: "registro_publico",
    title: "Registro Público de la Propiedad",
    modalTitle: "Registro Público de la Propiedad",
    description: "Inscripción de propiedades, gravámenes y obtención de certificados con rigor técnico.",
    image: IMAGENES.assets.services.registro_publico,
    icon: IMAGENES.icons.services.registro_publico,
    className: "md:col-span-1", // PEQUEÑA
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
    icon: IMAGENES.icons.services.ayuntamiento,
    className: "md:col-span-1", // PEQUEÑA
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
    icon: IMAGENES.icons.services.movilidad,
    className: "md:col-span-1", // PEQUEÑA
    fullDescription: "Los trámites ante la Secretaría de Movilidad no solo son engorrosos, sino que pueden volverse un problema legal o administrativo si no se realizan correctamente. En Hermosillo y Asoc., gestionamos tus asuntos de movilidad con exactitud legal, seguimiento puntual y experiencia operativa.",
    subServices: [
      {
        title: "Personas Físicas y Morales",
        description: "Altas, bajas, reemplazamientos y regularizaciones ante SEMOV.",
        items: ["Alta/Baja de vehículos/flotillas", "Reemplazamientos", "Regularización de adeudos", "Tarjetas de circulación", "Placas para empresas"]
      }
    ]
  },

  // --- FILA 5 ---
  {
    id: "comercio_exterior",
    title: "Comercio Exterior y Aduanas",
    modalTitle: "Comercio Exterior y Aduanas",
    description: "Asesoría aduanera, importación/exportación y litigio especializado.",
    image: IMAGENES.assets.services.comercio_exterior,
    icon: IMAGENES.icons.services.comercio_exterior,
    className: "md:col-span-2", // ANCHA
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
    icon: IMAGENES.icons.services.marca,
    className: "md:col-span-1", // PEQUEÑA
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

const serviceRevealDirections = [
  "right",
  "left",
  "right",
  "left",
  "right",
  "left",
  "right",
  "up",
  "left",
  "right",
  "left"
] as const;

const ServiceCard: React.FC<{ service: ServiceData; onSelect: (service: ServiceData) => void }> = React.memo(({ service, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(service)}
      className="group relative h-full min-h-[340px] w-full rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-[#050505] transition-all duration-500 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:-translate-y-1"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 grayscale opacity-40 group-hover:opacity-60"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>

        {/* Scanline Effect (Subtle) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">

        {/* Text Content */}
        <div className="transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-[1px] bg-blue-500 group-hover:w-12 transition-all duration-500 shadow-[0_0_8px_#3b82f6]"></div>
            <span className="text-[10px] uppercase tracking-widest text-blue-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Servicio Legal</span>
          </div>

          <h3 className="text-lg md:text-xl font-serif text-white font-bold leading-tight mb-3 drop-shadow-md group-hover:text-white transition-colors uppercase">
            {service.title}
          </h3>

          <p className="text-gray-400 text-[11px] md:text-xs font-light leading-relaxed line-clamp-3 group-hover:text-gray-300 transition-colors border-l border-white/10 pl-4">
            {service.description}
          </p>
        </div>

        {/* Hover "Ver Más" Indicator */}
        <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
          Ver Detalles
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
});

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);

  return (
    <section id="servicios" className="py-24 bg-transparent relative border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6">

        <Reveal direction="up" width="100%">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Áreas de Especialización</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-2xl mx-auto font-light leading-relaxed text-base md:text-lg">
              Excelencia jurídica aplicada. Soluciones diseñadas para brindar certeza, protección y estrategia en cada aspecto de tu vida y empresa.
            </p>
          </div>
        </Reveal>

        {/* --- REORGANIZED BENTO GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr grid-flow-dense">
          {allServices.map((service, index) => (
            <Reveal
              key={service.id}
              width="100%"
              direction={serviceRevealDirections[index] ?? "up"}
              delay={(index % 3) * 0.08}
              blur={false}
              className={`h-full ${service.className || 'md:col-span-1'}`}
            >
              <ServiceCard service={service} onSelect={setSelectedService} />
            </Reveal>
          ))}
        </div>

      </div>

      {/* --- SERVICE MODAL (REDSEÑADO EXACTO) --- */}
      {selectedService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95" onClick={() => setSelectedService(null)}></div>

          {/* MODAL CONTAINER */}
          <div className="relative bg-[#080808] border border-white/10 w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row animate-[float_0.3s_ease-out]">

            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors backdrop-blur-sm border border-white/10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* === LEFT COLUMN: HERO IMAGE & BIG TITLE (AS PER IMAGE) === */}
            <div className="w-full md:w-1/3 relative h-48 md:h-auto bg-neutral-900 overflow-hidden">
              <img
                src={selectedService.image}
                alt={selectedService.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-60 grayscale mix-blend-overlay"
              />
              {/* Decorative Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

              {/* Title at Bottom Left with Icon */}
              <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 pr-6">
                <div className="w-12 h-1 bg-blue-500 mb-6 shadow-[0_0_10px_#3b82f6]"></div>
                <div className="mb-4 w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <img src={selectedService.icon} alt="Icon" className="w-6 h-6 filter brightness-0 invert" />
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-serif text-white font-bold leading-[0.95] tracking-tight uppercase">
                  {selectedService.modalTitle}
                </h3>
              </div>
            </div>

            {/* === RIGHT COLUMN: CONTENT DASHBOARD (AS PER IMAGE) === */}
            <div className="w-full md:w-2/3 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a] scrollbar-hide">

              {/* HEADER SECTION */}
              <div className="mb-10">
                {/* BADGE DESTACADOS (AZUL CON CORONA AMARILLA/DORADA BRILLANTE) */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/30 border border-blue-500/50 rounded mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  {/* Crown Icon (Yellow/Amber - Glowing) */}
                  <svg className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,1)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                  </svg>
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest text-shadow-blue">Destacados</span>
                </div>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light border-l-2 border-white/10 pl-4">
                  {selectedService.fullDescription || selectedService.description}
                </p>
              </div>

              {/* CARDS GRID (ACTUALIZADO: BRILLO PLATINO Y TEXTO MÁS GRANDE) */}
              {selectedService.subServices && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {selectedService.subServices.map((sub, idx) => (
                    <div key={idx} className="group/card bg-[#111] p-6 md:p-8 rounded-xl border border-white/5 transition-all duration-500 flex flex-col h-full hover:border-gray-300/40 hover:shadow-[0_0_30px_rgba(226,232,240,0.15)] hover:bg-[#161616]">

                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg md:text-xl leading-tight mb-2 group-hover/card:text-gray-100 transition-colors">
                            {sub.title}
                          </h4>
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{sub.description}</p>
                        </div>
                      </div>

                      {/* Items List */}
                      <ul className="space-y-2 mt-auto border-t border-white/5 pt-4">
                        {sub.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 opacity-70 group-hover/card:bg-blue-400"></span>
                            <span className="text-xs text-gray-300 font-light leading-snug group-hover/card:text-gray-200">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* FOOTER CTA (ACTUALIZADO: VERDE EXACTO DE LA IMAGEN) */}
              <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-end">
                <a
                  href={`https://wa.me/${WHATSAPP_URLS.general}?text=Hola, me interesa información sobre ${selectedService.title}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative px-8 py-3 bg-transparent border border-green-600 text-green-500 font-bold uppercase tracking-widest text-xs rounded hover:bg-green-600 hover:text-white hover:shadow-[0_0_20px_#22c55e] transition-all duration-300 flex items-center gap-3 overflow-hidden"
                >
                  <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span className="relative z-10">Solicitar Asesoría</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default Services;
