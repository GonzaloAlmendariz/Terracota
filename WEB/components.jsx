/* Terracota Studio — components */
const { useState, useEffect, useRef } = React;

// Resolve an asset path. If __IMG_MAP is present (offline HTML) use the data URI.
const IMG = (p) => (window.__IMG_MAP && window.__IMG_MAP[p]) || p;

// WhatsApp number (digits only, with country code) — used for contact FAB.
const WHATSAPP_NUMBER = '51963412423';
// Google Calendar appointment schedule URL — placeholder: pega aquí tu link real de
// "Citas" de Google Calendar para que el botón "Agendar cita" funcione.
const GCAL_URL = 'https://calendar.app.google/terracota-placeholder';
// Formspree endpoint for contact form — placeholder: crea un form en Formspree
// (o Resend/EmailJS) y pega el endpoint aquí.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REEMPLAZAR-CON-ID-REAL';

const TESTIMONIAL_PENDING = 'Testimonio en proceso. Pronto compartiremos la palabra del cliente.';

const PROJECTS = [
  // ============ RESIDENCIAL ============
  {
    id: 'matamoros',
    num: '01',
    nameEm: 'Matamoros',
    type: 'Residencial — Casa',
    typeKey: 'residencial',
    location: 'Lima, Perú',
    year: '2024',
    area: '—',
    scope: ['Área social', 'Dormitorios', 'Áreas de servicio'],
    brief: 'Una familia que necesitaba renovar su casa sin perder la memoria del espacio. El reto era integrar los ambientes manteniendo la privacidad y ganando luz natural.',
    solution: 'Planta abierta entre sala, comedor y cocina. Paleta neutra con acentos terracota y maderas cálidas. Iluminación en capas para que el espacio funcione en cualquier hora del día.',
    testimonial: null,
    cover: 'assets/projects/res-matamoros-01.jpg',
    gallery: ['assets/projects/res-matamoros-01.jpg','assets/projects/res-matamoros-02.jpg','assets/projects/res-matamoros-03.jpg','assets/projects/res-matamoros-04.jpg'],
  },
  {
    id: 'marco-ashleen',
    num: '02',
    nameEm: 'Marco y Ashleen',
    type: 'Residencial — Departamento',
    typeKey: 'residencial',
    location: 'Lima, Perú',
    year: '2024',
    area: '—',
    scope: ['Sala — comedor', 'Cocina', 'Dormitorio principal'],
    brief: 'Pareja joven que buscaba un primer hogar cálido, ordenado y con identidad propia — sin sacrificar funcionalidad en un espacio compacto.',
    solution: 'Distribución eficiente con mobiliario a medida. Textiles naturales, maderas claras y detalles terracota para generar atmósfera sin saturar.',
    testimonial: null,
    cover: 'assets/projects/res-marco-ashleen-01.jpg',
    gallery: ['assets/projects/res-marco-ashleen-01.jpg','assets/projects/res-marco-ashleen-02.jpg','assets/projects/res-marco-ashleen-03.jpg','assets/projects/res-marco-ashleen-04.jpg'],
  },
  {
    id: 'monica-cornejo',
    num: '03',
    nameEm: 'Cocina Mónica Cornejo',
    type: 'Residencial — Remodelación de cocina',
    typeKey: 'residencial',
    location: 'Lima, Perú',
    year: '2024',
    area: '—',
    scope: ['Cocina', 'Barra de desayuno', 'Almacenamiento a medida'],
    brief: 'La cocina original era cerrada y poco eficiente. El objetivo fue abrir el espacio, ganar almacenamiento y reflejar el estilo de la clienta.',
    solution: 'Cocina abierta con isla central como pieza protagonista. Tapas en piedra natural, muebles hasta el techo y un acento cálido que ancla el ambiente.',
    testimonial: null,
    cover: 'assets/projects/res-monica-cornejo-01.jpg',
    gallery: ['assets/projects/res-monica-cornejo-01.jpg','assets/projects/res-monica-cornejo-02.jpg','assets/projects/res-monica-cornejo-03.jpg','assets/projects/res-monica-cornejo-04.jpg'],
  },
  {
    id: 'sienna',
    num: '04',
    nameEm: 'Sienna',
    type: 'Residencial — Dormitorio',
    typeKey: 'residencial',
    location: 'Lima, Perú',
    year: '2024',
    area: '—',
    scope: ['Dormitorio principal', 'Closet', 'Zona de lectura'],
    brief: 'Dormitorio principal que necesitaba convertirse en refugio — un espacio para desconectar al final del día.',
    solution: 'Paleta envolvente en tonos tierra, textiles densos y luz cálida puntual. Cada elemento elegido para restar ruido visual.',
    testimonial: null,
    cover: 'assets/projects/res-sienna-01.jpg',
    gallery: ['assets/projects/res-sienna-01.jpg','assets/projects/res-sienna-02.jpg','assets/projects/res-sienna-03.jpg','assets/projects/res-sienna-04.jpg'],
  },
  {
    id: 'carabayllo',
    num: '05',
    nameEm: 'Carabayllo — Luis Alfredo',
    type: 'Residencial — Casa',
    typeKey: 'residencial',
    location: 'Carabayllo, Lima',
    year: '2024',
    area: '—',
    scope: ['Sala', 'Comedor', 'Cocina', 'Dormitorios'],
    brief: 'Casa familiar que requería una remodelación integral manteniendo la lógica del terreno y la distribución original.',
    solution: 'Intervención quirúrgica: se liberaron vistas hacia el jardín y se unificaron los pisos. Nueva carpintería a medida y paleta cálida para devolverle calidez al espacio.',
    testimonial: null,
    cover: 'assets/projects/res-carabayllo-01.jpg',
    gallery: ['assets/projects/res-carabayllo-01.jpg','assets/projects/res-carabayllo-02.jpg','assets/projects/res-carabayllo-03.jpg','assets/projects/res-carabayllo-04.jpg'],
  },
  {
    id: 'asia-hans',
    num: '06',
    nameEm: 'Asia — Hans Scheng',
    type: 'Residencial — Casa de playa',
    typeKey: 'residencial',
    location: 'Asia, Lima',
    year: '2025',
    area: '—',
    scope: ['Sala', 'Comedor', 'Dormitorios', 'Terraza'],
    brief: 'Casa de playa donde la arquitectura tenía que desaparecer frente al paisaje — ligera, relajada y de materiales que envejecieran bien.',
    solution: 'Maderas claras, piedras locales y textiles en gama neutra. Cada ambiente se orientó a capturar la luz del mar y la brisa.',
    testimonial: null,
    cover: 'assets/projects/res-asia-hans-01.jpg',
    gallery: ['assets/projects/res-asia-hans-01.jpg','assets/projects/res-asia-hans-02.jpg','assets/projects/res-asia-hans-03.jpg','assets/projects/res-asia-hans-04.jpg'],
  },
  {
    id: 'surco-hans',
    num: '07',
    nameEm: 'Surco — Hans Scheng',
    type: 'Residencial — Departamento',
    typeKey: 'residencial',
    location: 'Santiago de Surco, Lima',
    year: '2025',
    area: '—',
    scope: ['Sala', 'Comedor', 'Cocina abierta', 'Dormitorio principal'],
    brief: 'Departamento contemporáneo cuyo reto era integrar las áreas sociales sin perder el carácter residencial.',
    solution: 'Planta abierta con transiciones suaves, paleta cálida y mobiliario a medida que articula los ambientes sin muros rígidos.',
    testimonial: null,
    cover: 'assets/projects/res-surco-hans-01.jpg',
    gallery: ['assets/projects/res-surco-hans-01.jpg','assets/projects/res-surco-hans-02.jpg','assets/projects/res-surco-hans-03.jpg','assets/projects/res-surco-hans-04.jpg'],
  },
  {
    id: 'german-annie',
    num: '08',
    nameEm: 'Germán y Annie',
    type: 'Residencial — Departamento',
    typeKey: 'residencial',
    location: 'Santiago de Surco, Lima',
    year: '2025',
    area: '—',
    scope: ['Sala — comedor', 'Cocina', 'Dormitorios'],
    brief: 'Pareja profesional que quería un espacio flexible para trabajar desde casa y recibir sin perder intimidad.',
    solution: 'Zonificación con alfombras, iluminación y mobiliario modular. Materialidad cálida con acentos terracota para cohesión visual.',
    testimonial: null,
    cover: 'assets/projects/res-german-annie-surco-01.jpg',
    gallery: ['assets/projects/res-german-annie-surco-01.jpg','assets/projects/res-german-annie-surco-02.jpg','assets/projects/res-german-annie-surco-03.jpg','assets/projects/res-german-annie-surco-04.jpg'],
  },
  {
    id: 'karen-munoz',
    num: '09',
    nameEm: 'Karen Muñoz',
    type: 'Residencial — Departamento',
    typeKey: 'residencial',
    location: 'Santiago de Surco, Lima',
    year: '2025',
    area: '—',
    scope: ['Sala — comedor', 'Cocina abierta', 'Dormitorios'],
    brief: 'Propietaria que buscaba una renovación profunda, con soluciones de almacenamiento creativas y un acento visual marcado.',
    solution: 'Mobiliario a medida que aprovecha cada rincón. Paleta tierra con contrastes oscuros para dar profundidad y carácter.',
    testimonial: null,
    cover: 'assets/projects/res-karen-munoz-surco-01.jpg',
    gallery: ['assets/projects/res-karen-munoz-surco-01.jpg','assets/projects/res-karen-munoz-surco-02.jpg','assets/projects/res-karen-munoz-surco-03.jpg','assets/projects/res-karen-munoz-surco-04.jpg'],
  },
  {
    id: 'melissa-granados',
    num: '10',
    nameEm: 'Melissa Granados',
    type: 'Residencial — Departamento',
    typeKey: 'residencial',
    location: 'San Miguel, Lima',
    year: '2025',
    area: '—',
    scope: ['Sala — comedor', 'Cocina', 'Dormitorios'],
    brief: 'Departamento nuevo que necesitaba identidad desde cero, sin partir de renders genéricos.',
    solution: 'Diseño pieza por pieza según la rutina de la clienta. Materiales nobles en baja cantidad, maximizando el impacto visual.',
    testimonial: null,
    cover: 'assets/projects/res-melissa-granados-01.jpg',
    gallery: ['assets/projects/res-melissa-granados-01.jpg','assets/projects/res-melissa-granados-02.jpg','assets/projects/res-melissa-granados-03.jpg','assets/projects/res-melissa-granados-04.jpg'],
  },
  {
    id: 'miriam-poma',
    num: '11',
    nameEm: 'Miriam Poma',
    type: 'Residencial — Departamento',
    typeKey: 'residencial',
    location: 'San Borja, Lima',
    year: '2025',
    area: '—',
    scope: ['Áreas sociales', 'Dormitorios', 'Baños'],
    brief: 'Remodelación integral con énfasis en resolver flujos entre cocina, comedor y área social.',
    solution: 'Nueva distribución más fluida, acabados mate y una paleta reducida que permite que la luz natural sea la protagonista.',
    testimonial: null,
    cover: 'assets/projects/res-miriam-poma-01.jpg',
    gallery: ['assets/projects/res-miriam-poma-01.jpg','assets/projects/res-miriam-poma-02.jpg','assets/projects/res-miriam-poma-03.jpg','assets/projects/res-miriam-poma-04.jpg'],
  },
  {
    id: 'danilo-miraflores',
    num: '12',
    nameEm: 'Danilo — Miraflores',
    type: 'Residencial — Dormitorios',
    typeKey: 'residencial',
    location: 'Miraflores, Lima',
    year: '2025',
    area: '—',
    scope: ['Dormitorio principal', 'Dormitorios secundarios'],
    brief: 'Conjunto de dormitorios con necesidades distintas — uno para descanso, otros para niños — pero con lenguaje visual común.',
    solution: 'Sistema de color y materialidad consistente con matices por ambiente. Cada espacio se siente propio sin romper la familia visual.',
    testimonial: null,
    cover: 'assets/projects/res-danilo-miraflores-01.jpg',
    gallery: ['assets/projects/res-danilo-miraflores-01.jpg','assets/projects/res-danilo-miraflores-02.jpg','assets/projects/res-danilo-miraflores-03.jpg','assets/projects/res-danilo-miraflores-04.jpg'],
  },
  {
    id: 'leandro',
    num: '13',
    nameEm: 'Leandro',
    type: 'Residencial — Dormitorio',
    typeKey: 'residencial',
    location: 'Lima, Perú',
    year: '2025',
    area: '—',
    scope: ['Dormitorio', 'Closet', 'Escritorio'],
    brief: 'Dormitorio juvenil que debía funcionar para descansar, estudiar y recibir amigos.',
    solution: 'Zonas diferenciadas por iluminación y materiales. Closet integrado y escritorio a medida que desaparecen cuando no se usan.',
    testimonial: null,
    cover: 'assets/projects/res-leandro-01.jpg',
    gallery: ['assets/projects/res-leandro-01.jpg','assets/projects/res-leandro-02.jpg','assets/projects/res-leandro-03.jpg','assets/projects/res-leandro-04.jpg'],
  },
  {
    id: 'nella',
    num: '14',
    nameEm: 'Nella',
    type: 'Residencial — Dormitorio',
    typeKey: 'residencial',
    location: 'Lima, Perú',
    year: '2025',
    area: '—',
    scope: ['Dormitorio', 'Área de juego / estudio'],
    brief: 'Dormitorio infantil que debía crecer con su habitante — funcional hoy, adaptable a futuro.',
    solution: 'Mobiliario modular, paleta suave con acentos lúdicos y materialidad duradera. Los elementos de juego son también piezas de diseño.',
    testimonial: null,
    cover: 'assets/projects/res-nella-01.jpg',
    gallery: ['assets/projects/res-nella-01.jpg','assets/projects/res-nella-02.jpg','assets/projects/res-nella-03.jpg','assets/projects/res-nella-04.jpg'],
  },

  // ============ COMERCIAL ============
  {
    id: 'perfection',
    num: '15',
    nameEm: 'Perfection',
    type: 'Comercial — Oficinas corporativas',
    typeKey: 'comercial',
    location: 'San Borja, Lima',
    year: '2024',
    area: '39 m²',
    scope: ['Directorio', 'Oficina call center', 'Oficina marketing', 'Kitchenette', 'Comedor'],
    brief: 'Oficinas que buscaban en 39 m² integrar a 15 personas, un ambiente iluminado y que generara productividad en sus trabajadores.',
    solution: 'Distribución abierta con zonas segmentadas por mobiliario modular. Iluminación cálida continua y paleta neutra que reduce fatiga visual.',
    testimonial: null,
    cover: 'assets/projects/com-perfection-01.jpg',
    gallery: ['assets/projects/com-perfection-01.jpg','assets/projects/com-perfection-02.jpg','assets/projects/com-perfection-03.jpg','assets/projects/com-perfection-04.jpg'],
  },
  {
    id: 'yactayo-miraflores',
    num: '16',
    nameEm: 'Juan Yactayo Miraflores',
    type: 'Comercial — Oficina creativa',
    typeKey: 'comercial',
    location: 'Miraflores, Lima',
    year: '2024',
    area: '—',
    scope: ['Oficina creativa', 'Estantería', 'Distribución'],
    brief: 'El cliente buscaba conservar todo su mobiliario existente, con una distribución estratégica y un diseño que lo representara.',
    solution: 'Intervención de color y geometría en muros, reinterpretando el mobiliario del cliente. Una pieza única con identidad propia.',
    testimonial: null,
    cover: 'assets/projects/com-yactayo-miraflores-01.jpg',
    gallery: ['assets/projects/com-yactayo-miraflores-01.jpg','assets/projects/com-yactayo-miraflores-02.jpg','assets/projects/com-yactayo-miraflores-03.jpg','assets/projects/com-yactayo-miraflores-04.jpg'],
  },
  {
    id: 'surquillo',
    num: '17',
    nameEm: 'OFC. Surquillo',
    type: 'Comercial — Oficinas',
    typeKey: 'comercial',
    location: 'Surquillo, Lima',
    year: '2024',
    area: '—',
    scope: ['Área de trabajo', 'Sala de reuniones'],
    brief: 'Oficina corporativa que necesitaba proyectar solvencia ante clientes sin perder calidez para el equipo interno.',
    solution: 'Paleta sobria con acentos cálidos, mobiliario con presencia y una sala de reuniones pensada como pieza de comunicación con clientes.',
    testimonial: null,
    cover: 'assets/projects/com-surquillo-01.jpg',
    gallery: ['assets/projects/com-surquillo-01.jpg','assets/projects/com-surquillo-02.jpg','assets/projects/com-surquillo-03.jpg','assets/projects/com-surquillo-04.jpg'],
  },
  {
    id: 'decor-constructor',
    num: '18',
    nameEm: 'Décor Constructor',
    type: 'Comercial — Oficinas corporativas',
    typeKey: 'comercial',
    location: 'Lima, Perú',
    year: '2024',
    area: '—',
    scope: ['Recepción', 'Oficina gerencia', 'Oficina administración'],
    brief: 'Constructora que quería que su oficina fuese también un showroom — el espacio tenía que vender el trabajo del cliente.',
    solution: 'Recepción con materialidad protagonista, áreas ejecutivas en escala doméstica y acabados que funcionan como muestrario activo.',
    testimonial: null,
    cover: 'assets/projects/com-decor-constructor-01.jpg',
    gallery: ['assets/projects/com-decor-constructor-01.jpg','assets/projects/com-decor-constructor-02.jpg','assets/projects/com-decor-constructor-03.jpg','assets/projects/com-decor-constructor-04.jpg'],
  },
  {
    id: 'yesebell',
    num: '19',
    nameEm: 'Proy. Yesebell',
    type: 'Comercial — Retail',
    typeKey: 'comercial',
    location: 'Lima, Perú',
    year: '2023',
    area: '—',
    scope: ['Área de atención', 'Exhibición', 'Almacenamiento'],
    brief: 'Espacio comercial que tenía que funcionar como vitrina y como experiencia — el producto debía leerse desde la calle.',
    solution: 'Luz puntual sobre exhibidores, circulación clara y paleta que no compite con el producto. Cada decisión al servicio de la venta.',
    testimonial: null,
    cover: 'assets/projects/com-yesebell-01.jpg',
    gallery: ['assets/projects/com-yesebell-01.jpg','assets/projects/com-yesebell-02.jpg','assets/projects/com-yesebell-03.jpg','assets/projects/com-yesebell-04.jpg'],
  },
  {
    id: 'caridyan',
    num: '20',
    nameEm: 'Caridyan Import',
    type: 'Comercial — Stand / retail',
    typeKey: 'comercial',
    location: 'La Victoria, Lima',
    year: '2025',
    area: '—',
    scope: ['Stand comercial', 'Exhibición', 'Almacenamiento'],
    brief: 'Stand comercial cuyo problema era el poco almacenamiento y el desorden en el área de ventas.',
    solution: 'Distribución estratégica con mobiliario integrado. El espacio de exhibición gana protagonismo sin sacrificar operación.',
    testimonial: null,
    cover: 'assets/projects/com-caridyan-01.jpg',
    gallery: ['assets/projects/com-caridyan-01.jpg','assets/projects/com-caridyan-02.jpg','assets/projects/com-caridyan-03.jpg','assets/projects/com-caridyan-04.jpg'],
  },
  {
    id: 'capilar-force',
    num: '21',
    nameEm: 'Capilar Force',
    type: 'Comercial — Clínica / servicio',
    typeKey: 'comercial',
    location: 'Lima, Perú',
    year: '2025',
    area: '—',
    scope: ['Recepción', 'Áreas de atención', 'Zona clientes'],
    brief: 'Centro especializado que necesitaba sentirse clínico pero acogedor — un equilibrio difícil cuando el cliente llega con incomodidad.',
    solution: 'Materialidad limpia, iluminación cálida, colores en gama tierra que reducen ansiedad. Cada touchpoint se diseñó para bajar la tensión.',
    testimonial: null,
    cover: 'assets/projects/com-capilar-force-01.jpg',
    gallery: ['assets/projects/com-capilar-force-01.jpg','assets/projects/com-capilar-force-02.jpg','assets/projects/com-capilar-force-03.jpg','assets/projects/com-capilar-force-04.jpg'],
  },
  {
    id: 'kronos',
    num: '22',
    nameEm: 'Kronos',
    type: 'Comercial — Oficinas',
    typeKey: 'comercial',
    location: 'Lima, Perú',
    year: '2025',
    area: '—',
    scope: ['Área de trabajo', 'Salas de reunión', 'Breakroom'],
    brief: 'Oficina corporativa que debía proyectar seriedad sin caer en el cliché del "open space" frío.',
    solution: 'Carpintería de madera, paletas cálidas y salas de reunión diferenciadas por atmósfera según el tipo de conversación que albergan.',
    testimonial: null,
    cover: 'assets/projects/com-kronos-01.jpg',
    gallery: ['assets/projects/com-kronos-01.jpg','assets/projects/com-kronos-02.jpg','assets/projects/com-kronos-03.jpg','assets/projects/com-kronos-04.jpg'],
  },
  {
    id: 'punto-de-partida',
    num: '23',
    nameEm: 'Punto de Partida',
    type: 'Comercial — Oficinas',
    typeKey: 'comercial',
    location: 'Pueblo Libre, Lima',
    year: '2026',
    area: '—',
    scope: ['Oficinas', 'Sala directorio', 'Estar'],
    brief: 'Espacio de oficinas con distribución estratégica pensada en motivar y generar calidez para el equipo.',
    solution: 'Materialidad cálida con madera y blancos suaves. Iluminación indirecta para generar atmósfera sin perder funcionalidad.',
    testimonial: null,
    cover: 'assets/projects/com-punto-de-partida-01.jpg',
    gallery: ['assets/projects/com-punto-de-partida-01.jpg','assets/projects/com-punto-de-partida-02.jpg','assets/projects/com-punto-de-partida-03.jpg','assets/projects/com-punto-de-partida-04.jpg'],
  },
  {
    id: 'shawarma',
    num: '24',
    nameEm: 'Shawarma',
    type: 'Comercial — Local gastronómico',
    typeKey: 'comercial',
    location: 'Lima, Perú',
    year: '2026',
    area: '—',
    scope: ['Área de comensales', 'Barra de atención', 'Cocina abierta'],
    brief: 'Local de comida rápida donde la experiencia visual debía contar la historia del producto desde la puerta.',
    solution: 'Materialidad honesta — madera, metal y cerámica — con iluminación cálida. La cocina abierta es parte del decorado.',
    testimonial: null,
    cover: 'assets/projects/com-shawarma-01.jpg',
    gallery: ['assets/projects/com-shawarma-01.jpg','assets/projects/com-shawarma-02.jpg','assets/projects/com-shawarma-03.jpg','assets/projects/com-shawarma-04.jpg'],
  },
];

