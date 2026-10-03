// ============================================================================
// ARCHIVO DE CONTROL DE IMÁGENES Y DATOS (imagenes_url.ts)
// ============================================================================
// INSTRUCCIONES:
// 1. Busca la sección que quieras editar (Ej: HERO, EQUIPO, SERVICIOS).
// 2. Reemplaza el texto entre comillas "https://..." con el link de tu imagen nueva.
// 3. Para archivos locales, conserva new URL con una ruta literal e import.meta.url.
//    Esto permite que Vite incluya las imagenes al compilar.
// 4. Guarda el archivo para aplicar los cambios.
// ============================================================================

export const IMAGENES = {
  // --- DATOS DE CONTACTO (Footer, Contacto y Mapa) ---
  contacto: {
    telefono_visible: "+52 33 2384 1469", // Como se ve en la pantalla
    email: "contacto@hermosilloyasoc.com",
    direccion: {
      linea1: "San Uriel 690, Chapalita",
      linea2: "44500 Guadalajara, Jalisco, MX",
      // Link de Google Maps para el iframe del mapa
      googleMapsLink: "https://maps.google.com/maps?q=San%20Uriel%20690%2C%20Chapalita%2C%2044500%20Guadalajara%2C%20Jal.&t=m&z=15&ie=UTF8&iwloc=&output=embed"
    }
  },

  // --- ICONOS (NUEVA SECCIÓN CENTRALIZADA) ---
  icons: {
    contact: {
      location: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
      phone: "https://cdn-icons-png.flaticon.com/512/159/159832.png",
      email: "https://cdn-icons-png.flaticon.com/512/542/542638.png"
    }
  },

  // --- IMÁGENES DEL SITIO WEB ---
  assets: {
    // 1. LOGOTIPOS
    logos: {
      navbar: new URL("./components/media/images/HA-BW.ico", import.meta.url).href,
      footer: new URL("./components/media/images/HA-BW.ico", import.meta.url).href
    },

    // 2. SECCIÓN INICIO (HERO LEGAL)
    hero: {
      mainImage: new URL("./components/media/images/LaJusticia.png", import.meta.url).href,
      videoBackground: "/media/video/0114.mp4", // VIDEO MOVEMOS A PUBLIC
      videoBackgroundWebm: "/media/video/0114.webm",
      videoPoster: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2070&auto=format&fit=crop" // Imagen que se ve mientras carga el video
    },

    // 3. SECCIÓN QUIÉNES SOMOS (LEGAL)
    about: {
      mainImage: new URL("./components/media/images/FOTOHERMOSILLO2.webp", import.meta.url).href
    },

    // 4. FONDOS GENERALES
    contactSection: {
      backgroundImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=50&w=1000&auto=format&fit=crop"
    },

    // 5. SERVICIOS LEGALES
    services: {
      notaria: new URL("./components/media/images/CATEGORIAS/opt/TRÁMITES ANTE NOTARÍA Y CORREDURÍA PÚBLICA.webp", import.meta.url).href,
      civil: new URL("./components/media/images/CATEGORIAS/opt/JUICIO CIVIL · FAMILIAR · MERCANTIL.webp", import.meta.url).href,
      ija: new URL("./components/media/images/CATEGORIAS/opt/CONVENIOS DE VALIDACIÓN ANTE EL IJA_11.webp", import.meta.url).href,
      registro_civil: new URL("./components/media/images/CATEGORIAS/opt/REGISTRO CIVIL.webp", import.meta.url).href,
      amparo: new URL("./components/media/images/CATEGORIAS/opt/JUICIOS DE AMPARO.webp", import.meta.url).href,
      registro_publico: new URL("./components/media/images/CATEGORIAS/opt/REGISTRO PÚBLICO DE LA PROPIEDAD.webp", import.meta.url).href,
      rh_blindaje: new URL("./components/media/images/CATEGORIAS/opt/RECURSOS HUMANOS Y BLINDAJE LABORAL.webp", import.meta.url).href,
      ayuntamiento: new URL("./components/media/images/CATEGORIAS/opt/LICENCIAS Y PERMISOS AYUNTAMIENTO.webp", import.meta.url).href,
      movilidad: new URL("./components/media/images/CATEGORIAS/opt/SECRETARÍA DE MOVILIDAD.webp", import.meta.url).href,
      comercio_exterior: new URL("./components/media/images/CATEGORIAS/opt/ADUANAS.webp", import.meta.url).href,
      marca: new URL("./components/media/images/CATEGORIAS/opt/REGISTRO DE MARCA Y PROPIEDAD INTELECTUAL.webp", import.meta.url).href
    },


    // 6. EQUIPO LEGAL
    team: {
      carlos_frente: new URL("./components/media/images/members/img1.webp", import.meta.url).href,
      carlos_atras: new URL("./components/media/images/members/img1.webp", import.meta.url).href,
      senen_frente: new URL("./components/media/images/members/lic_senen.webp", import.meta.url).href,
      senen_atras: new URL("./components/media/images/members/lic_senen.webp", import.meta.url).href,
      alejandro_frente: new URL("./components/media/images/members/lic_antonio.webp", import.meta.url).href,
      alejandro_atras: new URL("./components/media/images/members/lic_antonio.webp", import.meta.url).href,
      jose_luis_frente: new URL("./components/media/images/members/lic_joseluis.webp", import.meta.url).href,
      jose_luis_atras: new URL("./components/media/images/members/lic_joseluis.webp", import.meta.url).href,
      ximena_frente: new URL("./components/media/images/members/lic_ximena.webp", import.meta.url).href,
      ximena_atras: new URL("./components/media/images/members/lic_ximena.webp", import.meta.url).href,
      yanci_frente: new URL("./components/media/images/members/lic_yanci.webp", import.meta.url).href,
      yanci_atras: new URL("./components/media/images/members/lic_yanci.webp", import.meta.url).href,
      // Reemplaza estas rutas cuando subas la fotografia de Jesus Godinez
      jesus_frente: new URL("./components/media/images/members/lic_jesus.webp", import.meta.url).href,
      jesus_atras: new URL("./components/media/images/members/lic_jesus.webp", import.meta.url).href,
      // Rutas listas para las nuevas tarjetas de derecho inmobiliario
      sarah_frente: new URL("./components/media/images/members/lic_sarah.webp", import.meta.url).href,
      sarah_atras: new URL("./components/media/images/members/lic_sarah.webp", import.meta.url).href,
      fabricio_frente: new URL("./components/media/images/members/lic_fabricio.webp", import.meta.url).href,
      fabricio_atras: new URL("./components/media/images/members/lic_fabricio.webp", import.meta.url).href
    },

    // 7. INSTALACIONES (Imágenes de ejemplo actualizadas)
    facilities: [
      { id: 1, title: "Recepción", phrase: "Excelencia desde el primer paso.", image: new URL("./components/media/instalaciones/1.jpeg", import.meta.url).href },
      { id: 2, title: "Sala de Juntas", phrase: "Estrategia y Decisión.", image: new URL("./components/media/instalaciones/juntas-opt.webp", import.meta.url).href },
      { id: 3, title: "Oficinas", phrase: "Privacidad Absoluta.", image: new URL("./components/media/instalaciones/4.jpeg", import.meta.url).href },
      { id: 4, title: "Sala de Espera", phrase: "Confort y Serenidad.", image: new URL("./components/media/instalaciones/espera-opt.webp", import.meta.url).href },
      { id: 5, title: "Edificio", phrase: "Infraestructura de vanguardia.", image: new URL("./components/media/instalaciones/edificio.webp", import.meta.url).href }
    ]
  }
};
