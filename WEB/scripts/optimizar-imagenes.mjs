// Genera las imágenes que sirve la web, en WebP y en los anchos que cada uso
// necesita, a partir de los originales de imagenes/. La salida (public/img/)
// no se versiona: se regenera en cada build y en `pnpm dev`.
//
// Sólo se rehace una imagen si su original es más nuevo que la generada.

import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origen = join(raiz, "imagenes");
const destino = join(raiz, "public/img");

// Cada grupo: de dónde sale, a dónde va y en qué anchos.
const GRUPOS = [
  // Tarjetas del carrusel (~560 px) y galería/portada de la ficha (pantalla completa).
  { desde: "projects", hacia: "proyectos", anchos: [800, 1600], calidad: 78 },
];
const SUELTAS = [
  // Portada: ocupa toda la pantalla.
  { archivo: "sofa.png", hacia: "portada", anchos: [1280, 1920, 2560], calidad: 74 },
  // Textura del separador entre secciones: se ve una franja de 1 px.
  { archivo: "texture-stone.png", hacia: "texturas", anchos: [533], calidad: 70 },
];

let hechas = 0;
let saltadas = 0;

async function generar(entrada, carpeta, anchos, calidad) {
  const { name } = parse(entrada);
  const dir = join(destino, carpeta);
  mkdirSync(dir, { recursive: true });
  const fecha = statSync(entrada).mtimeMs;
  for (const ancho of anchos) {
    const salida = join(dir, `${name}-${ancho}.webp`);
    if (existsSync(salida) && statSync(salida).mtimeMs >= fecha) {
      saltadas++;
      continue;
    }
    await sharp(entrada).rotate().resize({ width: ancho, withoutEnlargement: true }).webp({ quality: calidad, effort: 5 }).toFile(salida);
    hechas++;
  }
}

const t0 = Date.now();
for (const g of GRUPOS) {
  const dir = join(origen, g.desde);
  for (const f of readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
    await generar(join(dir, f), g.hacia, g.anchos, g.calidad);
  }
}
for (const s of SUELTAS) await generar(join(origen, s.archivo), s.hacia, s.anchos, s.calidad);

console.log(`imágenes: ${hechas} generadas, ${saltadas} al día (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
