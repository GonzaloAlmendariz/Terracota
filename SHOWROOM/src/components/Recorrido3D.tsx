import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Html, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Ambiente } from "../lib/datos";

// Recorrido a pie dentro del modelo, a la altura de los ojos.
//   arrastrar          mirar alrededor
//   tocar el piso      caminar hasta ese punto
//   W A S D / flechas  avanzar, retroceder y girar
// Los muros, muebles y vidrios bloquean el paso.

const ALTO_OJOS = 1.55;
const ALTO_TECHO = 2.5;
const VELOCIDAD = 1.8; // m/s
const RADIO_CUERPO = 0.28;
const PATRON_AMBIENTE = /^ambiente[:_-](.+)$/i;

interface Props {
  modelo: string;
  ambientes: Ambiente[];
  /** Ambiente al que saltar; cambia cuando se elige otro desde la interfaz. */
  ambiente: string;
}

function nombreDe(o: THREE.Object3D) {
  return (o.userData.name as string | undefined) ?? o.name;
}

function Caminante({ modelo, ambientes, ambiente }: Props) {
  const { scene } = useGLTF(modelo);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);

  const { raiz, centros, caja, obstaculos } = useMemo(() => {
    const raiz = scene.clone(true);
    const centros = new Map<string, THREE.Vector3>();
    const obstaculos: THREE.Object3D[] = [];
    raiz.traverse((o) => {
      const id = PATRON_AMBIENTE.exec(nombreDe(o))?.[1];
      if (id) centros.set(id, new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()));
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        // Lo que se levanta del piso estorba; el piso mismo no.
        const c = new THREE.Box3().setFromObject(o);
        if (c.max.y > 0.12) obstaculos.push(o);
      }
    });
    const caja = new THREE.Box3().setFromObject(raiz);
    return { raiz, centros, caja, obstaculos };
  }, [scene]);

  const yaw = useRef(0);
  const pitch = useRef(-0.08);
  const destino = useRef<THREE.Vector3 | null>(null);
  const teclas = useRef(new Set<string>());
  const [marca, setMarca] = useState<THREE.Vector3 | null>(null);

  // Saltar al ambiente elegido, mirando hacia su rumbo.
  useEffect(() => {
    const c = centros.get(ambiente);
    if (!c) return;
    const rumbo = ambientes.find((a) => a.id === ambiente)?.rumbo ?? 0;
    camera.position.set(c.x, ALTO_OJOS, c.z);
    yaw.current = -THREE.MathUtils.degToRad(rumbo);
    pitch.current = -0.08;
    destino.current = null;
  }, [ambiente, centros, ambientes, camera]);

  useEffect(() => {
    camera.fov = 72;
    camera.near = 0.05;
    camera.updateProjectionMatrix();
  }, [camera]);

  // Mirar arrastrando; un toque sin arrastre se interpreta como «ir ahí».
  const arrastre = useRef({ activo: false, x: 0, y: 0, movido: 0 });
  useEffect(() => {
    const el = gl.domElement;
    const abajo = (e: PointerEvent) => {
      arrastre.current = { activo: true, x: e.clientX, y: e.clientY, movido: 0 };
      el.setPointerCapture(e.pointerId);
    };
    const mover = (e: PointerEvent) => {
      const a = arrastre.current;
      if (!a.activo) return;
      const dx = e.clientX - a.x;
      const dy = e.clientY - a.y;
      a.movido += Math.abs(dx) + Math.abs(dy);
      a.x = e.clientX;
      a.y = e.clientY;
      yaw.current += dx * 0.0045;
      pitch.current = THREE.MathUtils.clamp(pitch.current + dy * 0.0035, -1.2, 1.2);
    };
    const arriba = () => {
      arrastre.current.activo = false;
    };
    const tecla = (e: KeyboardEvent, on: boolean) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
        if (on) teclas.current.add(k);
        else teclas.current.delete(k);
      }
    };
    const kd = (e: KeyboardEvent) => tecla(e, true);
    const ku = (e: KeyboardEvent) => tecla(e, false);
    el.addEventListener("pointerdown", abajo);
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerup", arriba);
    el.addEventListener("pointercancel", arriba);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      el.removeEventListener("pointerdown", abajo);
      el.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerup", arriba);
      el.removeEventListener("pointercancel", arriba);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [gl]);

  const rayo = useMemo(() => new THREE.Raycaster(), []);
  const bloqueado = (desde: THREE.Vector3, paso: THREE.Vector3) => {
    const largo = paso.length();
    if (largo === 0) return false;
    const dir = paso.clone().normalize();
    for (const alto of [0.35, 1.1]) {
      rayo.set(new THREE.Vector3(desde.x, alto, desde.z), dir);
      rayo.far = largo + RADIO_CUERPO;
      if (rayo.intersectObjects(obstaculos, false).length) return true;
    }
    return false;
  };

  useFrame((_, dt) => {
    // La cámara por defecto nace con lookAt, que le deja rodadura: se fija en 0.
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    const pos = camera.position;
    const paso = new THREE.Vector3();
    const t = teclas.current;
    const adelante = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    if (t.has("w") || t.has("arrowup")) paso.add(adelante);
    if (t.has("s") || t.has("arrowdown")) paso.sub(adelante);
    if (t.has("a")) paso.add(new THREE.Vector3(-adelante.z, 0, adelante.x).negate());
    if (t.has("d")) paso.add(new THREE.Vector3(-adelante.z, 0, adelante.x));
    if (t.has("arrowleft")) yaw.current += 1.6 * dt;
    if (t.has("arrowright")) yaw.current -= 1.6 * dt;

    if (paso.lengthSq() > 0) {
      destino.current = null;
      paso.normalize().multiplyScalar(VELOCIDAD * dt);
    } else if (destino.current) {
      const falta = destino.current.clone().sub(pos).setY(0);
      if (falta.length() < 0.04) destino.current = null;
      else paso.copy(falta.clampLength(0, VELOCIDAD * dt));
    }
    if (paso.lengthSq() > 0) {
      if (bloqueado(pos, paso)) destino.current = null;
      else {
        pos.add(paso);
        pos.x = THREE.MathUtils.clamp(pos.x, caja.min.x + 0.2, caja.max.x - 0.2);
        pos.z = THREE.MathUtils.clamp(pos.z, caja.min.z + 0.2, caja.max.z - 0.2);
      }
    }
    pos.y = ALTO_OJOS;
  });

  // Lámpara de techo que acompaña al caminante: da la caída de luz de un interior.
  const lampara = useRef<THREE.PointLight>(null);
  useFrame(() => {
    lampara.current?.position.set(camera.position.x, ALTO_TECHO - 0.2, camera.position.z);
  });

  const pisable = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.point.y < 0.08 && (e.face?.normal.y ?? 0) > 0.5;

  return (
    <>
      <primitive
        object={raiz}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          if (arrastre.current.activo) return;
          setMarca(pisable(e) ? e.point.clone() : null);
        }}
        onPointerOut={() => setMarca(null)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (arrastre.current.movido > 6 || !pisable(e)) return;
          destino.current = new THREE.Vector3(e.point.x, ALTO_OJOS, e.point.z);
        }}
      />
      {/* Techo: la maqueta no lo trae, y adentro hace falta. */}
      <mesh position={[(caja.min.x + caja.max.x) / 2, ALTO_TECHO, (caja.min.z + caja.max.z) / 2]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[caja.max.x - caja.min.x + 1, caja.max.z - caja.min.z + 1]} />
        <meshStandardMaterial color="#f4efe7" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={lampara} color="#ffd9b0" intensity={4} distance={6} decay={2} />
      {marca && (
        <mesh position={[marca.x, 0.015, marca.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
          <ringGeometry args={[0.16, 0.22, 48]} />
          <meshBasicMaterial color="#efe8dd" transparent opacity={0.85} depthTest={false} />
        </mesh>
      )}
      <directionalLight
        position={[(caja.min.x + caja.max.x) / 2 - 4, 7, caja.min.z - 6]}
        intensity={2.6}
        color="#ffe2bd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
    </>
  );
}

export function Recorrido3D(props: Props) {
  return (
    <Canvas shadows camera={{ position: [2.5, ALTO_OJOS, 2.5], fov: 72, near: 0.05 }} dpr={[1, 2]} gl={{ toneMappingExposure: 0.95 }}>
      <color attach="background" args={["#e9e4dc"]} />
      <hemisphereLight args={["#fff4e6", "#b39b82", 0.45]} />
      <Environment resolution={256} environmentIntensity={0.7}>
        <Lightformer form="rect" intensity={2} color="#fff3e6" position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 14, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#efe8dd" position={[0, 3, -10]} scale={[14, 4, 1]} />
        {/* Rebote del piso: sin él, el techo y todo lo que mira hacia abajo sale negro. */}
        <Lightformer form="rect" intensity={1.1} color="#e6d3bc" position={[0, -6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[16, 16, 1]} />
      </Environment>
      <Suspense
        fallback={
          <Html center>
            <p className="cargando">Preparando el recorrido</p>
          </Html>
        }
      >
        <Caminante {...props} />
      </Suspense>
    </Canvas>
  );
}
