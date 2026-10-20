// Contenido de las secciones Servicios, Filosofía y Equipo.

export const SERVICIOS = [
  { n: "01", t: "Diseño residencial", k: "Casas / Departamentos / Remodelación" },
  { n: "02", t: "Diseño comercial", k: "Oficinas / Retail / Hotelería" },
  { n: "03", t: "Gestión y ejecución", k: "Residencial y comercial" },
  { n: "04", t: "Styling y decoración", k: "Residencial y comercial" },
];

// Cada principio lleva un pequeño «moodboard» de cuatro materiales.
export const PRINCIPIOS = [
  {
    n: "01",
    t: "Equilibrio",
    g: "a",
    d: "Entre forma y función. Cada elemento responde a una razón y a una emoción al mismo tiempo.",
    muestras: [
      { color: "#2c241d", nombre: "Nogal" },
      { color: "#b4563a", nombre: "Terracota" },
      { color: "#efe8dd", nombre: "Lino" },
      { color: "#c8a35e", nombre: "Ocre" },
    ],
  },
  {
    n: "02",
    t: "Calidez",
    g: "b",
    d: "Espacios que acogen. La materialidad, la luz y la escala trabajan juntas para generar sensación de hogar.",
    muestras: [
      { color: "#d48b6e", nombre: "Arcilla" },
      { color: "#8a6a4b", nombre: "Roble" },
      { color: "#e4d6bd", nombre: "Bone" },
      { color: "#4b3a2e", nombre: "Café" },
    ],
  },
  {
    n: "03",
    t: "Identidad",
    g: "g",
    d: "Cada proyecto refleja a quien lo habita. Escuchamos antes de dibujar.",
    muestras: [
      { color: "#6b7a52", nombre: "Oliva" },
      { color: "#a6836b", nombre: "Caramelo" },
      { color: "#e9e2d4", nombre: "Papel" },
      { color: "#1a1510", nombre: "Tinta" },
    ],
  },
];

export interface Integrante {
  num: string;
  nombre: string;
  apellido: string;
  rol: string;
  bio: string;
  /** Nombre de la foto en imagenes/ (sin extensión); null mientras no hay foto. */
  foto: string | null;
}

// Dos niveles para que la jerarquía sea explícita: la dirección va primero y
// en grande; comunicaciones, debajo y más compacto.
export const DIRECCION: Integrante[] = [
  { num: "01", nombre: "Renzo", apellido: "Burga", rol: "Co-fundador / Arquitecto de interiores", bio: "Especialista en diseño funcional y atemporal. Lidera la ejecución y gestión de proyectos.", foto: null },
  { num: "02", nombre: "Gianella", apellido: "Quiroz", rol: "Co-fundadora / Arquitecta de interiores", bio: "Enfocada en la conceptualización y el styling. Traduce la identidad del cliente en propuestas con carácter.", foto: null },
];

export const COMUNICACIONES: Integrante[] = [
  { num: "01", nombre: "Diego", apellido: "Agudelo", rol: "Gerente de comunicaciones", bio: "Lidera la estrategia de comunicación del estudio y la relación con clientes corporativos.", foto: null },
  { num: "02", nombre: "Fotografía", apellido: "360°", rol: "Captura inmersiva", bio: "Registra cada proyecto en fotografía 360° para que el cliente recorra el espacio a distancia.", foto: null },
  { num: "03", nombre: "Fotografía", apellido: "de proyectos", rol: "Registro de obra", bio: "Documenta cada obra terminada — la pieza final de todo proceso.", foto: null },
];

export const TESTIMONIO_PENDIENTE = "Testimonio en proceso. Pronto compartiremos la palabra del cliente.";
