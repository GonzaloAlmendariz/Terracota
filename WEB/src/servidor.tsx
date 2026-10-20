import { renderToString } from "react-dom/server";
import { App } from "./App";

// Entrada para pre-renderizar la página al compilar (scripts/prerenderizar.mjs).
export function render(): string {
  return renderToString(<App />);
}
