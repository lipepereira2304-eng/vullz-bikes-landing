/* 06 · Montagem em 3D: a Oregon real é montada peça por peça (cada uma chega da esquerda e
   encaixa exatamente no lugar), os adesivos entram da esquerda para a direita e a bike dá
   um giro completo. Tudo conduzido pela rolagem: update(d) recebe o andamento da estação (0–1). */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ordem da montagem e o nome que aparece enquanto a peça chega
const PECAS = [
  ["quadro", "Quadro"],
  ["garfo", "Suspensão dianteira"],
  ["roda-tras", "Roda traseira"],
  ["roda-diant", "Roda dianteira"],
  ["freio-tras", "Freio traseiro"],
  ["freio-diant", "Freio dianteiro"],
  ["pedivela", "Pedivela e coroas"],
  ["cambio", "Catraca e câmbio"],
  ["corrente", "Corrente"],
  ["pedais", "Pedais"],
  ["guidao", "Guidão e comandos"],
  ["selim", "Selim e canote"],
  ["pezinho", "Pezinho"],
];
// trechos da estação (fração do andamento d)
const T = { pecas: [0.05, 0.47], adesivos: [0.47, 0.56], giro: [0.58, 0.88] };

const CAM_AZ = 20;   // câmera a 20° do lado da transmissão
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const out4 = (t) => 1 - Math.pow(1 - t, 4);
const out3 = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // sai devagar, gira e assenta parando
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function start(canvas, { wake, tag, claro = false }) {
  const mobile = () => innerWidth <= 760;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);   // o estúdio (gradiente da página) aparece por trás
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = claro ? 0.95 : 0.6;
  const key = new THREE.DirectionalLight(0xffffff, claro ? 1.5 : 2.2); key.position.set(1.5, 3, 2.5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd2b0, claro ? 0.4 : 1.2); rim.position.set(-2.5, 1.6, -2.5); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);

  // chão: no estúdio escuro, um brilho sob a bike; no branco, sombra de contato
  {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    const cor = claro ? "0,0,0" : "255,255,255";
    r.addColorStop(0, `rgba(${cor},${claro ? 0.22 : 0.14})`); r.addColorStop(1, `rgba(${cor},0)`);
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.002; scene.add(m);
  }

  const bike = new THREE.Group(); scene.add(bike);   // gira inteira no final
  const parts = {};
  const clip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -1);   // adesivos: visível onde x ≤ constante
  let ready = false, lastD = 0;

  const draco = new DRACOLoader().setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/draco/gltf/");
  // versão leve (metade dos triângulos) em todas as telas: roda liso até em computador comum; ?pesado compara com a completa
  const file = new URL(new URLSearchParams(location.search).has("pesado") ? "modelos/oregon-montagem.glb" : "modelos/oregon-montagem-leve.glb", import.meta.url).href;
  new GLTFLoader().setDRACOLoader(draco).load(file, (gltf) => {
    const root = gltf.scene; root.updateMatrixWorld(true);
    [...root.children].forEach((obj) => {
      // cada peça gira em torno do próprio centro (rodas: o eixo), não da origem da bike
      const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
      const pivot = new THREE.Group(); pivot.position.copy(c); bike.add(pivot);
      obj.position.sub(c); pivot.add(obj);
      parts[obj.name] = { pivot, rest: c.clone() };
    });
    parts.adesivos?.pivot.traverse((o) => { if (o.isMesh) [].concat(o.material).forEach((m) => (m.clippingPlanes = [clip])); });
    ready = true; resize(); update(lastD); wake();
  });

  function resize() {
    const W = canvas.clientWidth, H = canvas.clientHeight; if (!W || !H) return;
    renderer.setSize(W, H, false);
    const a = W / H; camera.aspect = a;
    // em tela em pé mantém a bike inteira na largura
    camera.fov = a < 1.25 ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(15)) * 1.25 / a)) : 30;
    const az = THREE.MathUtils.degToRad(CAM_AZ), el = THREE.MathUtils.degToRad(8), d = mobile() ? 3.3 : 3.75;
    const t = new THREE.Vector3(0, 0.52, 0);
    camera.position.set(Math.sin(az) * Math.cos(el) * d, t.y + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d);
    camera.lookAt(t);
    // a bike um pouco abaixo do centro: o título fica em cima
    camera.setViewOffset(W, H, 0, -H * (mobile() ? 0.02 : 0.035), W, H);
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", () => { resize(); update(lastD); });

  function update(d) {
    lastD = d;
    if (!ready) return;
    const n = PECAS.length, [a, b] = T.pecas, step = (b - a) / n;
    let chegando = -1;
    PECAS.forEach(([name], i) => {
      const p = parts[name]; if (!p) return;
      const u = reduce ? (d >= a + i * step ? 1 : 0) : clamp((d - a - i * step) / (step * 2));
      if (u > 0 && u < 1) chegando = i;
      const inv = 1 - out4(u);
      const roda = name.startsWith("roda");
      // chega da esquerda, um pouco acima e à frente, girando; desacelera até encaixar
      p.pivot.position.set(p.rest.x - 3.4 * inv, p.rest.y + 0.35 * inv, p.rest.z + 0.5 * inv);
      p.pivot.rotation.set(roda ? 0 : 0.3 * inv, roda ? 0 : 1.1 * inv, roda ? 5 * Math.PI * inv : -0.35 * inv);
      p.pivot.visible = u > 0;
    });
    // adesivos: aparecem da esquerda para a direita, já no quadro
    if (parts.adesivos) {
      const t = clamp((d - T.adesivos[0]) / (T.adesivos[1] - T.adesivos[0]));
      clip.constant = THREE.MathUtils.lerp(-0.75, 0.75, reduce ? Math.round(t) : inOut(t));
      parts.adesivos.pivot.visible = t > 0;
    }
    // giro completo no fim, no sentido inverso ao anterior, e para exatamente de lado (de frente para a câmera)
    const fim = 2 * Math.PI + THREE.MathUtils.degToRad(CAM_AZ);
    bike.rotation.y = (reduce ? 1 : out3(clamp((d - T.giro[0]) / (T.giro[1] - T.giro[0])))) * (d >= T.giro[0] ? fim : 0);
    if (tag) {
      tag.textContent = chegando >= 0 ? PECAS[chegando][1] : tag.textContent;
      tag.style.setProperty("--o", chegando >= 0 ? 1 : 0);
    }
    renderer.render(scene, camera);
  }
  resize();
  return update;
}
