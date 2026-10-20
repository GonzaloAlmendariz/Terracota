import { ESTADOS, formatoPrecio, proyecto, tipologias, type Unidad } from "../lib/datos";

export function EstadoPunto({ unidad }: { unidad: Unidad }) {
  const e = ESTADOS[unidad.estado];
  return (
    <span className="estado">
      <i style={{ background: e.color }} aria-hidden />
      {e.etiqueta}
    </span>
  );
}

interface Props {
  unidad: Unidad;
  ambienteActivo?: string | null;
  onAmbiente: (id: string) => void;
}

export function FichaUnidad({ unidad, ambienteActivo, onAmbiente }: Props) {
  const tip = tipologias[unidad.tipologia];
  const vendido = unidad.estado === "vendido";
  return (
    <section className="ficha" aria-label={`Ficha del departamento ${unidad.id}`}>
      <div className="ficha-cabeza">
        <div className="cota">
          <span>Nivel {String(unidad.piso).padStart(2, "0")}</span>
          <span>{tip?.nombre}</span>
        </div>
        <h1 className="numeral">{unidad.id}</h1>
        <EstadoPunto unidad={unidad} />
      </div>

      <dl className="ficha-datos">
        <div>
          <dt>Área techada</dt>
          <dd>
            {unidad.area_m2.toLocaleString("es-PE", { maximumFractionDigits: 2 })}
            <small>m²</small>
          </dd>
        </div>
        <div>
          <dt>Piso</dt>
          <dd>{unidad.piso}</dd>
        </div>
        <div>
          <dt>Dormitorios</dt>
          <dd>{unidad.dormitorios}</dd>
        </div>
        <div>
          <dt>Baños</dt>
          <dd>{unidad.banos}</dd>
        </div>
      </dl>

      {tip && (
        <div className="ficha-ambientes">
          <span className="cota">Ambientes</span>
          <ol>
            {tip.ambientes.map((a) => (
              <li key={a.id}>
                <button type="button" className={a.id === ambienteActivo ? "activo" : undefined} onClick={() => onAmbiente(a.id)}>
                  {a.nombre}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="ficha-pie">
        <span className="precio-desde">{vendido ? "Estado" : "Precio de lista"}</span>
        <p className="ficha-precio">{vendido ? "Vendido" : formatoPrecio(unidad.precio_usd)}</p>
        <button type="button" className="cta" aria-disabled={vendido} disabled={vendido}>
          <span>{vendido ? "Unidad no disponible" : "Agendar una visita"}</span>
          {!vendido && (
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
              <path d="M1 5h14m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <p className="ficha-aviso">{proyecto.aviso}</p>
      </div>
    </section>
  );
}
