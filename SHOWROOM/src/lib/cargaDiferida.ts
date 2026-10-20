import { lazy, type LazyExoticComponent } from "react";

// Las vistas pesadas se cargan al pedirlas. Si su archivo ya no existe —la
// página quedó abierta mientras se publicaba una versión nueva, con otros
// nombres de archivo— se recarga la página una sola vez para tomar la nueva.
// Si vuelve a fallar, el error sube al LimiteDeError de la vista.

const CLAVE = "showroom:recargado-por-carga";

/** El tipo de componente que acepta React.lazy, tomado de su propia firma. */
type Diferible = Awaited<ReturnType<Parameters<typeof lazy>[0]>>["default"];

export function lazyConRecarga<T extends Diferible>(cargar: () => Promise<{ default: T }>): LazyExoticComponent<T> {
  return lazy<T>(async () => {
    try {
      const modulo = await cargar();
      try {
        sessionStorage.removeItem(CLAVE);
      } catch {
        /* sin almacenamiento: no hay marca que limpiar */
      }
      return modulo;
    } catch (error) {
      let yaRecargo = false;
      try {
        yaRecargo = sessionStorage.getItem(CLAVE) === "1";
        if (!yaRecargo) sessionStorage.setItem(CLAVE, "1");
      } catch {
        yaRecargo = true; // sin almacenamiento no se puede evitar un bucle de recargas
      }
      if (!yaRecargo) {
        window.location.reload();
        return new Promise<never>(() => {}); // la recarga reemplaza la página
      }
      throw error;
    }
  });
}
