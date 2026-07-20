import "../styles/main.css";
import { initRevealOnScroll } from "./animations";

/*
  Página em branco de propósito: as fotos reais das bikes têm fundo branco, e
  a ideia (referência: página de produto da Apple) é que a imagem pareça
  flutuar num fundo infinito, sem nenhuma borda de card cortando essa ilusão.

  Este catálogo é o das bicicletas. O de elétricos vai ganhar sua própria
  versão (modelos/cores diferentes) mais pra frente.

  FOTOS: qualquer arquivo colocado em src/assets/bikes/<model-id>/<color-id>.jpg
  (ou .jpeg/.png/.webp) é carregado automaticamente por este import.meta.glob —
  não precisa tocar neste arquivo de novo, só seguir a convenção de nome. Ver
  src/assets/bikes/README.md para a lista de ids de cada modelo/cor. Enquanto
  o arquivo não existe, aparece "Em breve..." no lugar da foto.
*/
const bikePhotos = import.meta.glob<string>("../assets/bikes/*/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

function findBikePhoto(modelId: string, colorId: string): string | undefined {
  for (const path in bikePhotos) {
    const segments = path.split("/");
    const file = segments[segments.length - 1];
    const folder = segments[segments.length - 2];
    const fileId = file.replace(/\.(jpe?g|png|webp)$/i, "");
    if (folder === modelId && fileId === colorId) return bikePhotos[path];
  }
  return undefined;
}

/*
  Sem isso, o navegador só baixa a foto de um modelo/cor na primeira vez que
  ela aparece na tela — daí aquele delayzinho perceptível na primeira troca
  (depois fica em cache e é instantâneo). Disparando o download de todas em
  segundo plano assim que a página carrega, a primeira troca já vem rápida
  também. `new Image()` sem inserir no DOM só existe pra forçar o fetch.
*/
function preloadAllBikePhotos(): void {
  Object.values(bikePhotos).forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

interface ModelColor {
  id: string;
  name: string;
  /** Cor (ou gradiente) usada na bolinha de seleção. */
  swatch: string;
}

interface Model {
  id: string;
  name: string;
  /** Tamanho do aro, usado só pra agrupar a barra lateral (ex.: "Aro 29"). */
  aro: number;
  colors: ModelColor[];
}

/*
  Paleta única de referência: cada cor sólida usada em qualquer modelo vem
  daqui, então "Azul" tem o mesmo tom em toda a Vullz, não um azul por modelo.
*/
const PALETTE = {
  preto: "#1a1a1a",
  branco: "#f2f2f2",
  vermelho: "#c23b2e",
  azul: "#2f6fb0",
  amarelo: "#f5c518",
  rosa: "#e85d9c",
  verde: "#2f9e58",
  laranja: "#e8791f",
  roxo: "#7c4fb5",
  // Dourado usado nos quadros "azul+dourado": mais metálico que o amarelo da marca.
  dourado: "#c9a227",
} as const;

const PALETTE_NAMES: Record<keyof typeof PALETTE, string> = {
  preto: "Preto",
  branco: "Branco",
  vermelho: "Vermelho",
  azul: "Azul",
  amarelo: "Amarelo",
  rosa: "Rosa",
  verde: "Verde",
  laranja: "Laranja",
  roxo: "Roxo",
  dourado: "Dourado",
};

/** Cor sólida simples: nome e bolinha vêm direto da paleta. */
function solid(id: keyof typeof PALETTE): ModelColor {
  return { id, name: PALETTE_NAMES[id], swatch: PALETTE[id] };
}

/** Quadro de uma cor com dois acentos — bolinha dividida em 3 (como a Oregon). */
function framed(
  id: string,
  name: string,
  frame: keyof typeof PALETTE,
  accentA: keyof typeof PALETTE,
  accentB: keyof typeof PALETTE
): ModelColor {
  return {
    id,
    name,
    swatch: `conic-gradient(from 0deg, ${PALETTE[frame]} 0% 34%, ${PALETTE[accentA]} 34% 67%, ${PALETTE[accentB]} 67% 100%)`,
  };
}

const OREGON_COLORS: ModelColor[] = [
  framed("quadro-preto-azul-dourado", "Quadro Preto (Azul + Dourado)", "preto", "azul", "dourado"),
  framed("quadro-branco-azul-dourado", "Quadro Branco (Azul + Dourado)", "branco", "azul", "dourado"),
  solid("branco"),
  solid("rosa"),
  solid("verde"),
  solid("laranja"),
];

const SLIM_COLORS: ModelColor[] = [
  framed("preto-azul-rosa", "Preto (Azul + Rosa)", "preto", "azul", "rosa"),
];

const STREET_COLORS: ModelColor[] = [solid("roxo"), solid("azul"), solid("laranja"), solid("verde")];
const DOBLE_COLORS: ModelColor[] = [solid("laranja"), solid("verde"), solid("rosa")];
const PULSE_COLORS: ModelColor[] = [solid("azul"), solid("laranja"), solid("verde")];
const MAJESTIC_COLORS: ModelColor[] = [solid("rosa"), solid("preto")];
const PRO_KIDS_COLORS: ModelColor[] = [solid("azul"), solid("vermelho")];
const LOVE_KIDS_COLORS: ModelColor[] = [solid("rosa"), solid("branco")];

const MODELS: Model[] = [
  { id: "oregon", name: "Oregon", aro: 29, colors: OREGON_COLORS },
  { id: "slim", name: "Slim", aro: 29, colors: SLIM_COLORS },
  { id: "street", name: "Street", aro: 26, colors: STREET_COLORS },
  { id: "doble", name: "Doble", aro: 26, colors: DOBLE_COLORS },
  { id: "pulse", name: "Pulse", aro: 20, colors: PULSE_COLORS },
  { id: "majestic", name: "Majestic", aro: 20, colors: MAJESTIC_COLORS },
  { id: "pro-kids", name: "Pro Kids", aro: 16, colors: PRO_KIDS_COLORS },
  { id: "love-kids", name: "Love Kids", aro: 16, colors: LOVE_KIDS_COLORS },
];

/*
  Agrupa a lista (já ordenada por aro) em blocos consecutivos, pra renderizar
  um rótulo "Aro N" acima de cada dupla de modelos na barra lateral.
*/
function groupModelsByAro(models: Model[]): { aro: number; models: Model[] }[] {
  const groups: { aro: number; models: Model[] }[] = [];
  for (const model of models) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.aro === model.aro) {
      lastGroup.models.push(model);
    } else {
      groups.push({ aro: model.aro, models: [model] });
    }
  }
  return groups;
}

