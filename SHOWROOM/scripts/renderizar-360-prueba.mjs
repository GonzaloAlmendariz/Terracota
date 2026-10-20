// Genera las panorámicas 360 de prueba renderizando cada tipología desde
// adentro de cada ambiente (herramientas/render-360.ts), mientras no existan
// los renders esféricos de V-Ray. Escribe public/360/<tipologia>/<ambiente>.webp.
//
// Uso: node scripts/renderizar-360-prueba.mjs [ancho=4096]

import { chromium } from "playwright";
import { createServer } from "vite";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ancho = Number(process.argv[2] ?? 4096);
const TIPOLOGIAS = ["tipo-a", "tipo-b"];

const servidor = await createServer({ root: raiz, base: "/", logLevel: "error", server: { port: 0 } });
await servidor.listen();
const url = servidor.resolvedUrls.local[0];

const navegador = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const pagina = await navegador.newPage();
pagina.on("pageerror", (e) => console.error("error en la página:", e.message));
await pagina.goto(`${url}herramientas/render-360.html`);
await pagina.waitForFunction(() => typeof window.renderizar === "function");

for (const tipo of TIPOLOGIAS) {
  const t0 = Date.now();
  const imagenes = await pagina.evaluate(([m, a]) => window.renderizar(m, a, a / 4), [`${url}modelos/${tipo}.glb`, ancho]);
  const dir = join(raiz, "public/360", tipo);
  mkdirSync(dir, { recursive: true });
  for (const [id, dataUrl] of Object.entries(imagenes)) {
    const datos = Buffer.from(dataUrl.split(",")[1], "base64");
    writeFileSync(join(dir, `${id}.webp`), datos);
    console.log(`  ${tipo}/${id}.webp  ${Math.round(datos.length / 1024)} KB`);
  }
  console.log(`${tipo}: ${Object.keys(imagenes).length} panorámicas en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

await navegador.close();
await servidor.close();
