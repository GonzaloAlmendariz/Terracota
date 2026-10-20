// URLs de las imágenes optimizadas que genera scripts/optimizar-imagenes.mjs.
// Los anchos tienen que coincidir con los que ese script produce.

const BASE = import.meta.env.BASE_URL;

/** Foto de un proyecto en un ancho dado (800 para tarjetas, 1600 para pantalla completa). */
export const fotoProyecto = (nombre: string, ancho: 800 | 1600) => `${BASE}img/proyectos/${nombre}-${ancho}.webp`;

export const srcSetProyecto = (nombre: string) => `${fotoProyecto(nombre, 800)} 800w, ${fotoProyecto(nombre, 1600)} 1600w`;

const portada = (ancho: number) => `${BASE}img/portada/sofa-${ancho}.webp`;
export const FOTO_PORTADA = {
  src: portada(1920),
  srcSet: [1280, 1920, 2560].map((a) => `${portada(a)} ${a}w`).join(", "),
};
