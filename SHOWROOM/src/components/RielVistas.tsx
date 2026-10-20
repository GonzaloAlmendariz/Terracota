import { VISTAS, type Vista } from "../lib/direccion";
import { IconoVista } from "./IconosVista";

export const NOMBRE_VISTA: Record<Vista, string> = {
  plano: "Plano",
  medidas: "Medidas",
  maqueta: "Maqueta 3D",
  ubicacion: "Ubicación",
  recorrido: "Recorrido",
  "360": "Vista 360°",
};

// Riel de vistas: vertical a la izquierda en escritorio, fila en celular.
// El nombre de cada vista aparece al pasar o enfocar el botón.
export function RielVistas({ vista, onCambio }: { vista: Vista; onCambio: (v: Vista) => void }) {
  return (
    <nav className="capa riel-vistas" aria-label="Vistas del departamento">
      {VISTAS.map((v) => (
        <button
          key={v}
          type="button"
          className={`riel-boton${vista === v ? " activo" : ""}`}
          aria-pressed={vista === v}
          aria-label={NOMBRE_VISTA[v]}
          onClick={() => onCambio(v)}
        >
          <IconoVista vista={v} />
          <span className="riel-nombre">{NOMBRE_VISTA[v]}</span>
        </button>
      ))}
    </nav>
  );
}
