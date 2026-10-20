# Showroom 3D · Terracota Studio

Edificio navegable, maqueta de cada departamento y recorrido 360° por ambiente.
Vite + React + TypeScript + Three.js (react-three-fiber). Hoy corre con modelo y
datos **de prueba**.

## Comandos

```bash
pnpm install
pnpm dev                 # http://localhost:5173/showroom/
pnpm build               # dist/ para GitHub Pages (lo hace el workflow)
pnpm demo                # dist-demo/: versión autocontenida para compartir
pnpm modelo:prueba       # regenera public/modelos/*.glb
pnpm 360:prueba          # regenera public/360/prueba/*.png
pnpm unidades -- archivo.xlsx   # Excel del cliente → data/unidades.json
pnpm unidades -- --plantilla    # escribe data/plantilla-unidades.xlsx
```

## Direcciones (toda vista es enlazable)

| Vista | URL |
|---|---|
| Edificio | `/showroom/` · filtros `?estado=disponible&nivel=3` |
| Maqueta | `/showroom/piso/2/depto/201?vista=iso` |
| Planta | `/showroom/piso/2/depto/201?vista=planta` |
| 360 | `/showroom/piso/2/depto/201?vista=360&ambiente=sala` |

## Qué reemplaza al material de prueba

1. **Modelo por tipología** (`public/modelos/<tipo>.glb`): exportar desde
   SketchUp a FBX/glTF, abrir en Blender, hornear la luz y exportar `.glb`.
   Cada ambiente es un grupo llamado `ambiente:<id>` (o `ambiente-<id>`,
   `ambiente_<id>`) con su piso y mobiliario; el `<id>` debe coincidir con
   `data/unidades.json`. Muros cortados a ~2.5 m, sin techo. Unidades en metros.
2. **Panorámicas** (`public/360/<tipo>/<ambiente>.jpg`): cámara esférica de
   V-Ray, 2:1 (6000×3000 o más), a 1.55 m de altura, exportadas a JPG/WebP.
3. **Unidades**: el Excel del cliente con las columnas de
   `data/plantilla-unidades.xlsx`; el script valida estados y tipologías.

Los `.skp`, EXR y renders originales no entran a git (ver `.gitignore`).
