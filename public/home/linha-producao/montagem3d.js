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
const T = { pecas: [0.05, 0.47], adesivos: [0.47, 0.56], giro: [0.58, 0.88], acende: [0.84, 0.95] };

const CAM_AZ = 20;   // câmera a 20° do lado da transmissão
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const out4 = (t) => 1 - Math.pow(1 - t, 4);
const out3 = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // sai devagar, gira e assenta parando
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function start(canvas, { wake, tag, claro = false }) {
  const mobile = () => innerWidth <= 760;
  // aparelho mais fraco (celular, ou poucos núcleos / pouca memória): menos pixels e sombra mais leve
  const fraco = mobile() || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, fraco ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);   // o estúdio (gradiente da página) aparece por trás
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = !claro;   // estúdio escuro: sombra real da bike no chão (as rodas pousam)
  renderer.shadowMap.type = THREE.VSMShadowMap;   // sombra desfocada de verdade (sem serrilhado na borda)

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = claro ? 0.95 : 0.6;
  const key = new THREE.DirectionalLight(0xffffff, claro ? 1.5 : 2.2); key.position.set(1.5, 3, 2.5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd2b0, claro ? 0.4 : 1.2); rim.position.set(-2.5, 1.6, -2.5); scene.add(rim);
  /* palco (estúdio escuro): a bike é montada sob um foco de cima, na penumbra; quando ela termina o giro as luzes
     acendem: o foco ganha força, duas luzes de contorno por trás desenham a silhueta e os reflexos do estúdio sobem */
  // cone largo: cobre o chão inteiro (a borda do cone apareceria como um oval cinza no estúdio branco)
  const foco = new THREE.SpotLight(0xfff3e4, 0, 0, 0.95, 0.25, 0);
  foco.position.set(0.15, 4.4, 0.7); foco.target.position.set(0, 0.35, 0); scene.add(foco, foco.target);
  // a sombra sai de uma luz só para ela (não ilumina nada): de cima, com o enquadramento justo em volta da bike,
  // o mapa de sombra fica bem definido; o foco de cone largo espalhava o mapa pelo chão inteiro e serrilhava a borda
  const luzSombra = new THREE.DirectionalLight(0xffffff, 0);
  luzSombra.position.set(0.15, 5, 0.8); luzSombra.target.position.set(0, 0, 0); scene.add(luzSombra, luzSombra.target);
  luzSombra.castShadow = true; luzSombra.shadow.mapSize.setScalar(fraco ? 1024 : 2048);
  Object.assign(luzSombra.shadow.camera, { left: -1.5, right: 1.5, top: 1.5, bottom: -1.5, near: 2, far: 8 });
  luzSombra.shadow.radius = fraco ? 4 : 7; luzSombra.shadow.blurSamples = fraco ? 8 : 16; luzSombra.shadow.bias = -0.0005;
  const contornoE = new THREE.DirectionalLight(0xffe0c4, 0); contornoE.position.set(-2.2, 1.4, -2.8); scene.add(contornoE);
  const contornoD = new THREE.DirectionalLight(0xdfe9ff, 0); contornoD.position.set(2.6, 1.2, -2.4); scene.add(contornoD);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);

  // chão: no estúdio escuro, o círculo de luz do foco e a sombra da bike; no branco, sombra de contato
  let poca = null, sombra = null;
  if (!claro) {
    sombra = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.ShadowMaterial({ opacity: 0.75, transparent: true, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.001; sombra.receiveShadow = true; scene.add(sombra);
  }
  {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    const cor = claro ? "0,0,0" : "255,255,255";
    r.addColorStop(0, `rgba(${cor},${claro ? 0.22 : 0.16})`); r.addColorStop(0.55, `rgba(${cor},${claro ? 0.1 : 0.07})`); r.addColorStop(1, `rgba(${cor},0)`);
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    // no escuro vira o círculo de luz do foco no chão (mais largo); acende junto com o palco
    const m = new THREE.Mesh(new THREE.PlaneGeometry(claro ? 2.6 : 3.2, claro ? 0.9 : 1.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.0005; m.renderOrder = -1; scene.add(m);
    if (!claro) poca = m;
  }

  const bike = new THREE.Group(); scene.add(bike);   // gira inteira no final
  const parts = {};
  const clip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -1);   // adesivos: visível onde x ≤ constante
  let ready = false, lastD = 0;

  const draco = new DRACOLoader().setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/draco/gltf/");
  // versão otimizada (576 mil triângulos, 4 MB; reduzida no Blender peça por peça) em todas as telas;
  // ?anterior compara com a leve antiga (1,4 milhão) e ?pesado com a completa
  const q = new URLSearchParams(location.search);
  const file = new URL(q.has("pesado") ? "modelos/oregon-montagem.glb" : q.has("anterior") ? "modelos/oregon-montagem-leve.glb" : "modelos/oregon-montagem-otimizada.glb", import.meta.url).href;
  new GLTFLoader().setDRACOLoader(draco).load(file, (gltf) => {
    const root = gltf.scene; root.updateMatrixWorld(true);
    [...root.children].forEach((obj) => {
      // cada peça gira em torno do próprio centro (rodas: o eixo), não da origem da bike
      const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
      const pivot = new THREE.Group(); pivot.position.copy(c); bike.add(pivot);
      obj.position.sub(c); pivot.add(obj);
      parts[obj.name] = { pivot, rest: c.clone() };
    });
    if (!claro) bike.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    parts.adesivos?.pivot.traverse((o) => { if (o.isMesh) [].concat(o.material).forEach((m) => (m.clippingPlanes = [clip])); });
    // antes de aparecer: compila os shaders e manda as texturas para a placa de vídeo (senão o primeiro quadro trava)
    bike.traverse((o) => { if (o.isMesh) [].concat(o.material).forEach((m) => Object.values(m).forEach((v) => v?.isTexture && renderer.initTexture(v))); });
    resize();
    renderer.compileAsync(scene, camera).catch(() => {}).then(() => { ready = true; update(lastD, true); wake(); });
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
  addEventListener("resize", () => { resize(); update(lastD, true); });

  let desenhado = null;   // só redesenha quando o andamento muda (parado, a placa de vídeo descansa)
  function update(d, forcar = false) {
    lastD = d;
    if (!ready || (!forcar && d === desenhado)) return;
    desenhado = d;
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
    // palco: penumbra durante a montagem e o giro; quando a bike para de lado o estúdio inteiro vira branco
    // (a página clareia o fundo no mesmo trecho): luz de estúdio claro, sem o círculo de luz, só a sombra no chão
    if (!claro) {
      const L = reduce ? (d >= T.acende[0] ? 1 : 0) : inOut(clamp((d - T.acende[0]) / (T.acende[1] - T.acende[0])));
      const mix = (a, b) => a + (b - a) * L;
      foco.intensity = mix(2.4, 1.6);
      key.intensity = mix(0.9, 1.5);
      rim.intensity = mix(0.5, 0.4);
      contornoE.intensity = mix(0.4, 0.6);
      contornoD.intensity = mix(0.2, 0.4);
      scene.environmentIntensity = mix(0.4, 0.95);
      poca.material.opacity = mix(0.75, 0);
      sombra.material.opacity = mix(0.55, 0.32);
    }
    if (tag) {
      tag.textContent = chegando >= 0 ? PECAS[chegando][1] : tag.textContent;
      tag.style.setProperty("--o", chegando >= 0 ? 1 : 0);
    }
    renderer.render(scene, camera);
  }
  resize();
  return update;
}
