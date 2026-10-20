import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

// Visor de panorámicas equirectangulares (2:1), el formato de la cámara
// esférica de V-Ray. La cámara queda en el centro y solo rota.

function Esfera({ url }: { url: string }) {
  const textura = useLoader(THREE.TextureLoader, url);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 96, 64]} />
      <meshBasicMaterial map={textura} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

function ZoomConRueda() {
  const { camera, gl } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const rueda = (e: WheelEvent) => {
      e.preventDefault();
      cam.fov = THREE.MathUtils.clamp(cam.fov + e.deltaY * 0.03, 35, 90);
      cam.updateProjectionMatrix();
    };
    gl.domElement.addEventListener("wheel", rueda, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", rueda);
  }, [camera, gl]);
  return null;
}

/** Informa el rumbo de la cámara en grados (0 = norte de la panorámica). */
function Rumbo({ onRumbo }: { onRumbo?: (grados: number) => void }) {
  const previo = useRef(0);
  const dir = useRef(new THREE.Vector3());
  useFrame(({ camera }) => {
    if (!onRumbo) return;
    camera.getWorldDirection(dir.current);
    const g = THREE.MathUtils.radToDeg(Math.atan2(dir.current.x, -dir.current.z));
    if (Math.abs(g - previo.current) > 0.5) {
      previo.current = g;
      onRumbo(g);
    }
  });
  return null;
}

export function Panorama360({ url, onRumbo }: { url: string; onRumbo?: (grados: number) => void }) {
  return (
    <Canvas camera={{ position: [0, 0, 0.01], fov: 75 }} dpr={[1, 2]}>
      <Suspense
        fallback={
          <Html center>
            <p className="cargando">Cargando 360°</p>
          </Html>
        }
      >
        <Esfera key={url} url={url} />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={-0.35} enableDamping dampingFactor={0.08} target={[0, 0, 0]} />
      <ZoomConRueda />
      <Rumbo onRumbo={onRumbo} />
    </Canvas>
  );
}
