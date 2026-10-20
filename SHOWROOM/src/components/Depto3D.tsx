import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment, Html, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Ambiente } from "../lib/datos";

// Maqueta "casa de muñecas" del departamento. Lee del .glb los nodos
// `ambiente:<id>`: cada uno se resalta al pasar y abre su 360 al hacer clic.

interface Props {
  modelo: string;
  ambientes: Ambiente[];
  vista: "iso" | "planta";
  /** false mientras se recorre el 360: la escena se conserva pero no se pinta. */
  activa?: boolean;
  onAmbiente: (id: string) => void;
}

// GLTFLoader quita los «:» del nombre (ambiente:sala → ambientesala) pero guarda
// el original en userData.name. Se acepta «:», «-» o «_» como separador.
const PATRON_AMBIENTE = /^ambiente[:_-](.+)$/i;
function ambienteDe(o: THREE.Object3D): string | null {
  const nombre = (o.userData.name as string | undefined) ?? o.name;
  return PATRON_AMBIENTE.exec(nombre)?.[1] ?? null;
}

// Rectángulo del lienzo que no tapa la interfaz (en px del lienzo).
// Reserva el encabezado arriba y la barra de vistas abajo, y descuenta la ficha:
// si está a la derecha (escritorio) recorta el ancho; si está abajo (celular),
// el alto.
const RESERVA_ARRIBA = 72;
const RESERVA_ABAJO = 112;
function zonaLibre(lienzo: HTMLCanvasElement, ancho: number, alto: number) {
  const marco = lienzo.getBoundingClientRect();
  const panel = lienzo.closest(".pantalla")?.querySelector(".panel")?.getBoundingClientRect();
  let derecha = ancho;
  let abajo = alto - RESERVA_ABAJO;
  if (panel && panel.width > 0) {
    if (panel.left - marco.left > ancho * 0.35) derecha = panel.left - marco.left - 16;
    else abajo = Math.min(alto, panel.top - marco.top) - RESERVA_ABAJO;
  }
  const w = Math.max(160, derecha);
  const h = Math.max(160, abajo - RESERVA_ARRIBA);
  return { x: 0, y: RESERVA_ARRIBA, w, h };
}

interface InfoAmbiente {
  id: string;
  nodo: THREE.Object3D;
  centro: THREE.Vector3;
}

