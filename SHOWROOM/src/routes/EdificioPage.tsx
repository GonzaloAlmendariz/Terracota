import { lazy, Suspense, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Encabezado } from "../components/Encabezado";
import { EstadoPunto } from "../components/FichaUnidad";
import { ESTADOS, formatoArea, formatoPrecio, proyecto, unidades, type Estado, type Unidad } from "../lib/datos";
import { rutaDepto } from "../lib/direccion";

const Edificio3D = lazy(() => import("../components/Edificio3D").then((m) => ({ default: m.Edificio3D })));

const FILTROS: { id: Estado | "todos"; etiqueta: string }[] = [
  { id: "todos", etiqueta: "Todos" },
  ...(Object.keys(ESTADOS) as Estado[]).map((id) => ({ id, etiqueta: ESTADOS[id].etiqueta })),
];

const pisos = Array.from({ length: proyecto.pisos }, (_, i) => i + 1);

export function EdificioPage() {
  const navegar = useNavigate();
  const [params, setParams] = useSearchParams();
  const crudoEstado = params.get("estado");
  const filtro: Estado | "todos" = crudoEstado && crudoEstado in ESTADOS ? (crudoEstado as Estado) : "todos";
  const nivel = Number(params.get("nivel")) || null;

  const cambiar = (clave: string, valor: string | null) => {
    const q = new URLSearchParams(params);
    if (valor) q.set(clave, valor);
    else q.delete(clave);
    setParams(q, { replace: true });
  };

  const visibles = useMemo(
    () => unidades.filter((u) => (filtro === "todos" || u.estado === filtro) && (!nivel || u.piso === nivel)),
    [filtro, nivel],
  );
  const idsVisibles = useMemo(() => new Set(visibles.map((u) => u.id)), [visibles]);
  const conteo = useMemo(() => {
    const c: Record<string, number> = { todos: unidades.length };
    for (const u of unidades) c[u.estado] = (c[u.estado] ?? 0) + 1;
    return c;
  }, []);
  const libresPorPiso = useMemo(() => {
    const c = new Map<number, number>();
    for (const u of unidades) if (u.estado === "disponible") c.set(u.piso, (c.get(u.piso) ?? 0) + 1);
    return c;
  }, []);
  const desde = useMemo(() => {
    const precios = unidades.filter((u) => u.estado === "disponible").map((u) => u.precio_usd);
    return precios.length ? Math.min(...precios) : null;
  }, []);
  const grupos = useMemo(() => {
    const m = new Map<number, Unidad[]>();
    for (const u of [...visibles].sort((a, b) => b.piso - a.piso || a.id.localeCompare(b.id))) {
      m.set(u.piso, [...(m.get(u.piso) ?? []), u]);
    }
    return [...m.entries()];
  }, [visibles]);

  const elegir = (u: Unidad) => navegar(rutaDepto(u.piso, u.id));

  return (
    <div className="pantalla">
      <div className="lienzo">
        <Suspense fallback={<p className="cargando centrado">Levantando el edificio</p>}>
          <Edificio3D unidades={unidades} visibles={idsVisibles} nivel={nivel} onElegir={elegir} />
        </Suspense>
      </div>

      <Encabezado />

      <section className="capa portada" aria-label="Proyecto">
        <span className="cota">{proyecto.distrito} · Residencial</span>
        <h1>
          Vivir en <em>{proyecto.nombre}</em>
        </h1>
        <p>Recorre el edificio, elige tu departamento y entra a cada ambiente en 360°.</p>
        <dl className="resumen">
          <div>
            <dt>Niveles</dt>
            <dd>{String(proyecto.pisos).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Disponibles</dt>
            <dd>{String(conteo.disponible ?? 0).padStart(2, "0")}</dd>
          </div>
          {desde && (
            <div>
              <dt>Desde</dt>
              <dd>{formatoPrecio(desde)}</dd>
            </div>
          )}
        </dl>
      </section>

      <nav className="capa niveles" aria-label="Niveles">
        <button type="button" className={`nivel${!nivel ? " activo" : ""}`} onClick={() => cambiar("nivel", null)}>
          <span>Todo</span>
          <span className="raya" />
          <span />
        </button>
        {pisos.map((p) => (
          <button
            key={p}
            type="button"
            className={`nivel${nivel === p ? " activo" : ""}`}
            aria-pressed={nivel === p}
            onClick={() => cambiar("nivel", nivel === p ? null : String(p))}
          >
            <span>N{String(p).padStart(2, "0")}</span>
            <span className="raya" />
            <span className="libres">{libresPorPiso.get(p) ?? 0} libres</span>
          </button>
        ))}
      </nav>

      <aside className="capa panel" aria-label="Departamentos">
        <div className="panel-cabeza">
          <h2>
            Departamentos <span className="cota">{visibles.length} de {unidades.length}</span>
          </h2>
          <div className="filtros" role="radiogroup" aria-label="Filtrar por estado">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={filtro === f.id}
                className={`filtro${filtro === f.id ? " activo" : ""}`}
                onClick={() => cambiar("estado", f.id === "todos" ? null : f.id)}
              >
                {f.id !== "todos" && <i style={{ background: ESTADOS[f.id].color }} aria-hidden />}
                {f.etiqueta}
                <span className="cuenta">{conteo[f.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
        {grupos.length === 0 ? (
          <p className="vacio">
            Ningún departamento {filtro !== "todos" ? ESTADOS[filtro].etiqueta.toLowerCase() : ""}
            {nivel ? ` en el nivel ${nivel}` : ""}.
          </p>
        ) : (
          <ul className="lista">
            {grupos.map(([piso, us]) => (
              <li key={piso}>
                <div className="grupo-piso">
                  <span>Nivel {String(piso).padStart(2, "0")}</span>
                  <span>{us.length} unid.</span>
                </div>
                <ul className="lista-anidada" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {us.map((u) => (
                    <li key={u.id}>
                      <button type="button" className="fila" onClick={() => elegir(u)}>
                        <span className="fila-id">{u.id}</span>
                        <span className="fila-datos">
                          {formatoArea(u.area_m2)} · {u.dormitorios} dorm. · {u.banos} baños
                        </span>
                        <span className="fila-flecha" aria-hidden>
                          →
                        </span>
                        <span className="fila-pie">
                          <EstadoPunto unidad={u} />
                          <span className="fila-precio">{u.estado === "vendido" ? "—" : formatoPrecio(u.precio_usd)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
