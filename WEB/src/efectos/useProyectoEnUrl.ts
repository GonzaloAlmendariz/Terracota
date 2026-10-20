import { useEffect } from "react";
import { PROYECTOS, type Proyecto } from "../datos/proyectos";

// Cada proyecto abierto tiene su enlace (#proyecto/<id>) para compartirlo, y
// los botones atrás/adelante del navegador abren y cierran la ficha.
const PATRON = /^#proyecto\/([a-z0-9-]+)$/i;
const desdeHash = () => {
  const m = window.location.hash.match(PATRON);
  return m ? (PROYECTOS.find((p) => p.id === m[1]) ?? null) : null;
};

export function useProyectoEnUrl(abierto: Proyecto | null, abrir: (p: Proyecto | null) => void) {
  useEffect(() => {
    const inicial = desdeHash();
    if (inicial) abrir(inicial);
    const alCambiar = () => abrir(desdeHash());
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  }, [abrir]);

  useEffect(() => {
    if (!abierto) {
      if (window.location.hash.startsWith("#proyecto/")) history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }
    const buscado = `#proyecto/${abierto.id}`;
    if (window.location.hash !== buscado) history.replaceState(null, "", buscado);
  }, [abierto]);
}
