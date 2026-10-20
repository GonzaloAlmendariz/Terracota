import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./estilos/index.css";

const raiz = document.getElementById("raiz")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// En producción el HTML ya viene pre-renderizado (scripts/prerenderizar.mjs):
// React sólo lo hidrata. En desarrollo la raíz llega vacía y se renderiza.
if (raiz.firstElementChild) hydrateRoot(raiz, app);
else createRoot(raiz).render(app);
