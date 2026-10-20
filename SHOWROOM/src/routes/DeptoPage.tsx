import { lazy, Suspense, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Encabezado, FlechaIzquierda } from "../components/Encabezado";
import { FichaUnidad } from "../components/FichaUnidad";
import { Segmentado } from "../components/Segmentado";
import { buscarUnidad, recurso, recursoModelo, tipologias } from "../lib/datos";
import { useVistaDepto, type Vista } from "../lib/direccion";

const Depto3D = lazy(() => import("../components/Depto3D").then((m) => ({ default: m.Depto3D })));
const Panorama360 = lazy(() => import("../components/Panorama360").then((m) => ({ default: m.Panorama360 })));

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: "iso", etiqueta: "Maqueta" },
  { id: "planta", etiqueta: "Planta" },
  { id: "360", etiqueta: "Recorrido 360°" },
];

export function DeptoPage() {
  const { piso, depto } = useParams();
  const unidad = buscarUnidad(Number(piso), depto ?? "");
  const { vista, ambiente, ir } = useVistaDepto();
  const [rumbo, setRumbo] = useState(0);
  // La maqueta recuerda su última vista mientras se recorre el 360.
  const ultimaMaqueta = useRef<"iso" | "planta">("iso");
  if (vista !== "360") ultimaMaqueta.current = vista;

  if (!unidad) return <Navigate to="/" replace />;
  const tip = tipologias[unidad.tipologia];
  const ambienteActual = tip.ambientes.find((a) => a.id === ambiente) ?? tip.ambientes[0];

  return (
    <div className={`pantalla${vista === "360" ? " modo-360" : ""}`}>
      <div className="lienzo">
        {/* La maqueta no se desmonta al entrar al 360: queda debajo, invisible
            y sin renderizar. Volver es instantáneo y conserva la cámara;
            desmontarla recreaba WebGL y dejaba un cuadro en negro. */}
        <div className={`capa-lienzo${vista === "360" ? " en-pausa" : ""}`}>
          <Suspense fallback={<p className="cargando centrado">Preparando la maqueta</p>}>
            <Depto3D
              modelo={recursoModelo(tip.modelo)}
              ambientes={tip.ambientes}
              vista={ultimaMaqueta.current}
              activa={vista !== "360"}
              onAmbiente={(id) => ir("360", id)}
            />
          </Suspense>
        </div>
        {vista === "360" && (
          <div className="capa-lienzo">
            <Suspense fallback={<p className="cargando centrado">Cargando 360°</p>}>
              <Panorama360 url={recurso(ambienteActual.panorama)} onRumbo={setRumbo} />
            </Suspense>
          </div>
        )}
      </div>

      <Encabezado>
        <Link to="/" className="volver">
          <FlechaIzquierda />
          Edificio
        </Link>
      </Encabezado>

      {vista === "360" && (
        <>
          <div className="velo-360" aria-hidden />
          <div className="capa rotulo-360">
            <span className="cota">
              Depto {unidad.id} · {String(tip.ambientes.indexOf(ambienteActual) + 1).padStart(2, "0")} / {String(tip.ambientes.length).padStart(2, "0")}
            </span>
            <h2 key={ambienteActual.id}>{ambienteActual.nombre}</h2>
          </div>
          <div className="capa brujula" aria-hidden>
            <span style={{ transform: `rotate(${-rumbo}deg)` }} />
          </div>
        </>
      )}

      <div className="capa barra-inferior">
        {vista === "360" ? (
          <nav className="ambientes" aria-label="Ambientes">
            {tip.ambientes.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`ambiente${a.id === ambienteActual.id ? " activo" : ""}`}
                aria-pressed={a.id === ambienteActual.id}
                onClick={() => ir("360", a.id)}
              >
                {a.nombre}
              </button>
            ))}
          </nav>
        ) : (
          <p className="pista">Toca un ambiente para entrar en 360°</p>
        )}
        <Segmentado opciones={VISTAS} valor={vista} etiqueta="Vista" onCambio={(v) => ir(v, v === "360" ? ambienteActual.id : null)} />
      </div>

      <aside className="capa panel">
        <FichaUnidad unidad={unidad} ambienteActivo={vista === "360" ? ambienteActual.id : null} onAmbiente={(id) => ir("360", id)} />
      </aside>
    </div>
  );
}
