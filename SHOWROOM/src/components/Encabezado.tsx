import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { proyecto, recurso } from "../lib/datos";

export function Encabezado({ children }: { children?: ReactNode }) {
  return (
    <header className="encabezado">
      <Link to="/" className="marca" aria-label="Volver al edificio">
        <img src={recurso("marca/logo-blanco.png")} alt="Terracota Studio" />
      </Link>
      <div className="encabezado-proyecto">
        <span className="sobretitulo">Showroom 3D</span>
        <span className="titulo-proyecto">{proyecto.nombre}</span>
      </div>
      <div className="encabezado-acciones">{children}</div>
    </header>
  );
}

export function FlechaIzquierda() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
      <path d="M13 5H1m0 0 4-4M1 5l4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
