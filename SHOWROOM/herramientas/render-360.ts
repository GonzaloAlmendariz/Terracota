// Renderiza panorámicas 360 equirectangulares (2:1) de un modelo .glb, una por
// ambiente, desde el centro del ambiente a la altura de los ojos. Lo usa
// scripts/renderizar-360-prueba.mjs mientras no hay renders esféricos de V-Ray.
//
// Convención de la imagen (la misma que lee el visor Panorama360): la columna
// u = 0.75 es lo que se ve de frente al entrar, que en el modelo es -z.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const ALTO_OJOS = 1.55;
const ALTO_TECHO = 2.5;
const PATRON_AMBIENTE = /^ambiente[:_-](.+)$/i;

async function renderizar(modelo: string, ancho: number, cara: number): Promise<Record<string, string>> {
  const alto = ancho / 2;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(ancho, alto, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const escena = new THREE.Scene();
  escena.background = new THREE.Color("#e9e4dc");
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environmentIntensity = 0.32;
  escena.add(new THREE.HemisphereLight("#fff4e6", "#3a2e24", 0.18));

  const gltf = await new GLTFLoader().loadAsync(modelo);
  const raiz = gltf.scene;
  raiz.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  escena.add(raiz);

  // Techo: la maqueta va sin techo para verse desde arriba; adentro hace falta.
  const caja = new THREE.Box3().setFromObject(raiz);
  const techo = new THREE.Mesh(
    new THREE.PlaneGeometry(caja.max.x - caja.min.x + 1, caja.max.z - caja.min.z + 1),
    new THREE.MeshStandardMaterial({ color: "#f4efe7", roughness: 0.95, side: THREE.DoubleSide }),
  );
  techo.rotation.x = Math.PI / 2;
  techo.position.set((caja.min.x + caja.max.x) / 2, ALTO_TECHO, (caja.min.z + caja.max.z) / 2);
  escena.add(techo);

  // Sol de tarde entrando por la terraza (lado -z): sombras y contraste.
  const centroModelo = caja.getCenter(new THREE.Vector3());
  const sol = new THREE.DirectionalLight("#ffe2bd", 3.2);
  sol.position.set(centroModelo.x - 4, 7, caja.min.z - 6);
  sol.target.position.copy(centroModelo);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.camera.left = -9;
  sol.shadow.camera.right = 9;
  sol.shadow.camera.top = 9;
  sol.shadow.camera.bottom = -9;
  sol.shadow.bias = -0.0005;
  sol.shadow.normalBias = 0.02;
  escena.add(sol, sol.target);

  // Luz cálida de techo sobre la cámara: da la caída de luz de un interior.
  const lampara = new THREE.PointLight("#ffd9b0", 5, 6, 2);
  escena.add(lampara);

  const destinoCubo = new THREE.WebGLCubeRenderTarget(cara, { type: THREE.HalfFloatType, generateMipmaps: false });
  const camaraCubo = new THREE.CubeCamera(0.05, 60, destinoCubo);
  escena.add(camaraCubo);

  // Pasada a equirectangular: cada píxel de la imagen es una dirección.
  const material = new THREE.ShaderMaterial({
    uniforms: { cubo: { value: destinoCubo.texture } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `
      uniform samplerCube cubo;
      varying vec2 vUv;
      #include <common>
      void main() {
        float phi = vUv.x * 2.0 * PI;
        float theta = (1.0 - vUv.y) * PI;
        vec3 dir = vec3(cos(phi) * sin(theta), cos(theta), sin(phi) * sin(theta));
        gl_FragColor = textureCube(cubo, vec3(-dir.x, dir.y, dir.z));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    depthTest: false,
    depthWrite: false,
  });
  const pasada = new THREE.Scene();
  pasada.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  const camaraPasada = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const salida: Record<string, string> = {};
  raiz.traverse((o) => {
    const nombre = (o.userData.name as string | undefined) ?? o.name;
    const id = PATRON_AMBIENTE.exec(nombre)?.[1];
    if (!id) return;
    const centro = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
    camaraCubo.position.set(centro.x, ALTO_OJOS, centro.z);
    lampara.position.set(centro.x, ALTO_TECHO - 0.25, centro.z);
    camaraCubo.update(renderer, escena);
    renderer.setRenderTarget(null);
    renderer.render(pasada, camaraPasada);
    salida[id] = renderer.domElement.toDataURL("image/webp", 0.86);
  });
  return salida;
}

declare global {
  interface Window {
    renderizar: typeof renderizar;
  }
}
window.renderizar = renderizar;