/*
  Nada selecionado até o cliente clicar num modelo na lateral: a tela abre
  numa mensagem de convite, não já direto na primeira bike.

  `expandedAro`: por padrão a barra lateral abre mostrando só os rótulos de
  aro (29/26/20/16) — os modelos de um aro só aparecem depois que o cliente
  clica naquele aro. Só um aro fica aberto por vez: abrir outro fecha o
  anterior automaticamente, pra não poluir a lista com vários abertos juntos.
*/
const state: { modelId: string | null; colorId: string | null; expandedAro: number | null } = {
  modelId: null,
  colorId: null,
  expandedAro: null,
};

/*
  Sem foto real ainda: mensagem simples em vez de qualquer desenho de
  substituição — mais honesto que fingir um produto que não existe na tela.
*/
function bikeStageMarkup(model: Model, color: ModelColor): string {
  const photo = findBikePhoto(model.id, color.id);

  if (photo) {
    return /* html */ `
      <img
        src="${photo}"
        alt="${model.name} — ${color.name}"
        class="h-full w-full object-contain"
        style="filter: drop-shadow(0 16px 24px rgba(17,17,17,0.12));"
      />
    `;
  }

  return /* html */ `
    <p class="text-lg font-medium tracking-wide text-vullz-gray-400">Em breve...</p>
  `;
}

function sidebarItemMarkup(model: Model, active: boolean, revealDelayMs: number): string {
  return /* html */ `
    <button
      type="button"
      data-model="${model.id}"
      style="animation-delay:${revealDelayMs}ms; animation-duration:380ms"
      class="model-item reveal-left-in shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-left text-sm font-bold uppercase tracking-widest transition-[transform,color] duration-[var(--dur-hover)] ease-lift hover:translate-x-2 lg:w-full ${
        active ? "text-vullz-black" : "text-vullz-gray-400 hover:text-vullz-black"
      }"
    >
      ${model.name}
    </button>
  `;
}

/*
  Cabeçalho de cada aro agora é um botão (sanfona): controla se os modelos
  daquele aro aparecem ou não. Só a seta gira — o texto do rótulo não muda de
  peso/cor ao abrir, pra não competir com os nomes dos modelos.
*/
function sidebarGroupMarkup(aro: number, models: Model[], activeModelId: string | null, expanded: boolean): string {
  return /* html */ `
    <div class="flex shrink-0 flex-col gap-2">
      <button
        type="button"
        data-aro="${aro}"
        aria-expanded="${expanded}"
        class="flex items-center gap-2 px-4 text-left text-xl font-extrabold uppercase tracking-wide text-vullz-black transition-colors duration-150"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="shrink-0 transition-transform duration-200 ease-out ${expanded ? "rotate-90" : ""}"
        >
          <path d="M2.5 1L7.5 5L2.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Aro ${aro}
      </button>
      ${
        expanded
          ? /* html */ `
            <div class="flex flex-col gap-1">
              ${models
                .map((m, i) => sidebarItemMarkup(m, m.id === activeModelId, i * 70))
                .join("")}
            </div>
          `
          : ""
      }
    </div>
  `;
}

