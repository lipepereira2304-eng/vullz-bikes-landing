import type { AssetMap } from "./types";

/*
  Bike em 3D no palco do produto + "Ver no seu ambiente" (realidade aumentada).

  ARQUIVOS: mesma convenção de nome das fotos — por cor, numa subpasta `3d/`:
    src/assets/bikes/<model-id>/3d/<color-id>.glb   → 3D na página (todas as telas)
    src/assets/bikes/<model-id>/3d/<color-id>.usdz  → RA no iPhone/iPad (Quick Look)
    src/assets/bikes/<model-id>/3d/<color-id>.android.glb → RA no Android (Scene Viewer)
  Larga os dois arquivos com o nome certo e os botões aparecem sozinhos para
  aquela cor. Cor sem .glb fica só com a foto, sem botão nenhum (nada de
  "Em breve" aqui: não é falta de conteúdo, é um extra).

  Os .glb/.usdz são gerados a partir dos .blend finais por
  vullz-galeria-teste/modelos-3d/tools/exportar_todos.sh (fora do repositório):
  peças pesadas aliviadas, peças juntadas por material, bike apoiada no chão
  (o ponto zero do arquivo vira o piso na RA) e em tamanho real (metros).

  O visualizador é o <model-viewer> (Google). Ele pesa ~1 MB, então só é
  baixado no primeiro toque em "3D" — quem nunca abre o 3D não paga nada.
*/

export interface Model3d {
  glb: string;
  usdz?: string;
  /* o .glb da página usa compressão (Draco) e imagens WebP, que o Scene Viewer
     do Google não garante abrir: o Android ganha um .glb "puro" só para a RA */
  androidGlb?: string;
}

export function find3d(models3d: AssetMap, modelId: string, colorId: string): Model3d | undefined {
  let glb: string | undefined;
  let usdz: string | undefined;
  let androidGlb: string | undefined;
  for (const path in models3d) {
    const s = path.split("/");
    if (s[s.length - 3] !== modelId || s[s.length - 2] !== "3d") continue;
    const file = s[s.length - 1];
    if (file === `${colorId}.glb`) glb = models3d[path];
    if (file === `${colorId}.usdz`) usdz = models3d[path];
    if (file === `${colorId}.android.glb`) androidGlb = models3d[path];
  }
  return glb ? { glb, usdz, androidGlb } : undefined;
}

/*
  Qual RA o aparelho sabe abrir. iPhone/iPad respondem a <a rel="ar"> (Quick
  Look, nativo do sistema — inclusive o iPad que se apresenta como Mac); Android
  abre o Scene Viewer do Google (com o .android.glb, ou o .glb da página
  se a cor ainda não tiver o dele). Computador: nenhuma, e o
  botão nem aparece.
*/
export type ArMode = "quick-look" | "scene-viewer" | null;

export function detectAr(): ArMode {
  const a = document.createElement("a");
  if (a.relList?.supports?.("ar")) return "quick-look";
  if (/android/i.test(navigator.userAgent)) return "scene-viewer";
  return null;
}

