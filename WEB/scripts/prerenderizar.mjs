// Escribe en dist/index.html el HTML de la página ya renderizado, para que el
// contenido llegue escrito (buscadores, vistas previas al compartir, primer
// cuadro sin esperar al JavaScript). Lo ejecuta `pnpm build`.

import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const { render } = await import(pathToFileURL(join(raiz, "dist-servidor/servidor.js")).href);

const archivo = join(raiz, "dist/index.html");
let html = readFileSync(archivo, "utf8");
if (!html.includes("<!--prerender-->")) throw new Error("dist/index.html no tiene el marcador <!--prerender-->");
html = html.replace("<!--prerender-->", render());

// La vista previa de redes sociales exige la URL completa de la imagen.
const sitio = process.env.SITIO_URL;
if (sitio) html = html.replace(/(<meta property="og:image" content=")([^"]+)"/, (_, a, ruta) => `${a}${new URL(ruta, sitio).href}"`);

writeFileSync(archivo, html);
rmSync(join(raiz, "dist-servidor"), { recursive: true, force: true });
console.log(`pre-renderizado: ${Math.round(html.length / 1024)} KB de HTML${sitio ? ` · og:image absoluta (${sitio})` : ""}`);
