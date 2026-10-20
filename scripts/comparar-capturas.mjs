// Compara dos juegos de capturas (scripts/capturas.mjs) píxel a píxel y deja
// una imagen de diferencias por captura que no coincide.
//
//   node scripts/comparar-capturas.mjs qa/capturas/antes qa/capturas/despues

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [antes, despues] = process.argv.slice(2);
const salida = join(despues, "_diferencias");
mkdirSync(salida, { recursive: true });

const filas = [];
for (const ancho of readdirSync(antes).filter((d) => /^\d+$/.test(d))) {
  for (const f of readdirSync(join(antes, ancho)).filter((x) => x.endsWith(".png"))) {
    const b = join(despues, ancho, f);
    if (!existsSync(b)) {
      filas.push([ancho, f, "FALTA", ""]);
      continue;
    }
    const A = PNG.sync.read(readFileSync(join(antes, ancho, f)));
    const B = PNG.sync.read(readFileSync(b));
    if (A.width !== B.width || A.height !== B.height) {
      filas.push([ancho, f, "TAMAÑO", `${A.width}×${A.height} → ${B.width}×${B.height}`]);
      continue;
    }
    const D = new PNG({ width: A.width, height: A.height });
    const n = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0.12 });
    const pct = (100 * n) / (A.width * A.height);
    if (n) writeFileSync(join(salida, `${ancho}-${f}`), PNG.sync.write(D));
    filas.push([ancho, f, pct === 0 ? "IGUAL" : `${pct.toFixed(2)} %`, `${n} px`]);
  }
}
for (const [a, f, r, d] of filas) console.log(`${a.padStart(5)}  ${f.padEnd(22)} ${r.padEnd(8)} ${d}`);
