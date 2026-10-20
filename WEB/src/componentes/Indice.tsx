import { useEffect } from "react";
import { CORREO, TELEFONO } from "../datos/contacto";

// Índice a pantalla completa. Mientras está abierto la página de atrás no se
// mueve (rueda, trackpad o teclado) y Escape lo cierra.
export function Indice({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  useEffect(() => {
    if (!abierto) return;
    const raiz = document.documentElement;
    raiz.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", tecla);
    return () => {
      raiz.style.overflow = "";
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto, onCerrar]);

  const enlace = (href: string, n: string, contenido: React.ReactNode) => (
    <a href={href} onClick={onCerrar}>
      <span className="n">{n}</span>
      <span>{contenido}</span>
    </a>
  );

  return (
    <div className={`menu-overlay${abierto ? " open" : ""}`} id="menu-overlay" role="dialog" aria-modal="true" aria-label="Índice" aria-hidden={!abierto}>
      <div className="mfooter" style={{ marginBottom: 40 }}>
        <span>Índice</span>
        <button id="btn-menu-close" type="button" onClick={onCerrar}>
          Cerrar ×
        </button>
      </div>
      <div className="menu-list">
        {enlace("#top", "00", "Inicio")}
        {enlace("#about", "01", <>Sobre <em>nosotros</em></>)}
        {enlace("#services", "02", "Servicios")}
        {enlace("#philosophy", "03", "Filosofía")}
        {enlace("#team", "04", <em>Equipo</em>)}
        {enlace("#portfolio", "05", "Portafolio")}
        {enlace("#contact", "06", <em>Contacto</em>)}
        {enlace("showroom/", "3D", <>Recorrido <em>virtual</em></>)}
      </div>
      <div className="mfooter">
        <span>{CORREO}</span>
        <span>{TELEFONO}</span>
        <span>Lima — Perú</span>
      </div>
    </div>
  );
}
