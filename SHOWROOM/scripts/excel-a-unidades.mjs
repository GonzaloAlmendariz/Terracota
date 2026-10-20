// Convierte el Excel de unidades del cliente en data/unidades.json.
//
//   node scripts/excel-a-unidades.mjs <archivo.xlsx>     → reescribe data/unidades.json
//   node scripts/excel-a-unidades.mjs --plantilla        → crea data/plantilla-unidades.xlsx
//
// Columnas esperadas (primera hoja, una fila por departamento):
//   depto · piso · tipologia · area_m2 · dormitorios · banos · precio_usd · estado
// estado: Disponible | Reservado | Vendido

import * as XLSX from "xlsx";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const destino = join(raiz, "data/unidades.json");
const COLUMNAS = ["depto", "piso", "tipologia", "area_m2", "dormitorios", "banos", "precio_usd", "estado"];
const ESTADOS = new Map([
  ["disponible", "disponible"],
  ["reservado", "reservado"],
  ["vendido", "vendido"],
]);

const arg = process.argv[2];
if (!arg) {
  console.error("Uso: node scripts/excel-a-unidades.mjs <archivo.xlsx> | --plantilla");
  process.exit(1);
}

const actual = JSON.parse(readFileSync(destino, "utf8"));

if (arg === "--plantilla") {
  const filas = actual.unidades.map((u) => ({
    depto: u.id,
    piso: u.piso,
    tipologia: u.tipologia,
    area_m2: u.area_m2,
    dormitorios: u.dormitorios,
    banos: u.banos,
    precio_usd: u.precio_usd,
    estado: u.estado[0].toUpperCase() + u.estado.slice(1),
  }));
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(filas, { header: COLUMNAS }), "unidades");
  const archivo = join(raiz, "data/plantilla-unidades.xlsx");
  writeFileSync(archivo, XLSX.write(libro, { type: "buffer", bookType: "xlsx" }));
  console.log("escrito", archivo);
  process.exit(0);
}

const libro = XLSX.read(readFileSync(arg));
const filas = XLSX.utils.sheet_to_json(libro.Sheets[libro.SheetNames[0]], { defval: "" });
const errores = [];
const unidades = filas.map((f, i) => {
  const fila = i + 2;
  for (const c of COLUMNAS) if (f[c] === "") errores.push(`fila ${fila}: falta «${c}»`);
  const estado = ESTADOS.get(String(f.estado).trim().toLowerCase());
  if (!estado) errores.push(`fila ${fila}: estado «${f.estado}» no es Disponible, Reservado ni Vendido`);
  if (f.tipologia && !actual.tipologias[f.tipologia]) errores.push(`fila ${fila}: la tipología «${f.tipologia}» no existe en unidades.json`);
  return {
    id: String(f.depto),
    piso: Number(f.piso),
    tipologia: String(f.tipologia),
    area_m2: Number(f.area_m2),
    dormitorios: Number(f.dormitorios),
    banos: Number(f.banos),
    precio_usd: Number(f.precio_usd),
    estado,
  };
});

if (errores.length) {
  console.error(`No se escribió nada. ${errores.length} problema(s):\n  ${errores.join("\n  ")}`);
  process.exit(1);
}

writeFileSync(destino, JSON.stringify({ ...actual, unidades }, null, 2) + "\n");
console.log(`escrito ${destino} con ${unidades.length} unidades`);
