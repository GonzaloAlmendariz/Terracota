import { useLayoutEffect, useRef, useState } from "react";

interface Opcion<T extends string> {
  id: T;
  etiqueta: string;
}

// Control segmentado con un indicador que se desliza bajo la opción activa.
export function Segmentado<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
}: {
  opciones: Opcion<T>[];
  valor: T;
  onCambio: (id: T) => void;
  etiqueta: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [caja, setCaja] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const medir = () => {
      const b = refs.current[valor];
      if (b) setCaja({ x: b.offsetLeft, w: b.offsetWidth });
    };
    medir();
    document.fonts?.ready.then(medir);
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [valor]);

  return (
    <div className="segmentado" role="tablist" aria-label={etiqueta}>
      {caja && <span className="indicador" style={{ width: caja.w, transform: `translateX(${caja.x}px)`, left: 0 }} aria-hidden />}
      {opciones.map((o) => (
        <button
          key={o.id}
          ref={(el) => {
            refs.current[o.id] = el;
          }}
          type="button"
          role="tab"
          aria-selected={valor === o.id}
          className={`segmento${valor === o.id ? " activo" : ""}`}
          onClick={() => onCambio(o.id)}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
