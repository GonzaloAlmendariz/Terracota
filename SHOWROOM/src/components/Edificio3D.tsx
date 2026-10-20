import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Edges, Html, OrbitControls } from "@react-three/drei";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { COLOR_ESTADO_3D, ESTADOS, formatoArea, proyecto, type Unidad } from "../lib/datos";

// Volumetría del edificio generada desde los datos: un bloque por departamento,
// coloreado por estado, con losas y aristas finas como en una maqueta de
// arquitectura. Cuando exista el modelo exterior del cliente, esta volumetría
// queda como capa de selección sobre él.

// Planta tipo de 2×2 departamentos por nivel: la volumetría lee como torre.
const COLUMNAS = 2;
const FILAS = Math.ceil(proyecto.deptosPorPiso / COLUMNAS);
const ANCHO = 2.7;
const FONDO = 2.9;
const ALTO_PISO = 1.3;
const LOSA = 0.09;
const SEP = 0.05;
const ANCHO_TOTAL = COLUMNAS * (ANCHO + SEP) - SEP;
const FONDO_TOTAL = FILAS * (FONDO + SEP) - SEP;

interface Props {
  unidades: Unidad[];
  visibles: Set<string>;
  nivel: number | null;
  onElegir: (u: Unidad) => void;
}

const yPiso = (piso: number) => (piso - 1) * (ALTO_PISO + LOSA) + LOSA;

function celda(u: Unidad) {
  const n = Number(u.id.slice(-2)) - 1;
  const col = n % COLUMNAS;
  const fila = Math.floor(n / COLUMNAS);
  return {
    col,
    fila,
    pos: [
      (col - (COLUMNAS - 1) / 2) * (ANCHO + SEP),
      yPiso(u.piso) + ALTO_PISO / 2,
      (fila - (FILAS - 1) / 2) * (FONDO + SEP),
    ] as [number, number, number],
  };
}

/** Mamparas en las caras exteriores de cada departamento. */
// Los disponibles tienen "la luz encendida": el estado se lee también de noche.
function Mamparas({ col, fila, activo, encendida }: { col: number; fila: number; activo: boolean; encendida: boolean }) {
  const sx = col === 0 ? -1 : 1;
  const sz = fila === 0 ? -1 : 1;
  const material = (
    <meshStandardMaterial
      color={encendida ? "#4a3626" : "#22201d"}
      emissive={encendida ? "#f3b77f" : "#000000"}
      emissiveIntensity={encendida && activo ? 0.22 : 0}
      metalness={0.55}
      roughness={0.1}
      transparent
      opacity={activo ? 0.86 : 0.1}
    />
  );
  return (
    <>
      <mesh position={[0, 0.04, sz * (FONDO / 2 + 0.012)]}>
        <boxGeometry args={[ANCHO * 0.82, ALTO_PISO * 0.66, 0.02]} />
        {material}
      </mesh>
      <mesh position={[sx * (ANCHO / 2 + 0.012), 0.04, 0]}>
        <boxGeometry args={[0.02, ALTO_PISO * 0.66, FONDO * 0.7]} />
        {material}
      </mesh>
    </>
  );
}

function Bloque({ u, activo, onElegir }: { u: Unidad; activo: boolean; onElegir: (u: Unidad) => void }) {
  const [encima, setEncima] = useState(false);
  // Maqueta de yeso: el estado tiñe el cuerpo, no lo pinta.
  const color = useMemo(() => new THREE.Color("#e2d9cb").lerp(new THREE.Color(COLOR_ESTADO_3D[u.estado]), 0.42), [u.estado]);
  const { col, fila, pos } = celda(u);
  return (
    <mesh
      position={pos}
      castShadow
      receiveShadow
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setEncima(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setEncima(false);
        document.body.style.cursor = "";
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onElegir(u);
      }}
    >
      <boxGeometry args={[ANCHO, ALTO_PISO, FONDO]} />
      <meshStandardMaterial
        color={encima ? "#d48b6e" : color}
        emissive={encima ? "#b4563a" : "#000000"}
        emissiveIntensity={encima ? 0.25 : 0}
        roughness={0.82}
        metalness={0}
        transparent
        opacity={activo ? 0.96 : 0.12}
        depthWrite={activo}
      />
      <Mamparas col={col} fila={fila} activo={activo} encendida={u.estado === "disponible"} />
      <Edges threshold={15} color={activo ? "#efe8dd" : "#5a524a"} lineWidth={activo ? 1 : 0.5} transparent opacity={activo ? 0.35 : 0.2} />
      {encima && (
        <Html center position={[0, ALTO_PISO * 0.95, 0]} style={{ pointerEvents: "none" }} zIndexRange={[20, 10]}>
          <div className="etiqueta-3d">
            <strong>{u.id}</strong>
            <span>
              {ESTADOS[u.estado].etiqueta} · {formatoArea(u.area_m2)}
            </span>
          </div>
        </Html>
      )}
    </mesh>
  );
}

function Losas() {
  return (
    <>
      {Array.from({ length: proyecto.pisos + 1 }, (_, i) => (
        <mesh key={i} position={[0, i * (ALTO_PISO + LOSA) + LOSA / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[ANCHO_TOTAL + 0.34, LOSA, FONDO_TOTAL + 0.34]} />
          <meshStandardMaterial color="#cfc4b2" roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}

export function Edificio3D({ unidades, visibles, nivel, onElegir }: Props) {
  const alto = proyecto.pisos * (ALTO_PISO + LOSA);
  const estrecho = typeof window !== "undefined" && window.innerWidth < 760;
  const objetivo = nivel ? yPiso(nivel) + ALTO_PISO / 2 : alto / 2;
  return (
    <Canvas shadows camera={{ position: estrecho ? [-17, alto * 1.0, 19] : [-20, alto * 1.05, 23], fov: estrecho ? 36 : 26 }} dpr={[1, 2]}>
      <fog attach="fog" args={["#0f0c09", 38, 75]} />
      <hemisphereLight args={["#f3ebdf", "#1c1612", 0.75]} />
      <directionalLight position={[-7, 14, 9]} intensity={2.1} color="#fff1e2" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={12} shadow-camera-bottom={-4} shadow-bias={-0.0004} />
      <directionalLight position={[9, 4, -6]} intensity={0.35} color="#d48b6e" />
      <group position={estrecho ? [0, 0, 0] : [2.2, 0, 1.4]}>
        <Losas />
        {unidades.map((u) => (
          <Bloque key={u.id} u={u} activo={visibles.has(u.id)} onElegir={onElegir} />
        ))}
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[14, 64]} />
          <meshStandardMaterial color="#17120e" roughness={1} />
        </mesh>
        <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={24} blur={2.6} far={8} color="#000000" />
      </group>
      <OrbitControls target={estrecho ? [0, objetivo + 0.9, 0] : [2.2, objetivo, 1.4]} minDistance={9} maxDistance={36} maxPolarAngle={Math.PI / 2.08} enablePan={false} enableDamping dampingFactor={0.07} autoRotate={!nivel} autoRotateSpeed={0.25} />
    </Canvas>
  );
}
