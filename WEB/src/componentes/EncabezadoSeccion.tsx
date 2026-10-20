import type { ReactNode } from "react";

// «01 / Sobre» a la izquierda y el título grande, que entra línea por línea.
export function EncabezadoSeccion({ indice, children, extra }: { indice: string; children: ReactNode; extra?: ReactNode }) {
  const titulo = <h2 className="section-title split-line">{children}</h2>;
  return (
    <div className="section-header reveal">
      <div className="side">
        <div className="mono" style={{ color: "var(--muted)" }}>
          {indice}
        </div>
      </div>
      {extra ? (
        <div>
          {titulo}
          {extra}
        </div>
      ) : (
        titulo
      )}
    </div>
  );
}
