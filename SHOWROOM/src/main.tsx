import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles.css";
import { EdificioPage } from "./routes/EdificioPage";
import { DeptoPage } from "./routes/DeptoPage";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

// Vuelta del 404 de GitHub Pages (ver pages-404.html): ?ruta=piso/2/depto/201?vista=360
const ruta = new URLSearchParams(location.search).get("ruta");
if (ruta !== null) history.replaceState(null, "", `${basename}/${ruta}${location.hash}`);

// Modo demo (VITE_DEMO=1): la navegación vive en memoria, para publicarse
// donde no se controla la URL (Artifact, carpeta suelta, archivo adjunto).
const Enrutador = ({ children }: { children: ReactNode }) =>
  import.meta.env.VITE_DEMO === "1" ? <MemoryRouter>{children}</MemoryRouter> : <BrowserRouter basename={basename}>{children}</BrowserRouter>;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Enrutador>
      <Routes>
        <Route path="/" element={<EdificioPage />} />
        <Route path="/piso/:piso/depto/:depto" element={<DeptoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Enrutador>
  </StrictMode>,
);
