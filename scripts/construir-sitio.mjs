// Arma el sitio publicable en _site/: la web en la raíz y el showroom en
// /showroom/. Lo usan el workflow de GitHub Pages y `pnpm build` en local.
//
// En Pages el sitio vive en /<repo>/; fuera de Actions se asume /Terracota/.

import { execSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const [duenio = "gonzaloalmendariz", repo = "Terracota"] = (process.env.GITHUB_REPOSITORY ?? "").split("/").filter(Boolean);
const base = process.env.SITIO_BASE ?? `/${repo}/`;
const sitio = process.env.SITIO_URL ?? `https://${duenio.toLowerCase()}.github.io${base}`;

const correr = (cmd, env) => execSync(cmd, { cwd: raiz, stdio: "inherit", env: { ...process.env, ...env } });

console.log(`\n▸ web en ${base}`);
correr("pnpm -C WEB build", { WEB_BASE: base, SITIO_URL: sitio });
console.log(`\n▸ showroom en ${base}showroom/`);
correr("pnpm -C SHOWROOM build", { SHOWROOM_BASE: `${base}showroom/` });

const salida = join(raiz, "_site");
rmSync(salida, { recursive: true, force: true });
mkdirSync(salida, { recursive: true });
cpSync(join(raiz, "WEB/dist"), salida, { recursive: true });
cpSync(join(raiz, "SHOWROOM/dist"), join(salida, "showroom"), { recursive: true });
// Enlaces profundos del showroom: Pages devuelve este 404, que los reenvía.
cpSync(join(raiz, "SHOWROOM/pages-404.html"), join(salida, "404.html"));
writeFileSync(join(salida, ".nojekyll"), "");
console.log(`\n✓ sitio en _site/ (${sitio})`);
