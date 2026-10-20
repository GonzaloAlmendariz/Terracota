// Arma la demo publicable como Artifact a partir de dist-demo/:
// el visor pone su propio <html>/<head>/<body>, así que la página se escribe
// sin esas etiquetas y conserva título, fuentes, estilos y el script de entrada.
// Uso: VITE_DEMO=1 vite build --base ./ --outDir dist-demo && node scripts/armar-demo-artifact.mjs

import { NodeIO } from "@gltf-transform/core";
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(raiz, "dist-demo/index.html"), "utf8");
const cabeza = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const cuerpo = html.match(/<body>([\s\S]*?)<\/body>/)[1];
const util = cabeza
  .split("\n")
  .filter((l) => /<title>|<link rel="(preconnect|stylesheet)"|fonts\.googleapis\.com\/css2|<script type="module"|<link rel="modulepreload"/.test(l))
  .join("\n");
writeFileSync(join(raiz, "dist-demo/showroom-terracota.html"), `${util}\n${cuerpo.trim()}\n`);
console.log("escrito dist-demo/showroom-terracota.html");

// Los .glb pasan a glTF JSON con el buffer embebido como data: URI.
const io = new NodeIO();
const modelos = join(raiz, "dist-demo/modelos");
for (const archivo of readdirSync(modelos).filter((f) => f.endsWith(".glb"))) {
  const doc = await io.read(join(modelos, archivo));
  const { json, resources } = await io.writeJSON(doc);
  for (const b of json.buffers ?? []) {
    b.uri = `data:application/octet-stream;base64,${Buffer.from(resources[b.uri]).toString("base64")}`;
  }
  writeFileSync(join(modelos, archivo.replace(/\.glb$/, ".gltf.json")), JSON.stringify(json));
  rmSync(join(modelos, archivo));
  console.log("convertido", archivo);
}
