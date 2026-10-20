// Genera panorámicas equirectangulares de prueba (2:1) por ambiente, para
// probar el visor 360 antes de tener los renders esféricos de V-Ray.
// Cielo/techo arriba, piso del color del ambiente abajo, rejilla cada 30°.
// Uso: node scripts/generar-360-prueba.mjs

import { PNG } from "pngjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const salida = join(raiz, "public/360/prueba");
mkdirSync(salida, { recursive: true });

const ANCHO = 2048;
const ALTO = 1024;

const AMBIENTES = {
  sala: [158, 115, 82],
  cocina: [209, 204, 194],
  dormitorio: [150, 110, 80],
  "bano-principal": [200, 198, 190],
  "bano-visitas": [200, 198, 190],
  terraza: [140, 107, 84],
  hall: [158, 115, 82],
};

const techo = [239, 232, 221];
const muro = [226, 218, 205];
const mezcla = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

for (const [id, piso] of Object.entries(AMBIENTES)) {
  const png = new PNG({ width: ANCHO, height: ALTO });
  for (let y = 0; y < ALTO; y++) {
    const lat = 90 - (y / ALTO) * 180;
    for (let x = 0; x < ANCHO; x++) {
      const lon = (x / ANCHO) * 360;
      let c;
      if (lat > 35) c = mezcla(muro, techo, (lat - 35) / 55);
      else if (lat > -30) c = muro;
      else c = mezcla(muro, piso, Math.min(1, (-30 - lat) / 15));
      const enRejilla = lon % 30 < 0.25 || Math.abs(lat) < 0.2;
      const norte = lon < 1.5 && Math.abs(lat) < 20;
      if (norte) c = [180, 86, 58];
      else if (enRejilla) c = mezcla(c, [60, 50, 40], 0.35);
      const i = (y * ANCHO + x) * 4;
      png.data[i] = c[0];
      png.data[i + 1] = c[1];
      png.data[i + 2] = c[2];
      png.data[i + 3] = 255;
    }
  }
  const archivo = join(salida, `${id}.png`);
  writeFileSync(archivo, PNG.sync.write(png));
  console.log("escrito", archivo);
}
