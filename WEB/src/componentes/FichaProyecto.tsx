import { useEffect, useState } from "react";
import { TESTIMONIO_PENDIENTE } from "../datos/estudio";
import { PROYECTOS, type Proyecto } from "../datos/proyectos";
import { fotoProyecto, srcSetProyecto } from "../lib/imagenes";

const dos = (n: number) => String(n).padStart(2, "0");
const flecha = { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.4)", color: "#fff" } as const;

export function FichaProyecto({ proyecto, onCerrar, onIr }: { proyecto: Proyecto; onCerrar: () => void; onIr: (p: Proyecto) => void }) {
  const i = PROYECTOS.findIndex((p) => p.id === proyecto.id);
  const siguiente = PROYECTOS[(i + 1) % PROYECTOS.length];
  const anterior = PROYECTOS[(i - 1 + PROYECTOS.length) % PROYECTOS.length];
  const [foto, setFoto] = useState(0);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onCerrar]);
  useEffect(() => setFoto(0), [proyecto.id]);
  const ir = (d: number) => setFoto((s) => (s + d + proyecto.galeria.length) % proyecto.galeria.length);

  return (
    <>
      <button className="project-overlay__close" type="button" onClick={onCerrar} aria-label="Cerrar proyecto">
        Cerrar
        <span className="x" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M1 1 l10 10 M11 1 l-10 10" />
          </svg>
        </span>
      </button>

      <div className="po__hero" style={{ backgroundImage: `url(${fotoProyecto(proyecto.portada, 1600)})` }} role="img" aria-label={`${proyecto.nombre} — ${proyecto.tipo}`}>
        <div style={{ position: "absolute", top: 28, left: 48, right: 48, display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.8)" }} className="mono">
          <span>
            {proyecto.num} / {dos(PROYECTOS.length)}
          </span>
          <span>{proyecto.ubicacion}</span>
        </div>
        <h1>
          Proy.
          <br />
          <em>{proyecto.nombre}</em>
        </h1>
      </div>

      <div className="po__meta">
        {[
          ["Tipo", proyecto.tipo],
          ["Ubicación", proyecto.ubicacion],
          ["Año", proyecto.anio],
          ["Área", proyecto.area],
        ].map(([k, v]) => (
          <div key={k}>
            <div className="eyebrow k">{k}</div>
            <div className="v">{v}</div>
          </div>
        ))}
      </div>

      <div className="po__body">
        <div className="side">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Alcance
          </div>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {proyecto.alcance.map((s) => (
              <li key={s} style={{ fontSize: 13, color: "var(--cream-soft)", display: "flex", gap: 10 }}>
                <span style={{ color: "var(--accent)", fontFamily: "var(--mono)" }}>/</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Problemática
          </div>
          <p className="body-copy">{proyecto.problema}</p>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Propuesta de solución
          </div>
          <p className="body-copy">{proyecto.solucion}</p>
        </div>
      </div>

      <div className="po__testimonial">
        <div className="side">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Testimonio
          </div>
        </div>
        <div>
          {proyecto.testimonio ? (
            <>
              <blockquote className="po__quote">"{proyecto.testimonio.cita}"</blockquote>
              <div className="po__attribution mono">
                — {proyecto.testimonio.autor}
                {proyecto.testimonio.cargo ? `, ${proyecto.testimonio.cargo}` : ""}
              </div>
            </>
          ) : (
            <div className="po__quote po__quote--pending">{TESTIMONIO_PENDIENTE}</div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 48px 60px" }}>
        <div className="eyebrow" style={{ marginBottom: 18, display: "flex", justifyContent: "space-between" }}>
          <span>
            Galería — {dos(foto + 1)} / {dos(proyecto.galeria.length)}
          </span>
          <span>Carrusel</span>
        </div>
        <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16/9", background: "var(--bg-soft)" }}>
          {proyecto.galeria.map((g, n) => (
            <img
              key={g}
              src={fotoProyecto(g, 1600)}
              srcSet={srcSetProyecto(g)}
              sizes="100vw"
              alt={`${proyecto.nombre} — galería ${n + 1}`}
              loading="lazy"
              decoding="async"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: foto === n ? 1 : 0, transform: foto === n ? "scale(1)" : "scale(1.03)", transition: "opacity .7s ease, transform 1.2s ease" }}
            />
          ))}
          <button type="button" onClick={() => ir(-1)} aria-label="Imagen anterior" style={{ ...flecha, left: 20 }}>
            {"<"}
          </button>
          <button type="button" onClick={() => ir(1)} aria-label="Siguiente imagen" style={{ ...flecha, right: 20 }}>
            {">"}
          </button>
          <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
            {proyecto.galeria.map((g, n) => (
              <button key={g} type="button" onClick={() => setFoto(n)} aria-label={`Ir a imagen ${n + 1}`} style={{ width: foto === n ? 28 : 8, height: 2, background: foto === n ? "var(--accent)" : "rgba(255,255,255,0.5)", transition: "all .3s" }} />
            ))}
          </div>
        </div>
      </div>

      <div className="po__footer-nav">
        <button type="button" onClick={() => onIr(anterior)} style={{ textAlign: "left" }} aria-label={`Anterior: ${anterior.nombre}`}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {"<"} Anterior
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 28 }}>
            Proy. <em style={{ fontStyle: "italic", color: "var(--accent-soft)" }}>{anterior.nombre}</em>
          </div>
        </button>
        <button type="button" onClick={() => onIr(siguiente)} style={{ textAlign: "right" }} aria-label={`Siguiente: ${siguiente.nombre}`}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Siguiente {">"}
          </div>
          <div style={{ fontFamily: "var(--display)", fontSize: 28 }}>
            Proy. <em style={{ fontStyle: "italic", color: "var(--accent-soft)" }}>{siguiente.nombre}</em>
          </div>
        </button>
      </div>
    </>
  );
}
