// ============================================================================
// ARCHIVO DE CONTROL DE IMÁGENES Y DATOS (imagenes_url.ts)
// ============================================================================
// INSTRUCCIONES:
// 1. Busca la sección que quieras editar (Ej: HERO, EQUIPO, SERVICIOS).
// 2. Reemplaza el texto entre comillas "https://..." con el link de tu imagen nueva.
// 3. Guarda el archivo y los cambios se verán en toda la página web.
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
    services: {
      notaria: "https://cdn-icons-png.flaticon.com/512/5968/5968535.png",
      civil: "https://cdn-icons-png.flaticon.com/512/2636/2636250.png",
      ija: "https://cdn-icons-png.flaticon.com/512/5968/5968506.png",
      registro_civil: "https://cdn-icons-png.flaticon.com/512/5968/5968525.png",
      amparo: "https://cdn-icons-png.flaticon.com/512/5968/5968284.png",
      registro_publico: "https://cdn-icons-png.flaticon.com/512/5968/5968305.png",
      rh_blindaje: "https://cdn-icons-png.flaticon.com/512/476/476863.png",
      ayuntamiento: "https://cdn-icons-png.flaticon.com/512/1018/1018513.png",
      movilidad: "https://cdn-icons-png.flaticon.com/512/741/741407.png",
      comercio_exterior: "https://cdn-icons-png.flaticon.com/512/751/751663.png",
      marca: "https://cdn-icons-png.flaticon.com/512/5968/5968430.png"
    },
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
      navbar: "/components/media/images/HA-BW.ico",
      footer: "/components/media/images/HA-BW.ico"
    },

    // 2. SECCIÓN INICIO (HERO LEGAL)
    hero: {
      mainImage: "/components/media/images/LaJusticia.png",
      videoBackground: "/media/video/0114.mp4", // VIDEO MOVEMOS A PUBLIC
      videoBackgroundWebm: "/media/video/0114.webm",
      videoPoster: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2070&auto=format&fit=crop" // Imagen que se ve mientras carga el video
    },

    // 3. SECCIÓN QUIÉNES SOMOS (LEGAL)
    about: {
      mainImage: "/components/media/images/FOTOHERMOSILLO2.png"
    },

    // 4. FONDOS GENERALES
    contactSection: {
      backgroundImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=50&w=1000&auto=format&fit=crop"
    },

    // 5. SERVICIOS LEGALES
    services: {
      notaria: "/components/media/images/CATEGORIAS/TRÁMITES ANTE NOTARÍA Y CORREDURÍA PÚBLICA.webp",
      civil: "/components/media/images/CATEGORIAS/JUICIO CIVIL · FAMILIAR · MERCANTIL.webp",
      ija: "/components/media/images/CATEGORIAS/CONVENIOS DE VALIDACIÓN ANTE EL IJA_11.webp",
      registro_civil: "/components/media/images/CATEGORIAS/REGISTRO CIVIL.webp",
      amparo: "/components/media/images/CATEGORIAS/JUICIOS DE AMPARO.webp",
      registro_publico: "/components/media/images/CATEGORIAS/REGISTRO PÚBLICO DE LA PROPIEDAD.webp",
      rh_blindaje: "/components/media/images/CATEGORIAS/RECURSOS HUMANOS Y BLINDAJE LABORAL.webp",
      ayuntamiento: "/components/media/images/CATEGORIAS/LICENCIAS Y PERMISOS AYUNTAMIENTO.webp",
      movilidad: "/components/media/images/CATEGORIAS/SECRETARÍA DE MOVILIDAD.webp",
      comercio_exterior: "/components/media/images/CATEGORIAS/ADUANAS.webp",
      marca: "/components/media/images/CATEGORIAS/REGISTRO DE MARCA Y PROPIEDAD INTELECTUAL.webp"
    },


    // 6. EQUIPO LEGAL
    team: {
      carlos_frente: "/components/media/images/members/img1.webp",
      carlos_atras: "/components/media/images/members/img1.webp",
      senen_frente: "/components/media/images/members/lic_senen.webp",
      senen_atras: "/components/media/images/members/lic_senen.webp",
      alejandro_frente: "/components/media/images/members/lic_antonio.webp",
      alejandro_atras: "/components/media/images/members/lic_antonio.webp",
      jose_luis_frente: "/components/media/images/members/lic_joseluis.webp",
      jose_luis_atras: "/components/media/images/members/lic_joseluis.webp",
      ximena_frente: "/components/media/images/members/lic_ximena.png",
      ximena_atras: "/components/media/images/members/lic_ximena.png",
      yanci_frente: "/components/media/images/members/lic_yanci.png",
      yanci_atras: "/components/media/images/members/lic_yanci.png",
      // Reemplaza estas rutas cuando subas la fotografia de Jesus Godinez
      jesus_frente: "/components/media/images/members/lic_jesus.jpeg",
      jesus_atras: "/components/media/images/members/lic_jesus.jpeg",
      // Rutas listas para las nuevas tarjetas de derecho inmobiliario
      sarah_frente: "/components/media/images/members/lic_sarah.jpg",
      sarah_atras: "/components/media/images/members/lic_sarah.jpg",
      fabricio_frente: "/components/media/images/members/lic_fabricio.jpg",
      fabricio_atras: "/components/media/images/members/lic_fabricio.jpg"
    },

    // 7. INSTALACIONES (Imágenes de ejemplo actualizadas)
    facilities: [
      { id: 1, title: "Recepción", phrase: "Excelencia desde el primer paso.", image: "/components/media/instalaciones/1.jpeg" },
      { id: 2, title: "Sala de Juntas", phrase: "Estrategia y Decisión.", image: "/components/media/instalaciones/juntas.webp" },
      { id: 3, title: "Oficinas", phrase: "Privacidad Absoluta.", image: "/components/media/instalaciones/4.jpeg" },
      { id: 4, title: "Sala de Espera", phrase: "Confort y Serenidad.", image: "/components/media/instalaciones/espera.webp" },
      { id: 5, title: "Edificio", phrase: "Infraestructura de vanguardia.", image: "/components/media/instalaciones/edificio.jpg" }
    ]
  }
};
