import { useEffect } from "react";

// Los bloques .reveal aparecen al entrar en pantalla (la clase .in los muestra).
export function useRevelar() {
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 },
    );
    const t = setTimeout(() => document.querySelectorAll(".reveal").forEach((el) => observador.observe(el)), 200);
    return () => {
      clearTimeout(t);
      observador.disconnect();
    };
  }, []);
}
