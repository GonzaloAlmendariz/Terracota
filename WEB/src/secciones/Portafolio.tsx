import { useEffect, useRef, useState } from "react";
import { EncabezadoSeccion } from "../componentes/EncabezadoSeccion";
import { PROYECTOS, type Proyecto } from "../datos/proyectos";
import { fotoProyecto, srcSetProyecto } from "../lib/imagenes";

const dos = (n: number) => String(n).padStart(2, "0");
const enfasis = { fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent-soft)" } as const;

export function Portafolio({ onAbrir }: { onAbrir: (p: Proyecto) => void }) {
  return (
    <section id="portfolio" className="section--decorated" data-section-num="05">
      <EncabezadoSeccion
        indice="05 / Portafolio"
        extra={
          <p className="body-copy" style={{ maxWidth: "46ch", fontSize: 15, marginTop: 20 }}>
            Dos líneas de trabajo: <em style={enfasis}>residencial</em> y <em style={enfasis}>comercial</em>. Desliza horizontalmente para recorrer cada proyecto — cada card muestra toda la galería.
          </p>
        }
      >
        <span>
          Proyectos <em>seleccionados</em>.
        </span>
      </EncabezadoSeccion>

      <Carrusel etiqueta="Residencial" proyectos={PROYECTOS.filter((p) => p.linea === "residencial")} onAbrir={onAbrir} />
      <Carrusel etiqueta="Comercial" proyectos={PROYECTOS.filter((p) => p.linea === "comercial")} onAbrir={onAbrir} />
    </section>
  );
}

function Carrusel({ etiqueta, proyectos, onAbrir }: { etiqueta: string; proyectos: Proyecto[]; onAbrir: (p: Proyecto) => void }) {
  const pista = useRef<HTMLDivElement>(null);
  const [avance, setAvance] = useState(0);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const alDesplazar = () => {
      const max = el.scrollWidth - el.clientWidth;
      setAvance(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener("scroll", alDesplazar);
    return () => el.removeEventListener("scroll", alDesplazar);
  }, []);

  const mover = (dir: number) => {
    const el = pista.current;
    if (!el) return;
    const tarjeta = el.querySelector(".pcard");
    const ancho = tarjeta ? tarjeta.getBoundingClientRect().width + 24 : 500;
    el.scrollBy({ left: ancho * dir, behavior: "smooth" });
  };

  return (
    <div className="slider-block reveal">
      <div className="slider-head">
        <div className="slider-label">
          <span className="eyebrow" style={{ color: "var(--accent-soft)" }}>
            // {etiqueta}
          </span>
          <span className="mono" style={{ color: "var(--muted)", marginLeft: 14 }}>
            {dos(proyectos.length)} proyectos
          </span>
        </div>
        <div className="slider-controls">
          <button className="sbtn" type="button" onClick={() => mover(-1)} aria-label={`Anterior — ${etiqueta}`}>
            {"<"}
          </button>
          <div className="sbar">
            <div className="sbar__fill" style={{ transform: `translateX(${avance * 100 - 100}%)` }} />
          </div>
          <button className="sbtn" type="button" onClick={() => mover(1)} aria-label={`Siguiente — ${etiqueta}`}>
            {">"}
          </button>
        </div>
      </div>
      <div className="slider" ref={pista} data-slider="true">
        {proyectos.map((p) => (
          <Tarjeta key={p.id} p={p} onAbrir={onAbrir} />
        ))}
        <TarjetaFinal etiqueta={etiqueta} />
      </div>
    </div>
  );
}

// Al pasar el mouse, la tarjeta recorre la galería del proyecto.
function Tarjeta({ p, onAbrir }: { p: Proyecto; onAbrir: (p: Proyecto) => void }) {
  const [foto, setFoto] = useState(0);
  const [encima, setEncima] = useState(false);

  useEffect(() => {
    if (!encima) {
      setFoto(0);
      return;
    }
    const t = setInterval(() => setFoto((i) => (i + 1) % p.galeria.length), 1400);
    return () => clearInterval(t);
  }, [encima, p.galeria.length]);

  return (
    <button
      type="button"
      className="pcard"
      onClick={() => onAbrir(p)}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      aria-label={`Abrir proyecto ${p.nombre} — ${p.tipo}`}
    >
      <div className="pcard__img">
        {p.galeria.map((g, i) => (
          <img
            key={g}
            className="pcard__frame"
            src={fotoProyecto(g, 800)}
            srcSet={srcSetProyecto(g)}
            sizes="(max-width: 900px) 82vw, 560px"
            alt={`${p.nombre} — imagen ${i + 1} de ${p.galeria.length}`}
            loading="lazy"
            decoding="async"
            style={{ opacity: foto === i ? 1 : 0 }}
          />
        ))}
        <div className="pcard__num">{p.num}</div>
        <div className="pcard__dots" aria-hidden="true">
          {p.galeria.map((g, i) => (
            <span key={g} className={`pcard__dot ${foto === i ? "on" : ""}`} />
          ))}
        </div>
        <div className="pcard__open">Abrir ↗</div>
      </div>
      <div className="pcard__meta">
        <div className="pcard__name">
          Proy. <em>{p.nombre}</em>
        </div>
        <div className="pcard__info">
          <span>{p.tipo}</span>
          <span>{p.ubicacion}</span>
          <span>
            {p.anio}
            {p.area && p.area !== "—" ? ` / ${p.area}` : ""}
          </span>
        </div>
      </div>
    </button>
  );
}

function TarjetaFinal({ etiqueta }: { etiqueta: string }) {
  return (
    <div className="pcard pcard--end">
      <div className="pcard__end">
        <div className="eyebrow" style={{ color: "var(--accent-soft)", marginBottom: 16 }}>
          Fin del carrusel
        </div>
        <div style={{ fontFamily: "var(--display)", fontSize: 40, lineHeight: 0.95, textTransform: "uppercase", marginBottom: 20 }}>
          Tu próximo
          <br />
          <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent-soft)" }}>proyecto {etiqueta.toLowerCase()}</em>.
        </div>
        <a href="#contact" className="hero__cta" style={{ background: "var(--accent)", color: "#fff" }}>
          Conversemos <span className="arr">↗</span>
        </a>
      </div>
    </div>
  );
}
