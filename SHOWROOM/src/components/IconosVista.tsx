import type { Vista } from "../lib/direccion";

// Íconos de línea de las vistas, dibujados a 24 px con trazo de 1.5.
const TRAZO = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const DIBUJOS: Record<Vista, JSX.Element> = {
  plano: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 12h6M9.5 12v4.5M14 3.5v6h6.5M14 14h6.5M14 14v6.5" />
    </>
  ),
  medidas: (
    <>
      <path d="M4 3.5v17h16.5" />
      <path d="M4 8h2.5M4 12h2.5M4 16h2.5M8 20.5V18M12 20.5V18M16 20.5V18" />
      <path d="M9 4l11 11" />
    </>
  ),
  maqueta: (
    <>
      <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" />
    </>
  ),
  ubicacion: (
    <>
      <path d="M12 3 21 7.5 12 12 3 7.5 12 3Z" />
      <path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" />
    </>
  ),
  recorrido: (
    <>
      <circle cx="13" cy="4.5" r="1.6" />
      <path d="m9.5 21 2.2-6.2 2.6 2.4V21M11.7 14.8l.9-5.3-3.1 1.6-1.5 3M12.6 9.5l2.2 2.4 2.7.8" />
    </>
  ),
  "360": (
    <>
      <ellipse cx="12" cy="12" rx="9" ry="4.5" />
      <path d="M12 3v2M12 19v2" />
      <path d="M15.5 9.8 18 12l-2.5 2.2" />
    </>
  ),
};

export function IconoVista({ vista }: { vista: Vista }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...TRAZO}>
      {DIBUJOS[vista]}
    </svg>
  );
}
