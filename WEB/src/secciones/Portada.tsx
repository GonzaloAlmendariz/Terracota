import { FOTO_PORTADA } from "../lib/imagenes";

export function Portada() {
  return (
    <section className="hero">
      <div className="hero__img">
        <img src={FOTO_PORTADA.src} srcSet={FOTO_PORTADA.srcSet} sizes="100vw" alt="" decoding="async" />
      </div>
      <div className="hero__content">
        <h1 className="hero__headline">
          Espacios
          <br />
          que se <em>viven</em>
          <br />
          mejor.
        </h1>
        <div className="hero__meta">
          <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
            Interiorismo residencial y comercial · Lima, Perú
          </div>
          <p className="hero__lede">
            Diseñamos casas, departamentos, oficinas y espacios comerciales con criterio, carácter y propósito. Cada proyecto se trabaja como una pieza única — con responsabilidad, proceso y detalle.
          </p>
          <div className="hero__ctas">
            <a href="#portfolio" className="hero__cta">
              Ver portafolio <span className="arr">↗</span>
            </a>
            <a href="showroom/" className="hero__cta hero__cta--ghost">
              Recorrido virtual <span className="arr">↗</span>
            </a>
          </div>
        </div>
      </div>
      <div className="hero__footer">
        <div className="hero__index">
          <div style={{ marginBottom: 6 }}>Índice 01 — 03</div>
          <div style={{ opacity: 0.6 }}>Sobre · Portafolio · Contacto</div>
        </div>
        <a href="#about" className="hero__scroll" aria-label="Ir a Sobre">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" aria-hidden>
            <path d="M12 4v16M6 14l6 6 6-6" />
          </svg>
        </a>
        <div className="hero__index" style={{ textAlign: "right" }}>
          <div style={{ marginBottom: 6 }}>Residencial + Comercial</div>
          <div style={{ opacity: 0.6 }}>Lima · 2024 — 2026</div>
        </div>
      </div>
    </section>
  );
}
