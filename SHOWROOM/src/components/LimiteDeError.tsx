import { Component, type ReactNode } from "react";

// Si una vista falla, se cae sólo esa vista: el resto de la página (ficha,
// riel, encabezado) sigue funcionando y se ofrece reintentar.

interface Props {
  nombre: string;
  children: ReactNode;
}

export class LimiteDeError extends Component<Props, { error: boolean }> {
  state = { error: false };

  static getDerivedStateFromError() {
    return { error: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`La vista «${this.props.nombre}» no pudo mostrarse:`, error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="vista-fallida" role="alert">
        <p className="cota">No se pudo cargar {this.props.nombre}</p>
        <p>Puede ser la conexión o una versión nueva del sitio.</p>
        <button type="button" className="volver" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }
}
