import crudo from "../../data/unidades.json";

export type Estado = "disponible" | "reservado" | "vendido";

export interface Ambiente {
  id: string;
  nombre: string;
  /** Ruta relativa a public/ de la panorámica equirectangular (2:1). */
  panorama: string;
  /** Hacia dónde mira la cámara al entrar, en grados (0 = centro del render, 90 = a la derecha). */
  rumbo?: number;
}

export interface Tipologia {
  nombre: string;
  /** Ruta relativa a public/ del .glb con nodos `ambiente:<id>`. */
  modelo: string;
  ambientes: Ambiente[];
}

export interface Unidad {
  id: string;
  piso: number;
  tipologia: string;
  area_m2: number;
  dormitorios: number;
  banos: number;
  precio_usd: number;
  estado: Estado;
}

export interface Proyecto {
  nombre: string;
  distrito: string;
  pisos: number;
  deptosPorPiso: number;
  aviso: string;
}

interface Datos {
  proyecto: Proyecto;
  tipologias: Record<string, Tipologia>;
  unidades: Unidad[];
}

const datos = crudo as Datos;

export const proyecto = datos.proyecto;
export const tipologias = datos.tipologias;
export const unidades = datos.unidades;

export const ESTADOS: Record<Estado, { etiqueta: string; color: string }> = {
  disponible: { etiqueta: "Disponible", color: "var(--estado-disponible)" },
  reservado: { etiqueta: "Reservado", color: "var(--estado-reservado)" },
  vendido: { etiqueta: "Vendido", color: "var(--estado-vendido)" },
};

/** Mismos colores que los tokens CSS, para los materiales de Three.js. */
export const COLOR_ESTADO_3D: Record<Estado, string> = {
  disponible: "#a9b48e",
  reservado: "#d6bb86",
  vendido: "#4a423a",
};

export function buscarUnidad(piso: number, id: string): Unidad | undefined {
  return unidades.find((u) => u.piso === piso && u.id === id);
}

export function recurso(ruta: string): string {
  return `${import.meta.env.BASE_URL}${ruta}`;
}

/** En modo demo los .glb se publican como glTF JSON embebido (.gltf.json),
 *  porque los Artifacts no sirven binarios .glb. */
export function recursoModelo(ruta: string): string {
  return recurso(import.meta.env.VITE_DEMO === "1" ? ruta.replace(/\.glb$/, ".gltf.json") : ruta);
}

const usd = new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const formatoPrecio = (n: number) => usd.format(n);
export const formatoArea = (n: number) => `${n.toLocaleString("es-PE", { maximumFractionDigits: 2 })} m²`;
