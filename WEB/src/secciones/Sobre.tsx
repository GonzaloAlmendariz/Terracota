import { EncabezadoSeccion } from "../componentes/EncabezadoSeccion";

export function Sobre() {
  return (
    <section id="about" className="section--decorated" data-section-num="01">
      <EncabezadoSeccion indice="01 / Sobre">
        <span>
          Diseño con <em>criterio</em>,
        </span>
        <br />
        <span>
          propósito y <em>carácter</em>.
        </span>
      </EncabezadoSeccion>

      <div className="manifesto">
        <div className="side">
          <div className="eyebrow">Nuestra propuesta</div>
        </div>
        <div className="col">
          <p className="body-copy">
            En nuestro estudio entendemos el diseño como una herramienta para transformar ideas en espacios con propósito. Cada propuesta se desarrolla con responsabilidad, criterio y compromiso.
          </p>
          <p className="body-copy" style={{ marginTop: "1em" }}>
            Creemos en un proceso colaborativo. Nos enfocamos en comprender a profundidad las necesidades de cada cliente, ofreciendo respuestas reales y personalizadas.
          </p>
        </div>
        <div className="col">
          <div className="quote">
            "Diseñamos, proponemos y cuidamos cada detalle — acompañando cada etapa para lograr espacios que no solo se <span>vean bien</span>, sino que se <span>vivan mejor</span>."
          </div>
        </div>
      </div>

      <div className="mision-vision">
        <div className="side">
          <div className="eyebrow">Misión y visión</div>
        </div>
        <div className="mv-grid">
          <div className="mv-card">
            <div className="mv-num mono">01 / Misión</div>
            <p className="mv-body">
              Transformar espacios en experiencias que reflejen la identidad de quien los habita, combinando criterio estético, ejecución impecable y acompañamiento cercano en cada etapa del proceso.
            </p>
          </div>
          <div className="mv-card">
            <div className="mv-num mono">02 / Visión</div>
            <p className="mv-body">
              Ser el estudio de interiorismo de referencia en Lima para proyectos residenciales y corporativos donde el diseño, la materialidad y la confianza importan por igual.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