/*
  "(REF. 000/00)" é placeholder de propósito — cada bike vai ganhar seu
  próprio código de referência depois; por enquanto todo mundo mostra zero
  só pra validar onde o texto entra no layout.
*/
function colorLabelMarkup(color: ModelColor): string {
  return /* html */ `${color.name} <span class="text-vullz-gray-400">(REF. 000/00)</span>`;
}

function colorSwatchMarkup(color: ModelColor, active: boolean, revealDelayMs: number): string {
  return /* html */ `
    <button
      type="button"
      data-color="${color.id}"
      aria-label="${color.name}"
      aria-pressed="${active}"
      style="background:${color.swatch}; animation-delay:${revealDelayMs}ms"
      class="color-swatch reveal-left-in h-8 w-8 shrink-0 rounded-full border-2 transition-[border-color,transform] duration-150 ${
        active ? "border-vullz-black scale-110" : "border-vullz-gray-200 hover:border-vullz-gray-500"
      }"
    ></button>
  `;
}

/*
  Entrada suave só na primeira renderização — a mesma linguagem da home
  ([data-reveal], ver main.css/animations.ts). Nas renderizações seguintes
  (clique em aro/modelo) isto fica de fora, senão a página inteira reapareceria
  do zero a cada clique, já que `render()` reconstrói o innerHTML inteiro.
*/
let isFirstRender = true;

function revealAttrs(delayMs: number): string {
  return isFirstRender ? `data-reveal style="transition-delay:${delayMs}ms"` : "";
}

function render(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  const activeModel = MODELS.find((m) => m.id === state.modelId) ?? null;
  const activeColor = activeModel
    ? activeModel.colors.find((c) => c.id === state.colorId) ?? activeModel.colors[0]
    : null;

  /*
    Sem modelo escolhido: convite central, sem cores (não faz sentido mostrar
    seletor de cor de um produto que ainda não apareceu na tela).
  */
  const stageContent =
    activeModel && activeColor
      ? /* html */ `
        <div
          id="bike-stage-inner"
          class="relative h-full w-full"
          style="max-width:1030px; max-height:100vh;"
        ></div>
      `
      : /* html */ `
        <p class="max-w-xs text-balance text-base text-vullz-gray-500">
          Escolha um modelo ao lado para ver a bike.
        </p>
      `;

  /*
    O nome da cor NÃO mora na coluna de bolinhas: os nomes têm tamanhos muito
    diferentes ("Rosa" vs. "Quadro Preto (Azul + Dourado) (REF. 000/00)"), e
    aquela coluna é estreita de propósito (só precisa caber uma bolinha). Texto
    variável numa coluna estreita quebra de um jeito diferente pra cada cor —
    daí as quebras "aleatórias". Resolvido botando o texto embaixo da bike, que
    tem largura de sobra pra qualquer nome caber numa linha só, sempre no
    mesmo lugar.
  */
  const colorRailContent =
    activeModel && activeColor
      ? /* html */ `
        <div class="flex flex-row gap-3 lg:flex-col" role="group" aria-label="Cores disponíveis">
          ${activeModel.colors
            .map((c, i) => colorSwatchMarkup(c, c.id === activeColor.id, i * 35))
            .join("")}
        </div>
      `
      : "";

  app.innerHTML = /* html */ `
    <div class="relative flex h-dvh flex-col overflow-hidden bg-white text-vullz-black">
      <header ${revealAttrs(0)} class="relative z-10 flex shrink-0 items-center px-6 pt-8 sm:px-10">
        <a
          href="/"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-vullz-gray-500 transition-colors duration-150 hover:text-vullz-black"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 8H3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M7.5 3.5L3 8L7.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Voltar
        </a>
      </header>

      <main class="relative z-10 flex flex-1 flex-col gap-4 overflow-hidden px-6 pb-6 sm:px-10 lg:flex-row lg:gap-16 lg:py-8">
        <nav
          ${revealAttrs(90)}
          aria-label="Modelos"
          class="flex shrink-0 gap-4 overflow-x-auto pb-2 lg:w-52 lg:flex-col lg:justify-center lg:gap-5 lg:overflow-visible lg:pb-0"
        >
          ${groupModelsByAro(MODELS)
            .map((g) =>
              sidebarGroupMarkup(
                g.aro,
                g.models,
                activeModel?.id ?? null,
                state.expandedAro === g.aro
              )
            )
            .join("")}
        </nav>

        <section
          ${revealAttrs(170)}
          class="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden"
        >
          <div class="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
            ${stageContent}
          </div>
          ${
            activeModel && activeColor
              ? /* html */ `
                <span id="color-label" class="max-w-full text-center text-xs text-vullz-gray-500">
                  ${colorLabelMarkup(activeColor)}
                </span>
              `
              : ""
          }
        </section>

        <aside
          ${revealAttrs(220)}
          class="flex shrink-0 flex-col items-center gap-2 pb-2 lg:w-auto lg:items-end lg:justify-center lg:gap-4 lg:pb-0"
        >
          ${colorRailContent}
        </aside>
      </main>
    </div>
  `;

  if (isFirstRender) {
    initRevealOnScroll();
    isFirstRender = false;
  }

  if (activeModel && activeColor) {
    paintStage(activeModel, activeColor);
  }
}

