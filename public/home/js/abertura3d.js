/* Variante da abertura (home.html?abertura=3d) — sem o feixe de luz da foto: o brilho vem da luz do próprio 3D. o mesmo close da Oregon preta com azul e dourado,
   agora em 3D — a bike parada e a câmera girando devagar em volta dela, sozinha (sem rolagem).
   A luz é fixa no estúdio: conforme a câmera gira, os reflexos correm pela pintura e pelo VULLZ. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const BASE = new URL("../", import.meta.url);
const asset = (p) => new URL(p, BASE).href;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const sec = document.getElementById("abertura");
sec.classList.add("ab3d");
const canvas = document.createElement("canvas");
canvas.className = "ab3d-cena"; canvas.setAttribute("aria-hidden", "true");
sec.querySelector(".foto").after(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);
renderer.toneMapping = THREE.NeutralToneMapping;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.5;
// luz principal de cima e à frente (desenha a faixa de brilho no cano) + recorte quente por trás
const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(1.2, 3.2, -1.6); scene.add(key);
const rim = new THREE.DirectionalLight(0xffe0bd, 1.6); rim.position.set(-2, 1.4, 2.2); scene.add(rim);
const camera = new THREE.PerspectiveCamera(32, 1, 0.02, 30);

// o close da foto: lado esquerdo, centro no cano inferior (VULLZ) perto da direção
const ALVO = new THREE.Vector3(0.16, 0.68, 0.06);
const DIST = 1.0;
// a câmera vai e volta num arco em volta da bike (bem devagar, sem parar de vez)
const ARCO = { de: -28, ate: 42, segundos: 60 }, ALTURA = -4;   // ~30 s para cada lado: giro bem lento

// Oregon preta com azul e dourado: mesma geometria, troca a pintura, a faixa AERO e os adesivos
const ADESIVOS = ["escora_superior_direita", "escora_superior_esquerda", "faixa_superior", "frontal", "inferior_direito", "inferior_esquerdo",
  "selim_direito", "selim_esquerdo", "superior_direito", "superior_esquerdo", "vullz_principal"];
const carrega = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = asset(src); });

let pronto = false;
Promise.all([
  new Promise((ok) => new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/draco/gltf/"))
    .load(asset("linha-producao/modelos/oregon-montagem.glb"), ok)),   // versão completa: o close pede detalhe
  carrega("img/home2/hero3d/aero-branco.webp"),
  ...ADESIVOS.map((k) => carrega(`img/home2/hero3d/azul-dourado-${k}.webp`)),
]).then(([gltf, aero, ...decals]) => {
  scene.add(gltf.scene);
  const troca = (m, im) => { if (m.map && im) { m.map.image = im; m.map.needsUpdate = true; } };
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      if (m.name.startsWith("Oregon • pintura")) m.color.setRGB(0.003, 0.004, 0.005);
      else if (m.name.startsWith("Oregon V2 • faixa AERO")) troca(m, aero);
      else if (m.name.startsWith("Oregon V2 • impressão original")) {
        const k = m.name.split("impressão original ")[1].split(".")[0];
        troca(m, decals[ADESIVOS.indexOf(k)]);
      }
    }
  });
  pronto = true; resize(); requestAnimationFrame(quadro);
  sec.classList.add("ab3d-pronto");   // a cena aparece em fade-in
});

function resize() {
  const W = sec.clientWidth, H = sec.clientHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  // tela em pé: abre o ângulo para o close continuar mostrando cano e direção
  camera.fov = camera.aspect < 1 ? 50 : 32;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);

const t0 = performance.now();
function quadro(now) {
  if (!pronto) return;
  const t = reduce ? 0.5 : (now - t0) / 1000;
  // vai e volta suave (seno): sem tranco nas pontas do arco
  const fase = reduce ? 0.5 : 0.5 - 0.5 * Math.cos((t / ARCO.segundos) * Math.PI * 2);
  const az = THREE.MathUtils.degToRad(ARCO.de + (ARCO.ate - ARCO.de) * fase);
  const el = THREE.MathUtils.degToRad(ALTURA);
  // lado esquerdo = -Z; az positivo puxa a câmera para a frente da bike
  camera.position.set(ALVO.x + Math.sin(az) * Math.cos(el) * DIST, ALVO.y + Math.sin(el) * DIST, ALVO.z - Math.cos(az) * Math.cos(el) * DIST);
  camera.lookAt(ALVO);
  // a bike um pouco à direita: o lado esquerdo fica livre para os catálogos
  camera.setViewOffset(sec.clientWidth, sec.clientHeight, -sec.clientWidth * 0.08, 0, sec.clientWidth, sec.clientHeight);
  renderer.render(scene, camera);
  if (!reduce) requestAnimationFrame(quadro);
}
