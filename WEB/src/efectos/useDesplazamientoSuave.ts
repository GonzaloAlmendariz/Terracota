import { useEffect } from "react";

// Desplazamiento inercial con la rueda del mouse (sólo con puntero fino).
// Deja pasar la rueda a lo que se desplaza por su cuenta: los carruseles, la
// ficha de proyecto y el índice. Los enlaces #seccion viajan con la misma inercia.
const PROPIOS = "[data-slider], .project-overlay, .menu-overlay";

export function useDesplazamientoSuave() {
  useEffect(() => {
    if (matchMedia("(hover: none)").matches) return;
    let destino = window.scrollY;
    let actual = window.scrollY;
    let cuadro: number | null = null;
    const suavizado = 0.18;

    const paso = () => {
      actual += (destino - actual) * suavizado;
      if (Math.abs(destino - actual) < 0.5) {
        actual = destino;
        window.scrollTo(0, actual);
        cuadro = null;
        return;
      }
      window.scrollTo(0, actual);
      cuadro = requestAnimationFrame(paso);
    };
    const arrancar = () => {
      if (cuadro === null) cuadro = requestAnimationFrame(paso);
    };

    const rueda = (e: WheelEvent) => {
      if ((e.target as Element).closest?.(PROPIOS) || e.ctrlKey) return;
      e.preventDefault();
      destino = Math.max(0, Math.min(document.documentElement.scrollHeight - window.innerHeight, destino + e.deltaY * 1.15));
      arrancar();
    };
    const scroll = () => {
      if (cuadro === null) destino = actual = window.scrollY;
    };
    const tamano = () => {
      destino = actual = window.scrollY;
    };
    const clic = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#"]');
      const id = a?.getAttribute("href");
      if (!id || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      destino = el.getBoundingClientRect().top + window.scrollY;
      arrancar();
    };

    window.addEventListener("wheel", rueda, { passive: false });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", tamano);
    document.addEventListener("click", clic);
    return () => {
      window.removeEventListener("wheel", rueda);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", tamano);
      document.removeEventListener("click", clic);
      if (cuadro !== null) cancelAnimationFrame(cuadro);
    };
  }, []);
}
