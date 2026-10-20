import { EncabezadoSeccion } from "../componentes/EncabezadoSeccion";
import { SERVICIOS } from "../datos/estudio";

export function Servicios() {
  return (
    <section id="services" className="section--decorated" data-section-num="02">
      <EncabezadoSeccion indice="02 / Servicios">
        <span>
          Lo que <em>hacemos</em>.
        </span>
      </EncabezadoSeccion>
      <div className="services">
        <div className="services__list">
          {SERVICIOS.map((s) => (
            <div key={s.n} className="service-row reveal">
              <div className="n mono">[ {s.n} ]</div>
              <div className="t">{s.t}</div>
              <div className="k">{s.k}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
