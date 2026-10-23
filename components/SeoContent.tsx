import React from 'react';
import Reveal from './Reveal';
import { WHATSAPP_URLS } from '../whatsapp_urls';

const SeoContent: React.FC = () => {
  return (
    <section id="abogados-guadalajara" className="py-20 bg-transparent border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal direction="up" width="100%" className="mb-10 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            Abogados en Guadalajara con enfoque estrategico
          </h2>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
            En Hermosillo y Asociados asesoramos a empresas y particulares en Guadalajara y Jalisco. Atendemos
            asuntos de derecho corporativo, notaria, litigio civil, amparo, laboral, registro de marca y tramites
            administrativos con seguimiento claro y puntual.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Reveal direction="right" width="100%">
            <a
              href="/abogados-guadalajara/"
              className="group block h-full p-6 rounded-sm border border-white/10 bg-black/40 hover:border-white/30 transition-all"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-platinum-400 mb-2">Guia local</p>
              <h3 className="font-serif text-2xl text-white mb-2">Servicios legales en Guadalajara</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Conoce nuestras areas principales y como elegir una estrategia legal para tu caso.
              </p>
            </a>
          </Reveal>

          <Reveal direction="left" delay={0.08} width="100%">
            <a
              href="/hermosillo-y-asociados/"
              className="group block h-full p-6 rounded-sm border border-white/10 bg-black/40 hover:border-white/30 transition-all"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-platinum-400 mb-2">Marca del despacho</p>
              <h3 className="font-serif text-2xl text-white mb-2">Hermosillo y Asociados</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Informacion del despacho, ubicacion, horario de atencion y canales directos de contacto.
              </p>
            </a>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.1} width="100%">
          <div className="rounded-sm border border-white/10 bg-black/40 p-6 md:p-8">
          <h3 className="font-serif text-2xl text-white mb-6">Preguntas frecuentes</h3>
          <div className="space-y-4 text-gray-300">
            <details className="border border-white/10 rounded-sm p-4">
              <summary className="cursor-pointer font-medium text-white">
                ¿Qué tipo de asuntos atienden como abogados en Guadalajara?
              </summary>
              <p className="mt-3 text-sm leading-relaxed">
                Atendemos derecho corporativo, notaria, litigio civil, amparo, recursos humanos y blindaje laboral,
                propiedad intelectual y gestoria ante dependencias locales.
              </p>
            </details>

            <details className="border border-white/10 rounded-sm p-4">
              <summary className="cursor-pointer font-medium text-white">
                ¿Cómo puedo agendar una consulta con Hermosillo y Asociados?
              </summary>
              <p className="mt-3 text-sm leading-relaxed">
                Puedes agendar por WhatsApp, correo o formulario web. La primera llamada sirve para entender el caso
                y definir la ruta legal.
              </p>
            </details>

            <details className="border border-white/10 rounded-sm p-4">
              <summary className="cursor-pointer font-medium text-white">
                ¿Dónde se ubica el despacho?
              </summary>
              <p className="mt-3 text-sm leading-relaxed">
                Estamos en San Uriel 690, Chapalita, Guadalajara, Jalisco. Atendemos presencial y virtual.
              </p>
            </details>
          </div>

          <div className="mt-8">
            <a
              href={`https://wa.me/${WHATSAPP_URLS.general}?text=Hola, necesito asesoria legal en Guadalajara.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-7 py-3 rounded-sm border border-white/20 text-white hover:bg-white hover:text-black transition-colors"
            >
              Solicitar asesoria legal
            </a>
          </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SeoContent;
