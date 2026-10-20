import { useCallback, useEffect, useState } from "react";
import { Cargador } from "./componentes/Cargador";
import { FichaProyecto } from "./componentes/FichaProyecto";
import { Indice } from "./componentes/Indice";
import { Navegacion } from "./componentes/Navegacion";
import type { Proyecto } from "./datos/proyectos";
import { useCargador } from "./efectos/useCargador";
import { useDesplazamientoSuave } from "./efectos/useDesplazamientoSuave";
import { useProyectoEnUrl } from "./efectos/useProyectoEnUrl";
import { useRevelar } from "./efectos/useRevelar";
import { Contacto } from "./secciones/Contacto";
import { Equipo } from "./secciones/Equipo";
import { Filosofia } from "./secciones/Filosofia";
import { Pie } from "./secciones/Pie";
import { Portada } from "./secciones/Portada";
import { Portafolio } from "./secciones/Portafolio";
import { Servicios } from "./secciones/Servicios";
import { Sobre } from "./secciones/Sobre";

export function App() {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [indice, setIndice] = useState(false);
  const cargador = useCargador();
  useDesplazamientoSuave();
  useRevelar();
  useProyectoEnUrl(proyecto, setProyecto);

  // Con la ficha abierta, la página de atrás no se desplaza.
  useEffect(() => {
    document.body.style.overflow = proyecto ? "hidden" : "";
  }, [proyecto]);

  const cerrarIndice = useCallback(() => setIndice(false), []);
  const cerrarFicha = useCallback(() => setProyecto(null), []);

  return (
    <>
      <Cargador estado={cargador} />
      <Navegacion onAbrirIndice={() => setIndice(true)} />
      <Indice abierto={indice} onCerrar={cerrarIndice} />

      <div id="top">
        <Portada />
        <div>
          <Sobre />
          <Servicios />
          <Filosofia />
          <Equipo />
          <Portafolio onAbrir={setProyecto} />
          <Contacto />
          <Pie />
        </div>
      </div>

      <div className={`project-overlay${proyecto ? " open" : ""}`} id="project-overlay">
        {proyecto && <FichaProyecto proyecto={proyecto} onCerrar={cerrarFicha} onIr={setProyecto} />}
      </div>
    </>
  );
}
