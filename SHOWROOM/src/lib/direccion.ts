import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

// Toda vista del showroom es enlazable:
//   /                                          edificio
//   /piso/2/depto/201?vista=plano              plano cenital con áreas
//   /piso/2/depto/201?vista=medidas            plano con cotas
//   /piso/2/depto/201?vista=maqueta            maqueta 3D inclinada (Hauzd isPitched=1)
//   /piso/2/depto/201?vista=ubicacion          el depto dentro del edificio
//   /piso/2/depto/201?vista=recorrido          caminar a la altura de los ojos
//   /piso/2/depto/201?vista=360&ambiente=sala  panorámica del ambiente

export type Vista = "plano" | "medidas" | "maqueta" | "ubicacion" | "recorrido" | "360";
export const VISTAS: Vista[] = ["plano", "medidas", "maqueta", "ubicacion", "recorrido", "360"];

/** Vistas que comparten la escena de la maqueta (sólo cambia la cámara). */
export type VistaMaqueta = "plano" | "medidas" | "maqueta";
export const esVistaMaqueta = (v: Vista): v is VistaMaqueta => v === "plano" || v === "medidas" || v === "maqueta";

// Nombres anteriores que pueden estar en enlaces ya compartidos.
const ALIAS: Record<string, Vista> = { iso: "maqueta", planta: "plano" };

export function leerVista(crudo: string | null): Vista {
  if (!crudo) return "maqueta";
  if (crudo in ALIAS) return ALIAS[crudo];
  return VISTAS.includes(crudo as Vista) ? (crudo as Vista) : "maqueta";
}

export function rutaDepto(piso: number, id: string, vista: Vista = "maqueta", ambiente?: string): string {
  const q = new URLSearchParams({ vista });
  if (ambiente) q.set("ambiente", ambiente);
  return `/piso/${piso}/depto/${id}?${q}`;
}

export function useVistaDepto() {
  const [params, setParams] = useSearchParams();
  const vista = leerVista(params.get("vista"));
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