/*
  Abre a RA. Quick Look só dispara a partir de um <a rel="ar"> com uma imagem
  dentro — o link é criado, clicado e descartado. `allowsContentScaling=0`
  trava a bike no tamanho real (sem pinça para aumentar/diminuir na sala).
*/
export function openAr(mode: ArMode, model: Model3d, title: string): void {
  if (mode === "quick-look" && model.usdz) {
    const a = document.createElement("a");
    a.rel = "ar";
    a.href = `${model.usdz}#allowsContentScaling=0`;
    a.appendChild(document.createElement("img"));
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  if (mode === "scene-viewer") {
    const file = new URL(model.androidGlb ?? model.glb, location.href).href;
    const params = `file=${encodeURIComponent(file)}&mode=ar_preferred&resizable=false&title=${encodeURIComponent(title)}`;
    location.href =
      `intent://arvr.google.com/scene-viewer/1.0?${params}` +
      `#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;` +
      `S.browser_fallback_url=${encodeURIComponent(location.href)};end;`;
  }
}

/*
  Botões do produto: "Ficha Técnica" de sempre + "3D" (+ "Ver no seu ambiente"
  nos aparelhos com RA). Mesmo estilo de pílula da ficha, para os três lerem
  como um grupo de ações sobre a mesma peça.
*/
const PILL =
  "btn-motion inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-widest hover:-translate-y-[var(--shift-sm)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-black focus-visible:ring-offset-2 max-lg:min-h-11";

export function view3dButtonsMarkup(model: Model3d | undefined, ar: ArMode, active: boolean): string {
  if (!model) return "";
  const on = active
    ? "border-vullz-black bg-vullz-black text-white"
    : "border-vullz-gray-500 text-vullz-gray-500 hover:border-vullz-black hover:text-vullz-black";
  const cube = /* html */ `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5 14 4.75v6.5L8 14.5 2 11.25v-6.5L8 1.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2 4.75 8 8l6-3.25M8 8v6.5" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  const arButton =
    ar && (ar === "scene-viewer" || model.usdz)
      ? /* html */ `<button type="button" data-role="view-ar" class="${PILL} border-vullz-gray-500 text-vullz-gray-500 hover:border-vullz-black hover:text-vullz-black">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1.5 5V2.5a1 1 0 0 1 1-1H5M11 1.5h2.5a1 1 0 0 1 1 1V5M14.5 11v2.5a1 1 0 0 1-1 1H11M5 14.5H2.5a1 1 0 0 1-1-1V11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M8 4.5 11 6.2v3.6L8 11.5 5 9.8V6.2L8 4.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
          No seu ambiente
        </button>`
      : "";
  return /* html */ `
    <button type="button" data-role="view-3d" aria-pressed="${active}" class="${PILL} ${on}">
      ${cube}${active ? "Ver foto" : "3D"}
    </button>
    ${arButton}
  `;
}

/*
  O visualizador ocupa o palco por cima da foto. A foto continua embaixo e só
  some quando o 3D termina de carregar (sem tela em branco no meio); a bike
  entra na mesma vista lateral da foto e gira devagar para 3/4, o convite para
  arrastar. Fundo transparente: a página branca continua sendo o "infinito".
*/
let loading: Promise<unknown> | null = null;
function loadViewer(): Promise<unknown> {
  loading ??= import("@google/model-viewer");
  return loading;
}

type ModelViewerEl = HTMLElement & {
  src: string;
  cameraOrbit: string;
  jumpCameraToGoal(): void;
};

export interface Viewer3d {
  el: HTMLElement;
  setModel(model: Model3d): void;
  destroy(): void;
}

export function mountViewer3d(stage: HTMLElement, model: Model3d, alt: string, onReady: () => void): Viewer3d {
  const wrap = document.createElement("div");
  wrap.className = "viewer3d";
  wrap.innerHTML = /* html */ `
    <model-viewer
      alt="${alt}"
      camera-controls
      touch-action="none"
      interaction-prompt="none"
      environment-image="neutral"
      exposure="1.05"
      shadow-intensity="0.75"
      shadow-softness="0.9"
      camera-orbit="0deg 80deg 92%"
      min-camera-orbit="auto 0deg auto"
      max-camera-orbit="auto 180deg auto"
      interpolation-decay="160"
    >
      <div slot="progress-bar" class="viewer3d-progress"><i></i></div>
    </model-viewer>
    <p class="viewer3d-hint">Arraste para girar</p>
  `;
  stage.appendChild(wrap);
  const mv = wrap.querySelector("model-viewer") as ModelViewerEl;
  const bar = wrap.querySelector<HTMLElement>(".viewer3d-progress i")!;

  mv.addEventListener("progress", (e) => {
    const p = e instanceof CustomEvent ? Number(e.detail?.totalProgress ?? 0) : 0;
    bar.style.transform = `scaleX(${p})`;
    wrap.classList.toggle("is-loading", p < 1);
  });

  let first = true;
  mv.addEventListener("load", () => {
    wrap.classList.add("is-ready");
    if (first) {
      first = false;
      onReady();
      // entra na vista da foto e vira para 3/4 sozinha: mostra que é 3D
      // palco estreito (celular em pé): a bike precisa de mais respiro para caber inteira em 3/4
      const wide = wrap.clientWidth > 600;
      mv.cameraOrbit = `0deg 80deg ${wide ? 92 : 108}%`;
      mv.jumpCameraToGoal();
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.setTimeout(() => (mv.cameraOrbit = `-35deg 72deg ${wide ? 84 : 104}%`), 250);
      }
    }
  });

  mv.addEventListener("camera-change", (e) => {
    if (e instanceof CustomEvent && e.detail?.source === "user-interaction") wrap.classList.add("touched");
  });

  wrap.classList.add("is-loading");
  void loadViewer().then(() => {
    mv.src = model.glb;
  });

  return {
    el: wrap,
    setModel(next) {
      // troca de cor: mantém o ângulo em que a pessoa deixou a bike
      if (mv.src !== next.glb) mv.src = next.glb;
    },
    destroy() {
      wrap.remove();
    },
  };
}