/*
  Crossfade de verdade: a camada nova nasce por cima (opacity 0) e sobe pra 1
  enquanto QUALQUER camada anterior desce pra 0 ao mesmo tempo — as duas
  ficam visíveis e se misturando durante a transição inteira. A versão
  anterior escondia a foto (opacity 0), só então trocava o conteúdo por baixo
  e reaparecia: isso cria um instante em que nada aparece, e mesmo rápido
  aquele "nada" lê como um flash/pisca, não como uma dissolução suave. Com
  duas camadas sobrepostas nunca existe esse vazio.
*/
const STAGE_FADE_MS = 220;

function paintStage(model: Model, color: ModelColor): void {
  const container = document.querySelector<HTMLElement>("#bike-stage-inner");
  if (!container) return;

  const layer = document.createElement("div");
  layer.className = "absolute inset-0 flex items-center justify-center";
  layer.style.opacity = "0";
  layer.style.transition = `opacity ${STAGE_FADE_MS}ms linear`;
  layer.innerHTML = bikeStageMarkup(model, color);
  container.appendChild(layer);

  const previousLayers = Array.from(container.children).filter(
    (el): el is HTMLElement => el !== layer
  );

  // Força o navegador a "commitar" o opacity:0 antes de animar — senão ele
  // agrupa criação + transição no mesmo frame e a transição não roda.
  void layer.offsetHeight;

  requestAnimationFrame(() => {
    layer.style.opacity = "1";
    previousLayers.forEach((el) => {
      el.style.transition = `opacity ${STAGE_FADE_MS}ms linear`;
      el.style.opacity = "0";
    });
  });

  window.setTimeout(() => {
    previousLayers.forEach((el) => el.remove());
  }, STAGE_FADE_MS + 50);
}

function swapColor(model: Model, color: ModelColor): void {
  state.colorId = color.id;

  // Feedback dos botões de cor e do rótulo é instantâneo — só a foto esmaece.
  document.querySelectorAll<HTMLElement>("[data-color]").forEach((btn) => {
    const isActive = btn.dataset.color === color.id;
    btn.classList.toggle("border-vullz-black", isActive);
    btn.classList.toggle("scale-110", isActive);
    btn.classList.toggle("border-vullz-gray-200", !isActive);
    btn.classList.toggle("hover:border-vullz-gray-500", !isActive);
  });
  const label = document.querySelector("#color-label");
  if (label) label.innerHTML = colorLabelMarkup(color);

  paintStage(model, color);
}

/*
  Delegação de evento num único listener: sobrevive a cada re-render (que troca
  o innerHTML inteiro), sem precisar re-anexar listener em botão nenhum.
*/
function initInteractions(): void {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    const aroButton = target.closest<HTMLElement>("[data-aro]");
    if (aroButton) {
      const aro = Number(aroButton.dataset.aro);
      state.expandedAro = state.expandedAro === aro ? null : aro;
      render();
      return;
    }

    const modelButton = target.closest<HTMLElement>("[data-model]");
    if (modelButton) {
      const modelId = modelButton.dataset.model!;
      const model = MODELS.find((m) => m.id === modelId);
      state.modelId = modelId;
      state.colorId = model ? model.colors[0].id : state.colorId;
      render();
      return;
    }

    const colorButton = target.closest<HTMLElement>("[data-color]");
    if (colorButton) {
      const colorId = colorButton.dataset.color!;
      const model = MODELS.find((m) => m.id === state.modelId);
      const color = model?.colors.find((c) => c.id === colorId);
      if (!model || !color || colorId === state.colorId) return;
      swapColor(model, color);
      return;
    }
  });
}

render();
initInteractions();

// Depois que a página e seus recursos críticos (CSS, JS, logo) já carregaram
// — pra não competir com eles por banda — começa a baixar todas as fotos.
window.addEventListener("load", preloadAllBikePhotos);
