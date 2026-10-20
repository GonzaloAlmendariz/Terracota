// Genera departamentos de prueba en .glb con la misma convención de nombres
// que debe respetar el modelo real exportado desde SketchUp/Blender:
//
//   depto                      raíz
//   ├─ ambiente:<id>           piso del ambiente + su mobiliario (clic → 360)
//   ├─ muros                   muros cortados a 2.5 m (vista "casa de muñecas")
//   └─ vidrios                 mamparas y barandas
//
// Unidades en metros, Y hacia arriba. Origen en la esquina del departamento.
// Uso: node scripts/generar-modelo-prueba.mjs

import { Document, NodeIO } from "@gltf-transform/core";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const salida = join(raiz, "public/modelos");
mkdirSync(salida, { recursive: true });

const ALTO_MURO = 2.5;
const ESPESOR = 0.12;

const PALETA = {
  muro: [0.93, 0.9, 0.85, 1],
  madera: [0.62, 0.45, 0.32, 1],
  porcelanato: [0.82, 0.8, 0.76, 1],
  deck: [0.55, 0.42, 0.33, 1],
  textil: [0.36, 0.38, 0.33, 1],
  terracota: [0.71, 0.34, 0.23, 1],
  blanco: [0.96, 0.95, 0.93, 1],
  piedra: [0.5, 0.48, 0.45, 1],
  vidrio: [0.75, 0.85, 0.88, 0.22],
};

// Plano del tipo A (1 dormitorio, 2 baños, terraza). [x0, z0, x1, z1]
const AMBIENTES = [
  { id: "sala", piso: [0, 0, 5, 4.5], material: "madera" },
  { id: "cocina", piso: [5, 0, 8, 3.2], material: "porcelanato" },
  { id: "hall", piso: [5, 3.2, 8, 4.5], material: "madera" },
  { id: "dormitorio", piso: [0, 4.5, 4, 8], material: "madera" },
  { id: "bano-principal", piso: [4, 4.5, 5.6, 8], material: "porcelanato" },
  { id: "bano-visitas", piso: [5.6, 4.5, 8, 8], material: "porcelanato" },
  { id: "terraza", piso: [0, -1.5, 5, 0], material: "deck" },
];

// Muebles: [ambiente, material, x0, z0, x1, z1, y0, y1]
const MUEBLES = [
  ["sala", "textil", 0.15, 1.0, 1.05, 3.2, 0, 0.42],
  ["sala", "textil", 0.15, 1.0, 0.35, 3.2, 0.42, 0.85],
  ["sala", "piedra", 1.5, 1.6, 2.2, 2.6, 0, 0.4],
  ["sala", "madera", 3.0, 1.3, 3.4, 2.9, 0, 0.5],
  ["sala", "madera", 3.4, 3.2, 4.6, 4.1, 0.72, 0.76],
  ["sala", "madera", 3.95, 3.6, 4.05, 3.7, 0, 0.72],
  ["sala", "terracota", 1.3, 1.2, 2.4, 3.0, 0, 0.01],
  ["cocina", "blanco", 7.4, 0.3, 7.95, 3.0, 0, 0.9],
  ["cocina", "piedra", 7.4, 0.3, 7.95, 3.0, 0.9, 0.93],
  ["cocina", "blanco", 7.6, 0.3, 7.95, 3.0, 1.5, 2.2],
  ["cocina", "piedra", 5.6, 0.8, 6.6, 2.4, 0, 0.93],
  ["dormitorio", "blanco", 0.1, 5.4, 2.1, 7.0, 0, 0.5],
  ["dormitorio", "textil", 0.1, 5.4, 0.2, 7.0, 0.5, 1.1],
  ["dormitorio", "terracota", 0.6, 5.5, 2.0, 6.9, 0.5, 0.56],
  ["dormitorio", "madera", 0.1, 7.1, 0.5, 7.5, 0, 0.5],
  ["dormitorio", "madera", 3.4, 4.6, 3.95, 6.6, 0, 2.2],
  ["bano-principal", "blanco", 4.1, 4.6, 5.5, 5.1, 0, 0.85],
  ["bano-principal", "piedra", 4.6, 5.4, 5.55, 6.4, 0, 0.05],
  ["bano-principal", "blanco", 5.1, 7.3, 5.5, 7.8, 0, 0.4],
  ["bano-visitas", "blanco", 7.4, 5.0, 7.95, 6.0, 0, 0.85],
  ["bano-visitas", "blanco", 7.5, 6.4, 7.9, 6.9, 0, 0.4],
  ["bano-visitas", "piedra", 5.7, 7.0, 6.7, 7.95, 0, 0.05],
  ["terraza", "madera", 0.6, -1.2, 1.2, -0.6, 0, 0.45],
  ["terraza", "madera", 1.6, -1.1, 2.3, -0.4, 0, 0.7],
];

