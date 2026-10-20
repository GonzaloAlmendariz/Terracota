import { Suspense, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { LimiteDeError } from "../components/LimiteDeError";
import { lazyConRecarga } from "../lib/cargaDiferida";
import { Encabezado, FlechaIzquierda } from "../components/Encabezado";
import { FichaUnidad } from "../components/FichaUnidad";
import { NOMBRE_VISTA, RielVistas } from "../components/RielVistas";
import { buscarUnidad, recurso, recursoModelo, tipologias, unidades } from "../lib/datos";
import { esVistaMaqueta, rutaDepto, useVistaDepto, type Vista, type VistaMaqueta } from "../lib/direccion";

const Depto3D = lazyConRecarga(() => import("../components/Depto3D").then((m) => ({ default: m.Depto3D })));
const Panorama360 = lazyConRecarga(() => import("../components/Panorama360").then((m) => ({ default: m.Panorama360 })));
const Recorrido3D = lazyConRecarga(() => import("../components/Recorrido3D").then((m) => ({ default: m.Recorrido3D })));
const Edificio3D = lazyConRecarga(() => import("../components/Edificio3D").then((m) => ({ default: m.Edificio3D })));

const PISTA: Partial<Record<Vista, string>> = {
  plano: "Toca un ambiente para verlo en 360°",
  medidas: "Medidas aproximadas, tomadas del modelo",
  maqueta: "Arrastra para girar · toca un ambiente para verlo en 360°",
  ubicacion: "Arrastra para girar · toca otro departamento para verlo",
  recorrido: "Arrastra para mirar · toca el piso para caminar · W A S D",
};

export function DeptoPage() {
  const { piso, depto } = useParams();
  const navegar = useNavigate();
  const unidad = buscarUnidad(Number(piso), depto ?? "");
  const { vista, ambiente, ir } = useVistaDepto();
  const [rumbo, setRumbo] = useState(0);
  const todas = useMemo(() => new Set(unidades.map((u) => u.id)), []);

  // La escena de la maqueta sirve a plano, medidas y maqueta: recuerda la
  // última de esas tres mientras se está en otra vista.
  const ultimaMaqueta = useRef<VistaMaqueta>("maqueta");
  if (esVistaMaqueta(vista)) ultimaMaqueta.current = vista;

  if (!unidad) return <Navigate to="/" replace />;
  const tip = tipologias[unidad.tipologia];
  const ambienteActual = tip.ambientes.find((a) => a.id === ambiente) ?? tip.ambientes[0];
  const inmersiva = vista === "360" || vista === "recorrido";

  return (
    <div className={`pantalla${inmersiva ? " modo-360" : ""}`}>
      <div className="lienzo">
        {/* La maqueta no se desmonta al cambiar de vista: queda debajo, invisible
            y sin renderizar. Volver es instantáneo y conserva la cámara;
            desmontarla recreaba WebGL y dejaba un cuadro en negro. */}
        <div className={`capa-lienzo${esVistaMaqueta(vista) ? "" : " en-pausa"}`}>
          <LimiteDeError nombre="la maqueta">
            <Suspense fallback={<p className="cargando centrado">Preparando la maqueta</p>}>
              <Depto3D
                modelo={recursoModelo(tip.modelo)}
                ambientes={tip.ambientes}
                vista={ultimaMaqueta.current}
                activa={esVistaMaqueta(vista)}
                onAmbiente={(id) => ir("360", id)}
              />
            </Suspense>
          </LimiteDeError>
        </div>
        {vista === "360" && (
          <div className="capa-lienzo">
            <LimiteDeError nombre="la vista 360°">
              <Suspense fallback={<p className="cargando centrado">Cargando 360°</p>}>
                <Panorama360 url={recurso(ambienteActual.panorama)} rumbo={ambienteActual.rumbo} onRumbo={setRumbo} />
              </Suspense>
            </LimiteDeError>
          </div>
        )}
        {vista === "recorrido" && (
          <div className="capa-lienzo">
            <LimiteDeError nombre="el recorrido">
              <Suspense fallback={<p className="cargando centrado">Preparando el recorrido</p>}>
                <Recorrido3D modelo={recursoModelo(tip.modelo)} ambientes={tip.ambientes} ambiente={ambienteActual.id} />
              </Suspense>
            </LimiteDeError>
          </div>
        )}
        {vista === "ubicacion" && (
          <div className="capa-lienzo">
            <LimiteDeError nombre="la ubicación">
              <Suspense fallback={<p className="cargando centrado">Levantando el edificio</p>}>
                <Edificio3D
                  unidades={unidades}
                  visibles={todas}
                  nivel={unidad.piso}
                  destacada={unidad.id}
                  onElegir={(u) => navegar(rutaDepto(u.piso, u.id, "ubicacion"))}
                />
              </Suspense>
            </LimiteDeError>
          </div>
        )}
      </div>

      <Encabezado>
        <Link to="/" className="volver">
          <FlechaIzquierda />
          Edificio
        </Link>
      </Encabezado>

      <RielVistas vista={vista} onCambio={(v) => ir(v, v === "360" || v === "recorrido" ? ambienteActual.id : null)} />

      {inmersiva && (
        <>
          {vista === "360" && <div className="velo-360" aria-hidden />}
          <div className="capa rotulo-360">
            <span className="cota">
              {NOMBRE_VISTA[vista]} · Depto {unidad.id} · {String(tip.ambientes.indexOf(ambienteActual) + 1).padStart(2, "0")} /{" "}
              {String(tip.ambientes.length).padStart(2, "0")}
            </span>
            <h2 key={ambienteActual.id}>{ambienteActual.nombre}</h2>
          </div>
          {vista === "360" && (
            <div className="capa brujula" aria-hidden>
              <span style={{ transform: `rotate(${-rumbo}deg)` }} />
            </div>
          )}
        </>
      )}

      <div className="capa barra-inferior">
        {inmersiva && (
          <nav className="ambientes" aria-label="Ambientes">
            {tip.ambientes.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`ambiente${a.id === ambienteActual.id ? " activo" : ""}`}
                aria-pressed={a.id === ambienteActual.id}
                onClick={() => ir(vista, a.id)}
              >
                {a.nombre}
              </button>
            ))}
          </nav>
        )}
        {PISTA[vista] && <p className="pista">{PISTA[vista]}</p>}
      </div>

      <aside className="capa panel">
        <FichaUnidad unidad={unidad} ambienteActivo={vista === "360" ? ambienteActual.id : null} onAmbiente={(id) => ir("360", id)} />
      </aside>
    </div>
  );
}
