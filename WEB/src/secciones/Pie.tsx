import { AGENDA, CORREO, INSTAGRAM, TELEFONO_ENLACE, WHATSAPP } from "../datos/contacto";

export function Pie() {
  return (
    <footer>
      <div className="marquee">
        <div className="track">
          <span>Terracota / Studio / </span>
          <em>Interiorismo</em>
          <span> / Lima — Perú / </span>
          <em>Est. 2021</em>
          <span> / Terracota / Studio / </span>
          <em>Interiorismo</em>
          <span> / Lima — Perú / </span>
        </div>
      </div>
      <div className="col">
        <div className="k eyebrow">Estudio</div>
        <a href="#about">Sobre</a>
        <a href="#services">Servicios</a>
        <a href="#philosophy">Filosofía</a>
        <a href="#team">Equipo</a>
      </div>
      <div className="col">
        <div className="k eyebrow">Trabajo</div>
        <a href="#portfolio">Portafolio</a>
        <a href="#portfolio">Residencial</a>
        <a href="#portfolio">Comercial</a>
        <a href="showroom/">Recorrido virtual</a>
      </div>
      <div className="col">
        <div className="k eyebrow">Contacto</div>
        <a href={`mailto:${CORREO}`}>Email</a>
        <a href={TELEFONO_ENLACE}>Teléfono</a>
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
          WhatsApp ↗
        </a>
        <a href={AGENDA} target="_blank" rel="noopener noreferrer">
          Agenda ↗
        </a>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
          Instagram ↗
        </a>
      </div>
      <div className="legal">
        <span>© 2026 Terracota Studio</span>
        <span>Diseñado en Lima</span>
      </div>
    </footer>
  );
}
