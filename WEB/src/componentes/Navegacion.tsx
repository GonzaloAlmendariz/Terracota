export function Navegacion({ onAbrirIndice }: { onAbrirIndice: () => void }) {
  return (
    <nav className="nav">
      <a href="#top" className="nav__brand">
        <span className="brand-iso">T</span>
        <span className="brand-wm">
          Terracota <em>Studio</em>
        </span>
      </a>
      <div className="nav__links">
        <a href="#about">Sobre</a>
        <a href="#services">Servicios</a>
        <a href="#team">Equipo</a>
        <a href="#portfolio">Portafolio</a>
        <a href="showroom/" className="nav__tour">
          Recorrido virtual
        </a>
        <a href="#contact">Contacto</a>
      </div>
      <button className="nav__menu" id="btn-menu" type="button" onClick={onAbrirIndice} aria-haspopup="dialog">
        <span className="dot" />
        <span>Menú / ES</span>
      </button>
    </nav>
  );
}