// Muros: [x0, z0, x1, z1]; los vanos de puerta son huecos entre tramos.
const MUROS = [
  [0, 0, 0.4, 0], [4.6, 0, 8, 0],
  [0, 8, 8, 8],
  [0, 0, 0, 8],
  [8, 0, 8, 8],
  [0, 4.5, 2.2, 4.5], [3.1, 4.5, 4, 4.5], [4, 4.5, 5.6, 4.5],
  [5.6, 4.5, 6.2, 4.5], [7.0, 4.5, 8, 4.5],
  [4, 4.5, 4, 6.9], [4, 7.6, 4, 8],
  [5.6, 4.5, 5.6, 8],
];

// Vidrios: [x0, z0, x1, z1, alto]
const VIDRIOS = [
  [0.4, 0, 4.6, 0, ALTO_MURO],
  [0, -1.5, 5, -1.5, 1.0],
  [0, -1.5, 0, 0, 1.0],
  [5, -1.5, 5, 0, 1.0],
];

function caja(doc, buffer, sx, sy, sz) {
  const [x, y, z] = [sx / 2, sy / 2, sz / 2];
  const caras = [
    [[1, 0, 0], [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]]],
    [[-1, 0, 0], [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]]],
    [[0, 1, 0], [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]]],
    [[0, -1, 0], [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]]],
    [[0, 0, 1], [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]]],
    [[0, 0, -1], [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]]],
  ];
  const pos = [];
  const nor = [];
  const idx = [];
  caras.forEach(([n, vs], i) => {
    vs.forEach((v) => {
      pos.push(...v);
      nor.push(...n);
    });
    const b = i * 4;
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });
  return doc
    .createPrimitive()
    .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(new Float32Array(pos)).setBuffer(buffer))
    .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(new Float32Array(nor)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType("SCALAR").setArray(new Uint16Array(idx)).setBuffer(buffer));
}

function construir(nombre, espejo) {
  const doc = new Document();
  doc.getRoot().getAsset().generator = "terracota-showroom/generar-modelo-prueba";
  const buffer = doc.createBuffer();
  const escena = doc.createScene(nombre);
  const depto = doc.createNode("depto");
  escena.addChild(depto);

  const materiales = Object.fromEntries(
    Object.entries(PALETA).map(([id, color]) => {
      // glTF asume metal por defecto (metallic = 1): sin esto todo sale negro.
      const m = doc.createMaterial(id).setBaseColorFactor(color).setMetallicFactor(0).setRoughnessFactor(id === "vidrio" ? 0.05 : 0.85);
      if (color[3] < 1) m.setAlphaMode("BLEND").setDoubleSided(true);
      return [id, m];
    }),
  );

  // El tipo B es el espejo del A sobre x = 4, para tener dos tipologías.
  const fx = (x) => (espejo ? 8 - x : x);
  let n = 0;
  const bloque = (padre, material, x0, z0, x1, z1, y0, y1) => {
    const [a, b] = [fx(x0), fx(x1)].sort((p, q) => p - q);
    const nodo = doc
      // Las piezas no llevan el prefijo «ambiente:»: sólo el grupo del ambiente.
      .createNode(`pieza-${n++}`)
      .setMesh(doc.createMesh().addPrimitive(caja(doc, buffer, b - a, y1 - y0, z1 - z0).setMaterial(materiales[material])))
      .setTranslation([(a + b) / 2, (y0 + y1) / 2, (z0 + z1) / 2]);
    padre.addChild(nodo);
  };

  const ambientes = {};
  for (const amb of AMBIENTES) {
    const nodo = doc.createNode(`ambiente:${amb.id}`);
    depto.addChild(nodo);
    ambientes[amb.id] = nodo;
    const [x0, z0, x1, z1] = amb.piso;
    bloque(nodo, amb.material, x0, z0, x1, z1, -0.05, 0);
  }
  for (const [amb, mat, x0, z0, x1, z1, y0, y1] of MUEBLES) bloque(ambientes[amb], mat, x0, z0, x1, z1, y0, y1);

  const muros = doc.createNode("muros");
  depto.addChild(muros);
  for (const [x0, z0, x1, z1] of MUROS) {
    const e = ESPESOR / 2;
    bloque(muros, "muro", Math.min(x0, x1) - e, Math.min(z0, z1) - e, Math.max(x0, x1) + e, Math.max(z0, z1) + e, 0, ALTO_MURO);
  }

  const vidrios = doc.createNode("vidrios");
  depto.addChild(vidrios);
  for (const [x0, z0, x1, z1, alto] of VIDRIOS) {
    const e = 0.02;
    bloque(vidrios, "vidrio", Math.min(x0, x1) - e, Math.min(z0, z1) - e, Math.max(x0, x1) + e, Math.max(z0, z1) + e, 0, alto);
  }

  return doc;
}

const io = new NodeIO();
for (const [nombre, espejo] of [["tipo-a", false], ["tipo-b", true]]) {
  const archivo = join(salida, `${nombre}.glb`);
  await io.write(archivo, construir(nombre, espejo));
  console.log("escrito", archivo);
}
