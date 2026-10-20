import { useEffect, useState } from "react";

export type EstadoCargador = "visible" | "saliendo" | "oculto";

// El cargador se desvanece 1.4 s después de que carga la página y desaparece
// del todo a los 2.3 s, como en la versión original.
export function useCargador(): EstadoCargador {
  const [estado, setEstado] = useState<EstadoCargador>("visible");
  useEffect(() => {
    const tiempos: number[] = [];
    const alCargar = () => {
      tiempos.push(window.setTimeout(() => setEstado("saliendo"), 1400));
      tiempos.push(window.setTimeout(() => setEstado("oculto"), 2300));
    };
    if (document.readyState === "complete") alCargar();
    else window.addEventListener("load", alCargar, { once: true });
    return () => {
      window.removeEventListener("load", alCargar);
      tiempos.forEach(clearTimeout);
    };
  }, []);
  return estado;
}