// === About ===
function About() {
  return (
    <section id="about" className="section--decorated" data-section-num="01">
      <div className="section-header reveal">
        <div className="side"><div className="mono" style={{color:'var(--muted)'}}>01 / Sobre</div></div>
        <h2 className="section-title split-line">
          <span>Diseño con <em>criterio</em>,</span><br/>
          <span>propósito y <em>carácter</em>.</span>
        </h2>
      </div>

      <div className="manifesto">
        <div className="side"><div className="eyebrow">Nuestra propuesta</div></div>
        <div className="col">
          <p className="body-copy">En nuestro estudio entendemos el diseño como una herramienta para transformar ideas en espacios con propósito. Cada propuesta se desarrolla con responsabilidad, criterio y compromiso.</p>
          <p className="body-copy" style={{marginTop:'1em'}}>Creemos en un proceso colaborativo. Nos enfocamos en comprender a profundidad las necesidades de cada cliente, ofreciendo respuestas reales y personalizadas.</p>
        </div>
        <div className="col">
          <div className="quote">"Diseñamos, proponemos y cuidamos cada detalle — acompañando cada etapa para lograr espacios que no solo se <span>vean bien</span>, sino que se <span>vivan mejor</span>."</div>
        </div>
      </div>

      <div className="mision-vision">
        <div className="side"><div className="eyebrow">Misión y visión</div></div>
        <div className="mv-grid">
          <div className="mv-card">
            <div className="mv-num mono">01 / Misión</div>
            <p className="mv-body">Transformar espacios en experiencias que reflejen la identidad de quien los habita, combinando criterio estético, ejecución impecable y acompañamiento cercano en cada etapa del proceso.</p>
          </div>
          <div className="mv-card">
            <div className="mv-num mono">02 / Visión</div>
            <p className="mv-body">Ser el estudio de interiorismo de referencia en Lima para proyectos residenciales y corporativos donde el diseño, la materialidad y la confianza importan por igual.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// === Services ===
function Services() {
  const items = [
    {n:'01', t:'Diseño residencial', k:'Casas / Departamentos / Remodelación'},
    {n:'02', t:'Diseño comercial', k:'Oficinas / Retail / Hotelería'},
    {n:'03', t:'Gestión y ejecución', k:'Residencial y comercial'},
    {n:'04', t:'Styling y decoración', k:'Residencial y comercial'},
  ];
  return (
    <section id="services" className="section--decorated" data-section-num="02">
      <div className="section-header reveal">
        <div className="side"><div className="mono" style={{color:'var(--muted)'}}>02 / Servicios</div></div>
        <h2 className="section-title split-line"><span>Lo que <em>hacemos</em>.</span></h2>
      </div>
      <div className="services">
        <div className="services__list">
          {items.map((s,i) => (
            <div key={i} className="service-row reveal" data-cursor="link">
              <div className="n mono">[ {s.n} ]</div>
              <div className="t">{s.t}</div>
              <div className="k">{s.k}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// === Philosophy ===
function Philosophy() {
  // Each principle carries a small "moodboard" of four swatches (color + label).
  // References Kelly Hoppen / MAS Creations: the materiality is the message.
  const principles = [
    {
      n:'01', t:'Equilibrio', g:'a',
      d:'Entre forma y función. Cada elemento responde a una razón y a una emoción al mismo tiempo.',
      swatches: [
        { color:'#2c241d', label:'Nogal' },
        { color:'#b4563a', label:'Terracota' },
        { color:'#efe8dd', label:'Lino' },
        { color:'#c8a35e', label:'Ocre' },
      ],
    },
    {
      n:'02', t:'Calidez', g:'b',
      d:'Espacios que acogen. La materialidad, la luz y la escala trabajan juntas para generar sensación de hogar.',
      swatches: [
        { color:'#d48b6e', label:'Arcilla' },
        { color:'#8a6a4b', label:'Roble' },
        { color:'#e4d6bd', label:'Bone' },
        { color:'#4b3a2e', label:'Café' },
      ],
    },
    {
      n:'03', t:'Identidad', g:'g',
      d:'Cada proyecto refleja a quien lo habita. Escuchamos antes de dibujar.',
      swatches: [
        { color:'#6b7a52', label:'Oliva' },
        { color:'#a6836b', label:'Caramelo' },
        { color:'#e9e2d4', label:'Papel' },
        { color:'#1a1510', label:'Tinta' },
      ],
    },
  ];
  return (
    <section id="philosophy" className="section--decorated" data-section-num="03">
      <div className="section-header reveal">
        <div className="side"><div className="mono" style={{color:'var(--muted)'}}>03 / Filosofía</div></div>
        <h2 className="section-title split-line"><span>Tres <em>principios</em></span><br/><span>que guían el estudio.</span></h2>
      </div>
      <div className="philosophy">
        <div className="side">
          <div className="eyebrow" style={{marginBottom:14}}>Marco de trabajo</div>
          <p className="body-copy" style={{fontSize:13}}>Trabajamos alrededor de tres principios que atraviesan todos nuestros proyectos, residenciales o comerciales.</p>
        </div>
        <div className="principles">
          {principles.map((p,i) => (
            <div key={i} className="principle reveal" data-cursor="link">
              <div>
                <div className="num">{p.n}</div>
                <div className="ttl">{p.t}</div>
                <div className="desc">{p.d}</div>
                <div className="principle__swatches" aria-hidden="true">
                  {p.swatches.map((s, j) => (
                    <div key={j} className="swatch" title={s.label}>
                      <span className="swatch__chip" style={{background: s.color}}/>
                      <span className="swatch__label mono">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glyph">{p.g}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// === Team ===
// Two tiers so the hierarchy is explicit: the architects lead visually,
// the communications team sits below in a more compact grid.
const ARQUITECTOS = [
  { num:'01', name:'Renzo', last:'Burga', role:'Co-fundador / Arquitecto de interiores', bio:'Especialista en diseño funcional y atemporal. Lidera la ejecución y gestión de proyectos.', photo:null },
  { num:'02', name:'Gianella', last:'Quiroz', role:'Co-fundadora / Arquitecta de interiores', bio:'Enfocada en la conceptualización y el styling. Traduce la identidad del cliente en propuestas con carácter.', photo:null },
];

const COMUNICACIONES = [
  { num:'01', name:'Diego', last:'Agudelo', role:'Gerente de comunicaciones', bio:'Lidera la estrategia de comunicación del estudio y la relación con clientes corporativos.', photo:null },
  { num:'02', name:'Fotografía', last:'360°', role:'Captura inmersiva', bio:'Registra cada proyecto en fotografía 360° para que el cliente recorra el espacio a distancia.', photo:null },
  { num:'03', name:'Fotografía', last:'de proyectos', role:'Registro de obra', bio:'Documenta cada obra terminada — la pieza final de todo proceso.', photo:null },
];

function TeamLead({ m }) {
  return (
    <div className="team-lead reveal" data-cursor="link">
      <div className="team-lead__photo" aria-hidden={m.photo ? 'false' : 'true'}>
        {m.photo ? (
          <img src={IMG(m.photo)} alt={m.name + ' ' + m.last + ' — ' + m.role} loading="lazy"/>
        ) : (
          <div className="team-photo__placeholder">
            <span className="mono">Foto pronto</span>
          </div>
        )}
      </div>
      <div className="team-lead__body">
        <div className="mono num">{m.num} / {String(ARQUITECTOS.length).padStart(2,'0')}</div>
        <div className="name">{m.name}<br/><em>{m.last}</em></div>
        <div className="role mono">{m.role}</div>
        <div className="bio">{m.bio}</div>
      </div>
    </div>
  );
}

function TeamMember({ m, total }) {
  return (
    <div className="team-member reveal" data-cursor="link">
      <div className="team-member__photo" aria-hidden={m.photo ? 'false' : 'true'}>
        {m.photo ? (
          <img src={IMG(m.photo)} alt={m.name + ' ' + m.last + ' — ' + m.role} loading="lazy"/>
        ) : (
          <div className="team-photo__placeholder">
            <span className="mono">Foto pronto</span>
          </div>
        )}
      </div>
      <div className="team-member__body">
        <div className="mono num">{m.num} / {String(total).padStart(2,'0')}</div>
        <div className="name">{m.name} <em>{m.last}</em></div>
        <div className="role mono">{m.role}</div>
        <div className="bio">{m.bio}</div>
      </div>
    </div>
  );
}

function Team() {
  return (
    <section id="team" className="section--decorated" data-section-num="04">
      <div className="section-header reveal">
        <div className="side"><div className="mono" style={{color:'var(--muted)'}}>04 / Equipo</div></div>
        <h2 className="section-title split-line"><span>Quiénes <em>somos</em>.</span></h2>
      </div>

      <div className="team">
        <div className="side">
          <div className="eyebrow" style={{marginBottom:14}}>Estudio</div>
          <p className="body-copy" style={{fontSize:13}}>Somos un equipo multidisciplinario. Detrás de cada proyecto hay diseño, dirección creativa, comunicación y registro fotográfico — todo coordinado desde un mismo estudio.</p>
        </div>

        <div className="team-main">
          <div className="team-tier team-tier--lead">
            <div className="team-tier__head">
              <span className="eyebrow" style={{color:'var(--accent-soft)'}}>// Dirección</span>
              <span className="mono" style={{color:'var(--muted)', marginLeft:14}}>{String(ARQUITECTOS.length).padStart(2,'0')} arquitectos</span>
            </div>
            <div className="team-lead-grid">
              {ARQUITECTOS.map((m, i) => <TeamLead key={i} m={m} />)}
            </div>
          </div>

          <div className="team-tier team-tier--support">
            <div className="team-tier__head">
              <span className="eyebrow" style={{color:'var(--accent-ochre)'}}>// Comunicaciones</span>
              <span className="mono" style={{color:'var(--muted)', marginLeft:14}}>{String(COMUNICACIONES.length).padStart(2,'0')} miembros</span>
            </div>
            <div className="team-member-grid">
              {COMUNICACIONES.map((m, i) => <TeamMember key={i} m={m} total={COMUNICACIONES.length} />)}
            </div>
          </div>
        </div>

        <div className="team-group reveal">
          <div className="team-group__placeholder">
            <div className="eyebrow">Foto grupal</div>
            <div className="team-group__title">La foto del equipo completo está en proceso — pronto estará aquí.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// === Portfolio: two horizontal sliders ===
function Portfolio({onOpen}) {
  const residencial = PROJECTS.filter(p => p.typeKey === 'residencial');
  const comercial = PROJECTS.filter(p => p.typeKey === 'comercial');

  return (
    <section id="portfolio" className="section--decorated" data-section-num="05">
      <div className="section-header reveal">
        <div className="side"><div className="mono" style={{color:'var(--muted)'}}>05 / Portafolio</div></div>
        <div>
          <h2 className="section-title split-line"><span>Proyectos <em>seleccionados</em>.</span></h2>
          <p className="body-copy" style={{maxWidth:'46ch', fontSize:15, marginTop:20}}>Dos líneas de trabajo: <em style={{fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--accent-soft)'}}>residencial</em> y <em style={{fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--accent-soft)'}}>comercial</em>. Desliza horizontalmente para recorrer cada proyecto — cada card muestra toda la galería.</p>
        </div>
      </div>

      <ProjectSlider label="Residencial" projects={residencial} onOpen={onOpen}/>
      <ProjectSlider label="Comercial" projects={comercial} onOpen={onOpen}/>
    </section>
  );
}

function ProjectSlider({label, projects, onOpen}) {
  const scrollerRef = useRef(null);
  const [pos, setPos] = useState(0);

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('.pcard');
    const w = card ? card.getBoundingClientRect().width + 24 : 500;
    el.scrollBy({ left: w * dir, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setPos(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener('scroll', onScroll);
    return () => { el.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <div className="slider-block reveal">
      <div className="slider-head">
        <div className="slider-label">
          <span className="eyebrow" style={{color:'var(--accent-soft)'}}>// {label}</span>
          <span className="mono" style={{color:'var(--muted)', marginLeft:14}}>{String(projects.length).padStart(2,'0')} proyectos</span>
        </div>
        <div className="slider-controls">
          <button className="sbtn" onClick={()=>scrollByAmount(-1)} aria-label={'Anterior — ' + label} data-cursor="link">{"<"}</button>
          <div className="sbar"><div className="sbar__fill" style={{transform:'translateX(' + (pos*100 - 100) + '%)'}}/></div>
          <button className="sbtn" onClick={()=>scrollByAmount(1)} aria-label={'Siguiente — ' + label} data-cursor="link">{">"}</button>
        </div>
      </div>
      <div className="slider" ref={scrollerRef} data-slider="true">
        {projects.map(p => (
          <ProjectCard key={p.id} p={p} onOpen={onOpen}/>
        ))}
        <EndCard label={label}/>
      </div>
    </div>
  );
}

function ProjectCard({p, onOpen}) {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered) return;
    const t = setInterval(() => setIdx(i => (i + 1) % p.gallery.length), 1400);
    return () => clearInterval(t);
  }, [hovered, p.gallery.length]);

  useEffect(() => { if (!hovered) setIdx(0); }, [hovered]);

  return (
    <button
      type="button"
      className="pcard"
      data-cursor="project"
      onClick={()=>onOpen(p)}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      aria-label={'Abrir proyecto ' + p.nameEm + ' — ' + p.type}
    >
      <div className="pcard__img">
        {p.gallery.map((g,i) => (
          <img
            key={i}
            className="pcard__frame"
            src={IMG(g)}
            alt={p.nameEm + ' — imagen ' + (i+1) + ' de ' + p.gallery.length}
            loading="lazy"
            style={{opacity: idx===i?1:0}}
          />
        ))}
        <div className="pcard__num">{p.num}</div>
        <div className="pcard__dots" aria-hidden="true">
          {p.gallery.map((_,i)=>(
            <span key={i} className={'pcard__dot ' + (idx===i?'on':'')}/>
          ))}
        </div>
        <div className="pcard__open">Abrir ↗</div>
      </div>
      <div className="pcard__meta">
        <div className="pcard__name">Proy. <em>{p.nameEm}</em></div>
        <div className="pcard__info">
          <span>{p.type}</span>
          <span>{p.location}</span>
          <span>{p.year}{p.area && p.area !== '—' ? ' / ' + p.area : ''}</span>
        </div>
      </div>
    </button>
  );
}

function EndCard({label}) {
  return (
    <div className="pcard pcard--end">
      <div className="pcard__end">
        <div className="eyebrow" style={{color:'var(--accent-soft)', marginBottom:16}}>Fin del carrusel</div>
        <div style={{fontFamily:'var(--display)', fontSize:40, lineHeight:.95, textTransform:'uppercase', marginBottom:20}}>
          Tu próximo<br/><em style={{fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--accent-soft)'}}>proyecto {label.toLowerCase()}</em>.
        </div>
        <a href="#contact" className="hero__cta" style={{background:'var(--accent)', color:'#fff'}} data-cursor="view">Conversemos <span className="arr">↗</span></a>
      </div>
    </div>
  );
}

// === Project detail overlay ===
function ProjectDetail({project, onClose, onNav}) {
  const idx = PROJECTS.findIndex(p => p.id === project.id);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [slide, setSlide] = useState(0);
  useEffect(()=>setSlide(0), [project.id]);
  const go = (d) => setSlide(s => (s + d + project.gallery.length) % project.gallery.length);

  return (
    <>
      <button className="project-overlay__close" onClick={onClose} data-cursor="link" aria-label="Cerrar proyecto">
        Cerrar
        <span className="x" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1"><path d="M1 1 l10 10 M11 1 l-10 10"/></svg>
        </span>
      </button>

      <div className="po__hero" style={{backgroundImage:'url(' + IMG(project.cover) + ')'}} role="img" aria-label={project.nameEm + ' — ' + project.type}>
        <div style={{position:'absolute', top:28, left:48, right:48, display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,0.8)'}} className="mono">
          <span>{project.num} / {String(PROJECTS.length).padStart(2,'0')}</span>
          <span>{project.location}</span>
        </div>
        <h1>Proy.<br/><em>{project.nameEm}</em></h1>
      </div>

      <div className="po__meta">
        <div><div className="eyebrow k">Tipo</div><div className="v">{project.type}</div></div>
        <div><div className="eyebrow k">Ubicación</div><div className="v">{project.location}</div></div>
        <div><div className="eyebrow k">Año</div><div className="v">{project.year}</div></div>
        <div><div className="eyebrow k">Área</div><div className="v">{project.area}</div></div>
      </div>

      <div className="po__body">
        <div className="side">
          <div className="eyebrow" style={{marginBottom:14}}>Alcance</div>
          <ul style={{listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:8}}>
            {project.scope.map((s,i) => (
              <li key={i} style={{fontSize:13, color:'var(--cream-soft)', display:'flex', gap:10}}>
                <span style={{color:'var(--accent)', fontFamily:'var(--mono)'}}>/</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="eyebrow" style={{marginBottom:14}}>Problemática</div>
          <p className="body-copy">{project.brief}</p>
        </div>
        <div>
          <div className="eyebrow" style={{marginBottom:14}}>Propuesta de solución</div>
          <p className="body-copy">{project.solution}</p>
        </div>
      </div>

      {/* Testimonial block — always rendered; placeholder copy when none yet */}
      <div className="po__testimonial">
        <div className="side">
          <div className="eyebrow" style={{marginBottom:14}}>Testimonio</div>
        </div>
        <div>
          {project.testimonial ? (
            <>
              <blockquote className="po__quote">"{project.testimonial.quote}"</blockquote>
              <div className="po__attribution mono">— {project.testimonial.author}{project.testimonial.role ? ', ' + project.testimonial.role : ''}</div>
            </>
          ) : (
            <div className="po__quote po__quote--pending">{TESTIMONIAL_PENDING}</div>
          )}
        </div>
      </div>

      <div style={{padding:'0 48px 60px'}}>
        <div className="eyebrow" style={{marginBottom:18, display:'flex', justifyContent:'space-between'}}>
          <span>Galería — {String(slide+1).padStart(2,'0')} / {String(project.gallery.length).padStart(2,'0')}</span>
          <span>Carrusel</span>
        </div>
        <div style={{position:'relative', overflow:'hidden', aspectRatio:'16/9', background:'var(--bg-soft)'}}>
          {project.gallery.map((g,i) => (
            <img
              key={i}
              src={IMG(g)}
              alt={project.nameEm + ' — galería ' + (i+1)}
              loading="lazy"
              style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: slide===i ? 1 : 0, transform: slide===i ? 'scale(1)' : 'scale(1.03)', transition: 'opacity .7s ease, transform 1.2s ease'}}
            />
          ))}
          <button onClick={()=>go(-1)} data-cursor="link" aria-label="Imagen anterior" style={{position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', width:52, height:52, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.4)', color:'#fff'}}>{"<"}</button>
          <button onClick={()=>go(1)} data-cursor="link" aria-label="Siguiente imagen" style={{position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', width:52, height:52, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.4)', color:'#fff'}}>{">"}</button>
          <div style={{position:'absolute', bottom:20, left:0, right:0, display:'flex', justifyContent:'center', gap:6}}>
            {project.gallery.map((_,i)=>(
              <button key={i} onClick={()=>setSlide(i)} data-cursor="link" aria-label={'Ir a imagen ' + (i+1)} style={{width: slide===i?28:8, height:2, background: slide===i?'var(--accent)':'rgba(255,255,255,0.5)', transition:'all .3s'}}/>
            ))}
          </div>
        </div>
      </div>

      <div className="po__footer-nav">
        <button onClick={()=>onNav(prev)} data-cursor="link" style={{textAlign:'left'}} aria-label={'Anterior: ' + prev.nameEm}>
          <div className="eyebrow" style={{marginBottom:6}}>{"<"} Anterior</div>
          <div style={{fontFamily:'var(--display)', fontSize:28}}>Proy. <em style={{fontStyle:'italic', color:'var(--accent-soft)'}}>{prev.nameEm}</em></div>
        </button>
        <button onClick={()=>onNav(next)} data-cursor="link" style={{textAlign:'right'}} aria-label={'Siguiente: ' + next.nameEm}>
          <div className="eyebrow" style={{marginBottom:6}}>Siguiente {">"}</div>
          <div style={{fontFamily:'var(--display)', fontSize:28}}>Proy. <em style={{fontStyle:'italic', color:'var(--accent-soft)'}}>{next.nameEm}</em></div>
        </button>
      </div>
    </>
  );
}

// === Contact ===
function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const form = e.target;
      const data = new FormData(form);
      // If the endpoint is still the placeholder, don't pretend to send.
      if (FORMSPREE_ENDPOINT.includes('REEMPLAZAR-CON-ID-REAL')) {
        throw new Error('Configurá FORMSPREE_ENDPOINT en components.jsx para habilitar el envío.');
      }
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data,
      });
      if (!res.ok) throw new Error('El servicio no respondió correctamente. Intentá por correo o WhatsApp.');
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section--decorated" data-section-num="06">
      <div className="section-header reveal">
        <div className="side"><div className="mono" style={{color:'var(--muted)'}}>06 / Contacto</div></div>
        <h2 className="section-title split-line"><span>Cuéntanos tu <em>proyecto</em>.</span></h2>
      </div>

      <div className="contact">
        <div className="contact__grid reveal">
          <div><div className="k eyebrow">Email</div><div className="v"><a href="mailto:terracota.studiointerior@gmail.com" data-cursor="link">terracota.studiointerior<br/>@gmail.com</a></div></div>
          <div><div className="k eyebrow">Teléfono</div><div className="v"><a href="tel:+51963412423" data-cursor="link">+51 963 412 423</a></div></div>
          <div><div className="k eyebrow">WhatsApp</div><div className="v"><a href={'https://wa.me/' + WHATSAPP_NUMBER} target="_blank" rel="noopener noreferrer" data-cursor="link">Abrir chat ↗</a></div></div>
          <div><div className="k eyebrow">Agenda</div><div className="v"><a href={GCAL_URL} target="_blank" rel="noopener noreferrer" data-cursor="link">Reservar cita ↗</a></div></div>
          <div><div className="k eyebrow">Estudio</div><div className="v">Lima, Perú</div></div>
          <div><div className="k eyebrow">Horario</div><div className="v">Lun — Vie<br/>09:00 — 18:00</div></div>
        </div>

        <form className="contact__form reveal" onSubmit={onSubmit}>
          <div className="side">
            <div className="eyebrow" style={{marginBottom:14}}>Formulario</div>
            <p className="body-copy" style={{fontSize:13}}>Cuéntanos un poco sobre el espacio, el alcance y los tiempos ideales. Te respondemos dentro de 48 horas hábiles.</p>
          </div>
          <div>
            {sent ? (
              <div style={{padding:'40px 0'}} role="status">
                <div className="eyebrow" style={{color:'var(--accent)', marginBottom:14}}>Mensaje enviado</div>
                <div style={{fontFamily:'var(--display)', fontSize:40, lineHeight:1.1}}>Gracias. Te <em style={{fontStyle:'italic', color:'var(--accent-soft)'}}>escribimos</em> pronto.</div>
              </div>
            ) : (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label className="mono" htmlFor="f-nombre">Nombre</label>
                    <input id="f-nombre" name="nombre" type="text" required placeholder="Tu nombre"/>
                  </div>
                  <div className="field">
                    <label className="mono" htmlFor="f-email">Email</label>
                    <input id="f-email" name="email" type="email" required placeholder="tucorreo@ejemplo.com"/>
                  </div>
                  <div className="field">
                    <label className="mono" htmlFor="f-tipo">Tipo de proyecto</label>
                    <select id="f-tipo" name="tipo" defaultValue="Residencial">
                      <option>Residencial</option><option>Oficinas</option><option>Comercial / Retail</option><option>Hotelería</option><option>Styling</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="mono" htmlFor="f-area">Área aprox.</label>
                    <input id="f-area" name="area" type="text" placeholder="m²"/>
                  </div>
                  <div className="field full">
                    <label className="mono" htmlFor="f-mensaje">Cuéntanos</label>
                    <textarea id="f-mensaje" name="mensaje" rows="4" placeholder="Sobre el proyecto, plazos, presupuesto..."></textarea>
                  </div>
                </div>
                {error && <div className="form-error" role="alert">{error}</div>}
                <div style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', marginTop:16}}>
                  <button className="submit-btn" type="submit" data-cursor="view" disabled={sending}>
                    {sending ? 'Enviando…' : 'Enviar mensaje'} <span>↗</span>
                  </button>
                  <a className="submit-btn submit-btn--ghost" href={GCAL_URL} target="_blank" rel="noopener noreferrer" data-cursor="view">Agendar cita <span>↗</span></a>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

// === Footer ===
function Footer() {
  return (
    <footer>
      <div className="marquee">
        <div className="track">
          <span>Terracota / Studio / </span><em>Interiorismo</em><span> / Lima — Perú / </span><em>Est. 2021</em><span> / Terracota / Studio / </span><em>Interiorismo</em><span> / Lima — Perú / </span>
        </div>
      </div>
      <div className="col">
        <div className="k eyebrow">Estudio</div>
        <a href="#about" data-cursor="link">Sobre</a>
        <a href="#services" data-cursor="link">Servicios</a>
        <a href="#philosophy" data-cursor="link">Filosofía</a>
        <a href="#team" data-cursor="link">Equipo</a>
      </div>
      <div className="col">
        <div className="k eyebrow">Trabajo</div>
        <a href="#portfolio" data-cursor="link">Portafolio</a>
        <a href="#portfolio" data-cursor="link">Residencial</a>
        <a href="#portfolio" data-cursor="link">Comercial</a>
      </div>
      <div className="col">
        <div className="k eyebrow">Contacto</div>
        <a href="mailto:terracota.studiointerior@gmail.com" data-cursor="link">Email</a>
        <a href="tel:+51963412423" data-cursor="link">Teléfono</a>
        <a href={'https://wa.me/' + WHATSAPP_NUMBER} target="_blank" rel="noopener noreferrer" data-cursor="link">WhatsApp ↗</a>
        <a href={GCAL_URL} target="_blank" rel="noopener noreferrer" data-cursor="link">Agenda ↗</a>
        <a href="https://www.instagram.com/terracota.studiointerior" target="_blank" rel="noopener noreferrer" data-cursor="link">Instagram ↗</a>
      </div>
      <div className="legal">
        <span>© 2026 Terracota Studio</span>
        <span>Diseñado en Lima</span>
      </div>
    </footer>
  );
}

Object.assign(window, { About, Services, Philosophy, Team, Portfolio, ProjectSlider, ProjectCard, EndCard, ProjectDetail, Contact, Footer, PROJECTS });
