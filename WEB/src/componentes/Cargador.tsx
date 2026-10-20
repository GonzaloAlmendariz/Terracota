import type { EstadoCargador } from "../efectos/useCargador";

export function Cargador({ estado }: { estado: EstadoCargador }) {
  if (estado === "oculto") return null;
  return (
    <div className={`loader${estado === "saliendo" ? " gone" : ""}`} aria-hidden>
      <div className="loader__wordmark">
        <span className="iso">T</span>
        <span className="wm">
          Terracota <em>Studio</em>
        </span>
      </div>
      <div className="loader__bar" />
      <div className="loader__text mono">Estudio de interiorismo — Lima</div>
    </div>
  );
}
