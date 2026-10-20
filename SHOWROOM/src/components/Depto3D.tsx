import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment, Html, Lightformer, Line, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Ambiente } from "../lib/datos";
import type { VistaMaqueta } from "../lib/direccion";

// La escena del departamento en tres vistas que sólo cambian la cámara:
//   maqueta  "casa de muñecas" inclinada
//   plano    cenital casi ortogonal, con el área de cada ambiente
//   medidas  el plano con las cotas de cada ambiente y del departamento
// Lee del .glb los nodos `ambiente:<id>`: cada uno se resalta al pasar y abre su
// 360 al hacer clic.

interface Props {
  modelo: string;
  ambientes: Ambiente[];
  vista: VistaMaqueta;
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
  caja: THREE.Box3;
}

// Campo visual por vista: uno estrecho y lejano aplana la perspectiva del plano.
const FOV: Record<VistaMaqueta, number> = { maqueta: 30, plano: 14, medidas: 14 };
const ALTO_COTAS = 2.7;

const metros = (n: number) => `${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
const areaDe = (c: THREE.Box3) => (c.max.x - c.min.x) * (c.max.z - c.min.z);

/** Una cota: línea con remates y su medida al centro, siempre visible encima. */
function Cota({ desde, hasta, texto, rotulo }: { desde: THREE.Vector3; hasta: THREE.Vector3; texto: string; rotulo?: "fuerte" }) {
  const eje = hasta.clone().sub(desde).normalize();
  const normal = new THREE.Vector3(-eje.z, 0, eje.x).multiplyScalar(0.12);
  const medio = desde.clone().add(hasta).multiplyScalar(0.5);
  const props = { color: rotulo ? "#d48b6e" : "#efe8dd", lineWidth: rotulo ? 1.6 : 1.1, depthTest: false, transparent: true, opacity: rotulo ? 1 : 0.85, renderOrder: 10 } as const;
  return (
    <group>
      <Line points={[desde, hasta]} {...props} />
      <Line points={[desde.clone().sub(normal), desde.clone().add(normal)]} {...props} />
      <Line points={[hasta.clone().sub(normal), hasta.clone().add(normal)]} {...props} />
      <Html position={medio} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
        <span className={`cota-medida${rotulo ? " fuerte" : ""}`}>{texto}</span>
      </Html>
    </group>
  );
}

// Un ambiente con algún lado menor a esto no tiene sitio para dos cotas legibles.
const LADO_MINIMO_COTAS = 2.6;
const medida = (n: number) => n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Cotas({ info, nombres, caja, soloTotales }: { info: InfoAmbiente[]; nombres: Map<string, string>; caja: THREE.Box3; soloTotales: boolean }) {
  const y = ALTO_COTAS;
  const v = (x: number, z: number) => new THREE.Vector3(x, y, z);
  return (
    <>
      {!soloTotales && info
        .filter((a) => nombres.has(a.id))
        .map((a) => {
          const { min, max } = a.caja;
          const m = 0.32;
          const ancho = max.x - min.x;
          const fondo = max.z - min.z;
          const centroDepto = caja.getCenter(new THREE.Vector3());
          const zCota = a.centro.z < centroDepto.z ? min.z + m : max.z - m;
          const xCota = a.centro.x < centroDepto.x ? min.x + m : max.x - m;
          if (Math.min(ancho, fondo) < LADO_MINIMO_COTAS) {
            return (
              <Html key={a.id} position={[a.centro.x, y, a.centro.z]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
                <span className="cota-compacta">
                  <em>{nombres.get(a.id)}</em>
                  {medida(ancho)} × {medida(fondo)} m
                </span>
              </Html>
            );
          }
          return (
            <group key={a.id}>
              {/* Cada cota va del lado de la fachada, no del ambiente vecino. */}
              <Cota desde={v(min.x + 0.12, zCota)} hasta={v(max.x - 0.12, zCota)} texto={metros(ancho)} />
              <Cota desde={v(xCota, min.z + 0.12)} hasta={v(xCota, max.z - 0.12)} texto={metros(fondo)} />
              <Html position={[a.centro.x, y, a.centro.z]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
                <span className="cota-nombre">{nombres.get(a.id)}</span>
              </Html>
            </group>
          );
        })}
      <Cota desde={v(caja.min.x, caja.min.z - 0.7)} hasta={v(caja.max.x, caja.min.z - 0.7)} texto={metros(caja.max.x - caja.min.x)} rotulo="fuerte" />
      <Cota desde={v(caja.min.x - 0.7, caja.min.z)} hasta={v(caja.min.x - 0.7, caja.max.z)} texto={metros(caja.max.z - caja.min.z)} rotulo="fuerte" />
    </>
  );
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
        const cajaAmbiente = new THREE.Box3().setFromObject(o);
        info.push({ id, nodo: o, centro: cajaAmbiente.getCenter(new THREE.Vector3()), caja: cajaAmbiente });
      }
    });
    const caja = new THREE.Box3().setFromObject(raiz);
    return { raiz, info, caja };
  }, [scene, conocidos]);

  const nombres = useMemo(() => new Map(ambientes.map((a) => [a.id, a.nombre])), [ambientes]);
  const areasDeclaradas = useMemo(() => new Map(ambientes.map((a) => [a.id, a.area_m2])), [ambientes]);
  const numeros = useMemo(() => new Map(ambientes.map((a, i) => [a.id, String(i + 1).padStart(2, "0")])), [ambientes]);
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
  // En celular un baño mide ~45 px: ahí sólo cabe el número, que remite a la
  // lista de ambientes de la ficha.
  const estrecho = size.width <= 760;
  const vistaPrevia = useRef<Props["vista"] | null>(null);
  const fovObjetivo = useRef(FOV[vista]);
  // El cambio de campo visual acompaña al viaje de la cámara en vez de saltar.
  useFrame((_, dt) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const diferencia = fovObjetivo.current - camera.fov;
    if (Math.abs(diferencia) < 0.01) return;
    camera.fov += diferencia * Math.min(1, dt * 5);
    camera.updateProjectionMatrix();
  });
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

    const cenital = vista !== "maqueta";
    fovObjetivo.current = FOV[vista];
    if (!animar) {
      camera.fov = FOV[vista];
      camera.updateProjectionMatrix();
    }
    // En el plano no se rota: se acerca y se desplaza, como sobre una lámina.
    c.azimuthRotateSpeed = cenital ? 0 : 1;
    c.polarRotateSpeed = cenital ? 0 : 1;

    const centro = caja.getCenter(new THREE.Vector3());
    // Las cotas del departamento van por fuera: el plano de medidas deja aire.
    const radio = (caja.getSize(new THREE.Vector3()).length() / 2) * (vista === "medidas" ? 1.18 : cenital ? 1.04 : 1);
    const tanMedio = Math.tan(THREE.MathUtils.degToRad(FOV[vista]) / 2);
    const angV = 2 * Math.atan((tanMedio * libre.h) / size.height);
    const angH = 2 * Math.atan((tanMedio * libre.w) / size.height);
    const distancia = (radio * 0.94) / Math.sin(Math.min(angV, angH) / 2);

    const dir = cenital ? new THREE.Vector3(0, 1, 0.0002) : new THREE.Vector3(-1.9, 2.3, 2.6);
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
      {vista === "medidas" && <Cotas info={info} nombres={nombres} caja={caja} soloTotales={estrecho} />}
      {(vista === "maqueta" || vista === "plano" || estrecho) && (
        info
          .filter((a) => nombres.has(a.id))
          .map((a) => {
            const declarada = areasDeclaradas.get(a.id);
            return (
              <Html key={a.id} position={[a.centro.x, vista === "maqueta" ? 0.25 : ALTO_COTAS, a.centro.z]} center distanceFactor={vista === "maqueta" ? 14 : undefined} zIndexRange={[10, 0]}>
                {estrecho && vista !== "maqueta" ? (
                  <button type="button" className="numero-ambiente" aria-label={nombres.get(a.id)} onClick={() => onAmbiente(a.id)}>
                    {numeros.get(a.id)}
                  </button>
                ) : (
                <button
                  type="button"
                  className={`chip-ambiente${encima === a.id ? " activo" : ""}${vista === "plano" ? " con-area" : ""}`}
                  onClick={() => onAmbiente(a.id)}
                  onPointerEnter={() => setEncima(a.id)}
                  onPointerLeave={() => setEncima(null)}
                >
                  {nombres.get(a.id)}
                  {vista === "plano" && (
                    <small>
                      {declarada ? "" : "≈ "}
                      {(declarada ?? areaDe(a.caja)).toLocaleString("es-PE", { maximumFractionDigits: 1 })} m²
                    </small>
                  )}
                </button>
                )}
              </Html>
            );
          })
      )}
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