function Maqueta({ modelo, ambientes, vista, onAmbiente }: Props) {
  const { scene } = useGLTF(modelo);
  const controles = useRef<CameraControls>(null);
  const [encima, setEncima] = useState<string | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  // Copia propia de la escena y de sus materiales: el resaltado de un ambiente
  // no debe teñir a los demás que comparten material.
  // Sólo cuenta como ambiente un nodo cuyo id está en los datos: un modelo real
  // puede traer piezas con nombres parecidos («ambiente:sala-7») dentro del grupo.
  const conocidos = useMemo(() => new Set(ambientes.map((a) => a.id)), [ambientes]);
  const { raiz, info, caja } = useMemo(() => {
    const raiz = scene.clone(true);
    const info: InfoAmbiente[] = [];
    raiz.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.material = (o.material as THREE.Material).clone();
      }
      const id = ambienteDe(o);
      if (id && conocidos.has(id)) {
        const centro = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
        info.push({ id, nodo: o, centro });
      }
    });
    const caja = new THREE.Box3().setFromObject(raiz);
    return { raiz, info, caja };
  }, [scene, conocidos]);

  const nombres = useMemo(() => new Map(ambientes.map((a) => [a.id, a.nombre])), [ambientes]);
  const conPanorama = useMemo(() => new Set(ambientes.map((a) => a.id)), [ambientes]);

  useEffect(() => {
    for (const a of info) {
      const activo = a.id === encima;
      a.nodo.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material as THREE.MeshStandardMaterial;
          m.emissive.set(activo ? "#b4563a" : "#000000");
          m.emissiveIntensity = activo ? 0.35 : 0;
        }
      });
    }
    invalidate();
  }, [encima, info, invalidate]);

  // Encuadre contra el espacio LIBRE del lienzo: el lienzo corre bajo la ficha
  // (a la derecha en escritorio, abajo en celular), el encabezado y la barra de
  // vistas. Se mide ese hueco en el DOM, la distancia se calcula para que el
  // departamento entero quepa en él y la proyección se centra ahí con
  // setViewOffset, sin mover la cámara (rotar sigue girando sobre el depto).
  //
  // El primer encuadre y los cambios de tamaño son instantáneos y ocurren antes
  // del primer cuadro (useLayoutEffect): animarlos hacía que la maqueta naciera
  // cortada contra el borde y se deslizara. Sólo el cambio de vista se anima.
  const { camera, size, gl } = useThree();
  const vistaPrevia = useRef<Props["vista"] | null>(null);
  useLayoutEffect(() => {
    const c = controles.current;
    if (!c || !(camera instanceof THREE.PerspectiveCamera)) return;
    const animar = vistaPrevia.current !== null && vistaPrevia.current !== vista;
    vistaPrevia.current = vista;

    const libre = zonaLibre(gl.domElement, size.width, size.height);
    camera.setViewOffset(
      size.width,
      size.height,
      size.width / 2 - (libre.x + libre.w / 2),
      size.height / 2 - (libre.y + libre.h / 2),
      size.width,
      size.height,
    );

    const centro = caja.getCenter(new THREE.Vector3());
    const radio = caja.getSize(new THREE.Vector3()).length() / 2;
    const tanMedio = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const angV = 2 * Math.atan((tanMedio * libre.h) / size.height);
    const angH = 2 * Math.atan((tanMedio * libre.w) / size.height);
    const distancia = (radio * 0.94) / Math.sin(Math.min(angV, angH) / 2);

    const dir = vista === "planta" ? new THREE.Vector3(0, 1, 0.0002) : new THREE.Vector3(-1.9, 2.3, 2.6);
    const ojo = dir.normalize().multiplyScalar(distancia).add(centro);
    c.maxDistance = distancia * 1.8;
    c.setLookAt(ojo.x, ojo.y, ojo.z, centro.x, centro.y, centro.z, animar);
  }, [vista, caja, camera, size.width, size.height, gl]);

  useEffect(() => () => camera.clearViewOffset(), [camera]);

  const idDe = (e: ThreeEvent<PointerEvent | MouseEvent>): string | null => {
    for (let o: THREE.Object3D | null = e.object; o; o = o.parent) {
      const id = ambienteDe(o);
      if (id && conocidos.has(id)) return id;
    }
    return null;
  };

  return (
    <>
      <primitive
        object={raiz}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const id = idDe(e);
          setEncima(id && conPanorama.has(id) ? id : null);
          document.body.style.cursor = id && conPanorama.has(id) ? "pointer" : "";
        }}
        onPointerOut={() => {
          setEncima(null);
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          const id = idDe(e);
          if (id && conPanorama.has(id)) onAmbiente(id);
        }}
      />
      {info
        .filter((a) => nombres.has(a.id))
        .map((a) => (
          <Html key={a.id} position={[a.centro.x, 0.25, a.centro.z]} center distanceFactor={14} zIndexRange={[10, 0]}>
            <button
              type="button"
              className={`chip-ambiente${encima === a.id ? " activo" : ""}`}
              onClick={() => onAmbiente(a.id)}
              onPointerEnter={() => setEncima(a.id)}
              onPointerLeave={() => setEncima(null)}
            >
              {nombres.get(a.id)}
            </button>
          </Html>
        ))}
      <ContactShadows position={[caja.getCenter(new THREE.Vector3()).x, caja.min.y - 0.01, caja.getCenter(new THREE.Vector3()).z]} opacity={0.45} scale={22} blur={2.2} far={4} />
      <CameraControls ref={controles} minDistance={5} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

export function Depto3D({ activa = true, ...props }: Props) {
  return (
    <Canvas frameloop={activa ? "always" : "never"} shadows camera={{ position: [-10, 18, 24], fov: 30 }} dpr={[1, 2]}>
      <hemisphereLight args={["#efe8dd", "#2a211a", 0.5]} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} color="#fff3e6" position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 14, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#d48b6e" position={[-10, 3, 4]} rotation={[0, Math.PI / 2, 0]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#efe8dd" position={[10, 3, -4]} rotation={[0, -Math.PI / 2, 0]} scale={[10, 4, 1]} />
      </Environment>
      <directionalLight position={[-6, 14, 9]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0004} shadow-normalBias={0.02} />
      <Suspense
        fallback={
          <Html center>
            <p className="cargando">Cargando maqueta…</p>
          </Html>
        }
      >
        <Maqueta {...props} activa={activa} />
      </Suspense>
    </Canvas>
  );
}
