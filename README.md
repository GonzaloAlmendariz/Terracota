# Terracota Studio

Web del estudio y showroom 3D, publicados juntos en GitHub Pages:

- **Web**: https://gonzaloalmendariz.github.io/Terracota/
- **Recorrido virtual**: https://gonzaloalmendariz.github.io/Terracota/showroom/

## Estructura

```
WEB/        Web del estudio — Vite + React + TypeScript, pre-renderizada al compilar
  src/
    secciones/    Portada, Sobre, Servicios, Filosofía, Equipo, Portafolio, Contacto, Pie
    componentes/  Navegación, Índice, Cargador, Ficha de proyecto, Encabezado de sección
    datos/        proyectos.ts, estudio.ts (servicios, principios, equipo), contacto.ts
    efectos/      desplazamiento suave, revelado al hacer scroll, cargador, #proyecto/<id>
    estilos/      un archivo por sección; index.css fija el orden de la cascada
  imagenes/       originales; scripts/optimizar-imagenes.mjs genera los WebP que se sirven
SHOWROOM/   Showroom 3D — edificio, plano, medidas, maqueta, ubicación, recorrido y 360 (ver su README)
marca/      Colores y tipografías de la marca, compartidos por la web y el showroom
scripts/    construir-sitio.mjs (arma _site/), capturas.mjs y comparar-capturas.mjs (QA visual)
```

## Comandos

```bash
pnpm install
pnpm dev                 # web en http://localhost:5173
pnpm dev:showroom        # showroom en http://localhost:5173/showroom/
pnpm build               # arma _site/ igual que GitHub Pages
```

Al hacer push a `main`, el workflow `deploy.yml` corre `pnpm build` y publica `_site/`.

## Cambios frecuentes

- **Un proyecto nuevo**: sus fotos van a `WEB/imagenes/projects/` y su ficha a `WEB/src/datos/proyectos.ts`.
- **Datos de contacto, agenda o formulario**: `WEB/src/datos/contacto.ts`.
- **Colores o tipografías de marca**: `marca/tokens.css`.

## QA visual

```bash
node scripts/capturas.mjs --url <url> --salida qa/capturas/antes
node scripts/capturas.mjs --url <url> --salida qa/capturas/despues
node scripts/comparar-capturas.mjs qa/capturas/antes qa/capturas/despues
```
