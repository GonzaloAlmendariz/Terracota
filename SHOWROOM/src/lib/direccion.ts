import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

// Toda vista del showroom es enlazable:
//   /                                       edificio
//   /piso/2/depto/201?vista=iso             maqueta inclinada (como Hauzd isPitched=1)
//   /piso/2/depto/201?vista=planta          vista cenital
//   /piso/2/depto/201?vista=360&ambiente=sala

export type Vista = "iso" | "planta" | "360";
const VISTAS: Vista[] = ["iso", "planta", "360"];

export function rutaDepto(piso: number, id: string, vista: Vista = "iso", ambiente?: string): string {
  const q = new URLSearchParams({ vista });
  if (ambiente) q.set("ambiente", ambiente);
  return `/piso/${piso}/depto/${id}?${q}`;
}

export function useVistaDepto() {
  const [params, setParams] = useSearchParams();
  const crudo = params.get("vista");
  const vista: Vista = VISTAS.includes(crudo as Vista) ? (crudo as Vista) : "iso";
  const ambiente = params.get("ambiente");

  const ir = useCallback(
    (siguiente: Vista, siguienteAmbiente?: string | null) => {
      const q = new URLSearchParams({ vista: siguiente });
      if (siguienteAmbiente) q.set("ambiente", siguienteAmbiente);
      setParams(q);
    },
    [setParams],
  );

  return { vista, ambiente, ir };
}
