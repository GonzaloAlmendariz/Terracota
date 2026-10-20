// Captura la web por secciones, en varios anchos, para comparar antes/después.
//
//   node scripts/capturas.mjs --url <url> --salida qa/capturas/antes [--anchos 1440,390]
//
// Congela todo lo que se mueve (cargador, animaciones, revelados, marquesina)
// para que dos capturas de la misma página den los mismos píxeles.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const url = arg("url");
const salida = arg("salida");
const anchos = arg("anchos", "1440,390").split(",").map(Number);
if (!url || !salida) {
  console.error("Uso: node scripts/capturas.mjs --url <url> --salida <carpeta> [--anchos 1440,390]");
  process.exit(1);
}

const CONGELAR = `
  .loader { display: none !important; }
  *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
  .reveal { opacity: 1 !important; transform: none !important; }
  .split-line > span { transform: none !important; }
  .hero__img { transform: scale(1.05) !important; }
  body::before { display: none !important; }
`;

const SECCIONES = [
  ["portada", ".hero"],
  ["sobre", "#about"],
  ["servicios", "#services"],
  ["filosofia", "#philosophy"],
  ["equipo", "#team"],
  ["portafolio", "#portfolio"],
  ["contacto", "#contact"],
  ["pie", "footer"],
];

async function preparar(page) {
  await page.addStyleTag({ content: CONGELAR });
  await page.evaluate(() => document.fonts.ready);
  // Recorre la página para que carguen las imágenes diferidas.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
    // Las tarjetas fuera de pantalla del carrusel son diferidas y nunca cargan: tope de espera.
    const pendientes = [...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
    await Promise.race([Promise.all(pendientes), new Promise((r) => setTimeout(r, 4000))]);
    // Que todo lo cargado esté también decodificado antes de capturar.
    await Promise.all([...document.images].filter((i) => i.complete && i.naturalWidth).map((i) => i.decode().catch(() => {})));
  });
  await page.waitForTimeout(600);
}

const navegador = await chromium.launch();
for (const ancho of anchos) {
  const dir = join(salida, String(ancho));
  mkdirSync(dir, { recursive: true });
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: ancho > 800 ? 900 : 844 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message));

  await page.goto(url, { waitUntil: "networkidle" });
  await preparar(page);
  for (const [nombre, sel] of SECCIONES) {
    const el = page.locator(sel).first();
    if ((await el.count()) === 0) {
      console.log(`  ${ancho} ${nombre}: NO EXISTE (${sel})`);
      continue;
    }
    await el.screenshot({ path: join(dir, `${nombre}.png`) });
  }

  // Índice desplegable abierto.
  await page.click("#btn-menu, .nav__menu");
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(dir, "indice.png") });
  await page.keyboard.press("Escape");
  await page.evaluate(() => document.getElementById("menu-overlay")?.classList.remove("open"));

  // Ficha de un proyecto, abierta por su enlace.
  await page.goto(`${url.replace(/#.*$/, "")}#proyecto/matamoros`, { waitUntil: "networkidle" });
  await preparar(page);
  await page.screenshot({ path: join(dir, "ficha-proyecto.png") });

  const alto = await page.evaluate(() => document.body.scrollHeight);
  console.log(`  ${ancho}px: ${SECCIONES.length + 2} capturas · alto de página ${alto}px · errores: ${errores.length ? errores.join(" | ") : "ninguno"}`);
  await ctx.close();
}
await navegador.close();
