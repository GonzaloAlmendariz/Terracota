import { EncabezadoSeccion } from "../componentes/EncabezadoSeccion";
import { PRINCIPIOS } from "../datos/estudio";

export function Filosofia() {
  return (
    <section id="philosophy" className="section--decorated" data-section-num="03">
      <EncabezadoSeccion indice="03 / Filosofía">
        <span>
          Tres <em>principios</em>
        </span>
        <br />
        <span>que guían el estudio.</span>
      </EncabezadoSeccion>
      <div className="philosophy">
        <div className="side">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Marco de trabajo
          </div>
          <p className="body-copy" style={{ fontSize: 13 }}>
            Trabajamos alrededor de tres principios que atraviesan todos nuestros proyectos, residenciales o comerciales.
          </p>
        </div>
        <div className="principles">
          {PRINCIPIOS.map((p) => (
            <div key={p.n} className="principle reveal">
              <div>
                <div className="num">{p.n}</div>
                <div className="ttl">{p.t}</div>
                <div className="desc">{p.d}</div>
                <div className="principle__swatches" aria-hidden="true">
                  {p.muestras.map((m) => (
                    <div key={m.nombre} className="swatch" title={m.nombre}>
                      <span className="swatch__chip" style={{ background: m.color }} />
                      <span className="swatch__label mono">{m.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glyph">{p.g}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
