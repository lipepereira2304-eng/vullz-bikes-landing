import "../styles/main.css";
import { initRevealOnScroll } from "./animations";
// Mesmo arquivo usado no catálogo das bikes: logo da home recolorido de
// branco pra preto (o original foi feito pra fundo grafite, e aqui a página
// também é branca).
import vullzLogo from "../assets/images/vullz-logo-dark-text.webp";

/*
  Catálogo interativo dos ELÉTRICOS — mesmo espírito do catálogo das bikes
  (src/scripts/catalogo-interativo.ts): fundo branco, foto grande "flutuando",
  troca de cor com crossfade, ficha técnica em modo foco. Reaproveita a mesma
  folha de estilos (main.css) e os mesmos seletores [data-role="..."], então
  nenhuma CSS nova precisou ser escrita pra esta página.

  A diferença fica só na estrutura de dados: aqui não existe agrupamento por
  aro — os modelos aparecem soltos, direto na lateral, sem gaveta de
  categoria nenhuma (foi um pedido explícito, diferente do catálogo das
  bikes).

  FOTOS: src/assets/eletricos/<model-id>/<color-id>.jpg (ou .jpeg/.png/.webp),
  mesma convenção do catálogo das bikes. Enquanto não existe, aparece
  "Em breve..." no lugar da foto.

  LOGOS: src/assets/eletricos/<model-id>/logo.svg (ou .png/.webp) — nenhum
  modelo tem logo própria ainda, então todos caem no nome em texto por
  enquanto (ver modelNameMarkup). Assim que uma logo for adicionada nessa
  pasta, ela entra automaticamente, sem precisar tocar neste arquivo.
*/
const bikePhotos = import.meta.glob<string>(
  ["../assets/eletricos/*/*.{jpg,jpeg,png,webp}", "!../assets/eletricos/*/logo.*"],
  { eager: true, import: "default" }
);

const modelLogos = import.meta.glob<string>("../assets/eletricos/*/logo.{svg,png,webp}", {
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

function findModelLogo(modelId: string): string | undefined {
  for (const path in modelLogos) {
    const segments = path.split("/");
    const folder = segments[segments.length - 2];
    if (folder === modelId) return modelLogos[path];
  }
  return undefined;
}

/*
  Mesmo motivo do catálogo das bikes: dispara o download de todas as fotos e
  logos em segundo plano assim que a página carrega, pra primeira troca de
  modelo/cor já vir do cache em vez de esperar a rede.
*/
function preloadAllBikePhotos(): void {
  [...Object.values(bikePhotos), ...Object.values(modelLogos)].forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

interface ModelColor {
  id: string;
  name: string;
  /** Cor usada na bolinha de seleção. */
  swatch: string;
}

interface Model {
  id: string;
  name: string;
  colors: ModelColor[];
}

/*
  3 cores padrão por enquanto, as mesmas pra todo modelo — REFs e detalhes
  finos ficam pra depois. Mantém o mesmo padrão de override do catálogo das
  bikes (MODEL_COLOR_OVERRIDES/resolveColor): hoje vazio porque nenhum modelo
  precisa de um tom próprio ainda, mas se algum elétrico precisar (ex.: um
  "vermelho" ligeiramente diferente), é só adicionar uma entrada aqui, sem
  mexer no resto.
*/
const PALETTE = {
  branco: "#fcfefd",
  preto: "#060606",
  vermelho: "#c60314",
} as const;

const PALETTE_NAMES: Record<keyof typeof PALETTE, string> = {
  branco: "Branco",
  preto: "Preto",
  vermelho: "Vermelho",
};

const MODEL_COLOR_OVERRIDES: Partial<Record<string, Partial<Record<keyof typeof PALETTE, string>>>> = {};

function resolveColor(modelId: string, key: keyof typeof PALETTE): string {
  return MODEL_COLOR_OVERRIDES[modelId]?.[key] ?? PALETTE[key];
}

function solid(modelId: string, id: keyof typeof PALETTE): ModelColor {
  return { id, name: PALETTE_NAMES[id], swatch: resolveColor(modelId, id) };
}

const DEFAULT_COLOR_IDS: (keyof typeof PALETTE)[] = ["branco", "preto", "vermelho"];

function defaultColors(modelId: string): ModelColor[] {
  return DEFAULT_COLOR_IDS.map((id) => solid(modelId, id));
}

const MODELS: Model[] = [
  { id: "urban-citycoco", name: "Urban Citycoco", colors: defaultColors("urban-citycoco") },
  { id: "urban-drive", name: "Urban Drive", colors: defaultColors("urban-drive") },
  { id: "urban-max", name: "Urban Max", colors: defaultColors("urban-max") },
  { id: "urban-plus", name: "Urban Plus", colors: defaultColors("urban-plus") },
  { id: "v-10", name: "V-10", colors: defaultColors("v-10") },
  { id: "v-50", name: "V-50", colors: defaultColors("v-50") },
];

/*
  Nada selecionado até o cliente clicar num modelo na lateral — mesma
  convenção do catálogo das bikes. Sem `expandedAro` aqui: não existe
  agrupamento por aro nesta página, os modelos já aparecem todos soltos.
*/
const state: {
  modelId: string | null;
  colorId: string | null;
  /** Modo foco: ficha técnica aberta, cores recolhidas. */
  focusMode: boolean;
} = {
  modelId: null,
  colorId: null,
  focusMode: false,
};

/*
  Sem foto real ainda: mensagem simples em vez de qualquer desenho de
  substituição.
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

/*
  Mesma técnica do catálogo das bikes: `absolute` no topo do contêiner da
  bike, pra nunca disputar altura com a foto (que continua recebendo o
  espaço inteiro, com ou sem logo). Enquanto nenhum modelo tem logo própria,
  todos caem no nome em texto puro.
*/
function modelNameMarkup(model: Model): string {
  const logo = findModelLogo(model.id);

  if (logo) {
    return /* html */ `
      <div
        data-role="model-logo"
        class="absolute left-1/2 top-0 z-10 h-11 w-full max-w-xl -translate-x-1/2 sm:h-14 lg:h-[77px]"
      >
        <img src="${logo}" alt="${model.name}" class="h-full w-full object-contain" />
      </div>
    `;
  }

  return /* html */ `
    <h1 class="absolute left-1/2 top-0 z-10 w-full max-w-xl -translate-x-1/2 text-center text-2xl font-extrabold uppercase tracking-wide text-vullz-black">
      ${model.name}
    </h1>
  `;
}

/*
  Sem gaveta de aro: cada modelo já é uma linha direta na lateral, com o
  mesmo visual de sublinhado do catálogo das bikes (ativo = traço mais
  grosso e preto). No mobile continua como tira horizontal de chips.
*/
function sidebarItemMarkup(model: Model, active: boolean, revealDelayMs: number): string {
  return /* html */ `
    <button
      type="button"
      data-model="${model.id}"
      style="animation-delay:${revealDelayMs}ms; animation-duration:380ms"
      class="model-item reveal-left-in shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-left text-sm font-bold uppercase tracking-widest transition-[transform,color,border-color] duration-[var(--dur-hover)] ease-lift hover:translate-x-2 lg:block lg:w-full lg:whitespace-normal lg:rounded-none lg:px-0 lg:py-3 ${
        active
          ? "text-vullz-black lg:border-b-2 lg:border-vullz-black"
          : "text-vullz-gray-400 hover:text-vullz-black lg:border-b lg:border-vullz-gray-200"
      }"
    >
      ${model.name}
    </button>
  `;
}

/*
  Sem REF ainda (não fornecido pro elétricos) — só o nome da cor por
  enquanto. Quando os códigos chegarem, dá pra copiar o mesmo padrão do
  catálogo das bikes (campo `ref` no ModelColor + span cinza aqui).
*/
function colorLabelMarkup(color: ModelColor): string {
  return /* html */ `${color.name}`;
}

/*
  Preenchimento e anel de borda como elementos separados — mesmo motivo do
  catálogo das bikes (evita o "corte" de sub-pixel no círculo animado).
*/
function colorSwatchMarkup(color: ModelColor, active: boolean, revealDelayMs: number): string {
  return /* html */ `
    <button
      type="button"
      data-color="${color.id}"
      aria-label="${color.name}"
      aria-pressed="${active}"
      style="animation-delay:${revealDelayMs}ms"
      class="color-swatch reveal-left-in relative h-8 w-8 shrink-0 rounded-full border-2 transition-[border-color,transform] duration-150 ${
        active ? "border-vullz-black scale-110" : "border-vullz-gray-200 hover:border-vullz-gray-500"
      }"
    >
      <span class="absolute inset-[2px] rounded-full" style="background:${color.swatch};"></span>
    </button>
  `;
}

/*
  Entrada suave só na primeira renderização — mesma convenção do catálogo
  das bikes (ver [data-reveal] em main.css/animations.ts).
*/
let isFirstRender = true;

function revealAttrs(delayMs: number): string {
  return isFirstRender ? `data-reveal style="transition-delay:${delayMs}ms"` : "";
}

/*
  Mesmo motivo do catálogo das bikes: render() reconstrói o innerHTML
  inteiro toda vez, então guardamos qual foi o último modelo pintado pra
  decidir se a troca merece entrada lenta (modelo novo) ou rápida (só cor).
*/
let lastPaintedModelId: string | null = null;

/*
  Logo Vullz no canto direito do cabeçalho — idêntico ao catálogo das bikes.
*/
function headerBrandMarkup(): string {
  return /* html */ `
    <a href="/" aria-label="Vullz" class="inline-flex items-center">
      <img src="${vullzLogo}" alt="Vullz" class="h-[30px] w-auto sm:h-9" />
    </a>
  `;
}

/*
  "Voltar" com contorno + casinha ao lado, os dois à esquerda — idêntico ao
  catálogo das bikes.
*/
function headerBackMarkup(): string {
  return /* html */ `
    <div class="flex items-center gap-3">
      <a
        href="/"
        data-role="header-back"
        class="inline-flex items-center gap-1.5 rounded-full border border-vullz-gray-500 px-4 py-1.5 text-sm font-medium text-vullz-gray-500 transition-colors duration-150 hover:border-vullz-black hover:text-vullz-black"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 8H3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M7.5 3.5L3 8L7.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Voltar
      </a>
      <a
        href="/"
        aria-label="Página inicial"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-vullz-gray-500 transition-colors duration-150 hover:text-vullz-black"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.5L8 2.5L14 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M3.5 6.5V13.5H12.5V6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6.5 13.5V9.5H9.5V13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
    </div>
  `;
}

/*
  pt-4 empurra só a bike pra baixo, sem mexer no logo — idêntico ao catálogo
  das bikes (ver comentário lá pra explicação completa da técnica).
*/
function bikeWrapperMarkup(activeModel: Model | null, stageContent: string): string {
  return /* html */ `
    <div data-role="bike-wrapper" class="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden pt-4">
      ${activeModel ? modelNameMarkup(activeModel) : ""}
      ${stageContent}
    </div>
  `;
}

function render(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  const activeModel = MODELS.find((m) => m.id === state.modelId) ?? null;
  const activeColor = activeModel
    ? activeModel.colors.find((c) => c.id === state.colorId) ?? activeModel.colors[0]
    : null;

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
          Escolha um modelo ao lado para ver o elétrico.
        </p>
      `;

  const colorRailContent =
    activeModel && activeColor
      ? /* html */ `
        <div
          class="flex flex-row items-center gap-3 rounded-full border border-vullz-gray-500 px-3 py-2 lg:flex-col lg:gap-4 lg:px-2.5 lg:py-4"
          role="group"
          aria-label="Cores disponíveis"
        >
          ${activeModel.colors
            .map((c, i) => colorSwatchMarkup(c, c.id === activeColor.id, i * 35))
            .join("")}
        </div>
      `
      : "";

  const specsContent =
    activeModel && activeColor
      ? /* html */ `
        <div class="specs-panel-inner">
          <h2 class="text-lg font-extrabold uppercase tracking-wide text-vullz-black">Ficha técnica</h2>
          <p class="mt-1 text-xs text-vullz-gray-500">
            ${activeModel.name} — ${colorLabelMarkup(activeColor)}
          </p>
          <div class="mt-6 text-sm leading-relaxed text-vullz-gray-500">
            Em breve, as especificações completas deste modelo vão aparecer aqui.
          </div>
        </div>
      `
      : "";

  app.innerHTML = /* html */ `
    <div class="relative flex h-dvh flex-col overflow-hidden bg-white text-vullz-black">
      <header ${revealAttrs(0)} class="relative z-10 flex shrink-0 items-center justify-between px-6 pt-8 sm:px-10">
        ${headerBackMarkup()}
        ${headerBrandMarkup()}
      </header>

      <main
        data-role="catalog-main"
        class="relative z-10 flex flex-1 flex-col gap-4 overflow-hidden px-6 pb-6 sm:px-10 lg:flex-row lg:gap-16 lg:py-8"
      >
        <nav
          ${revealAttrs(90)}
          data-role="model-nav"
          aria-label="Modelos"
          class="flex shrink-0 gap-4 overflow-x-auto pb-2 lg:w-52 lg:flex-col lg:justify-center lg:gap-0 lg:overflow-visible"
        >
          ${MODELS.map((m, i) => sidebarItemMarkup(m, m.id === activeModel?.id, i * 70)).join("")}
        </nav>

        <section
          ${revealAttrs(170)}
          data-role="stage-section"
          class="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden"
        >
          ${bikeWrapperMarkup(activeModel, stageContent)}
          ${
            activeModel && activeColor
              ? /* html */ `
                <span id="color-label" class="max-w-full text-center text-xs text-vullz-gray-500">
                  ${colorLabelMarkup(activeColor)}
                </span>
                <button
                  type="button"
                  data-action="open-specs"
                  class="inline-flex items-center gap-1.5 rounded-full border border-vullz-gray-200 px-4 py-1.5 text-xs font-medium text-vullz-gray-700 transition-colors duration-150 hover:border-vullz-black hover:text-vullz-black"
                >
                  Ficha técnica
                </button>
              `
              : ""
          }
        </section>

        <aside
          ${revealAttrs(220)}
          data-role="color-rail"
          class="flex shrink-0 flex-col items-center gap-2 pb-2 lg:w-auto lg:items-end lg:justify-center lg:gap-4 lg:pb-0"
        >
          ${colorRailContent}
        </aside>

        <div
          id="specs-panel"
          data-role="specs-panel"
          aria-label="Ficha técnica"
          aria-hidden="${state.focusMode ? "false" : "true"}"
          class="${state.focusMode ? "is-focus-open" : ""}"
        >
          ${specsContent}
        </div>
      </main>
    </div>
  `;

  if (isFirstRender) {
    initRevealOnScroll();
    isFirstRender = false;
  }

  if (activeModel && activeColor) {
    const kind: StageTransition = activeModel.id === lastPaintedModelId ? "color" : "model";
    paintStage(activeModel, activeColor, kind);
    lastPaintedModelId = activeModel.id;
  } else {
    lastPaintedModelId = null;
  }
}

/*
  Crossfade idêntico ao catálogo das bikes — ver comentário lá pra explicação
  completa (duas camadas sobrepostas, duas velocidades conforme o motivo da
  troca).
*/
type StageTransition = "model" | "color";

const COLOR_FADE_MS = 220;
const MODEL_FADE_MS = 900;

function paintStage(model: Model, color: ModelColor, kind: StageTransition = "color"): void {
  const container = document.querySelector<HTMLElement>("#bike-stage-inner");
  if (!container) return;

  const isModel = kind === "model";
  const durationMs = isModel ? MODEL_FADE_MS : COLOR_FADE_MS;
  const easing = isModel ? "var(--ease-glide)" : "linear";

  const layer = document.createElement("div");
  layer.className = "absolute inset-0 flex items-center justify-center";
  layer.style.opacity = "0";
  layer.style.transform = isModel ? "translateY(12px)" : "translateY(0)";
  layer.style.transition = isModel
    ? `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`
    : `opacity ${durationMs}ms ${easing}`;
  layer.innerHTML = bikeStageMarkup(model, color);
  container.appendChild(layer);

  const previousLayers = Array.from(container.children).filter(
    (el): el is HTMLElement => el !== layer
  );

  void layer.offsetHeight;

  requestAnimationFrame(() => {
    layer.style.opacity = "1";
    if (isModel) layer.style.transform = "translateY(0)";
    previousLayers.forEach((el) => {
      el.style.transition = `opacity ${durationMs}ms ${easing}`;
      el.style.opacity = "0";
    });
  });

  window.setTimeout(() => {
    previousLayers.forEach((el) => el.remove());
  }, durationMs + 50);
}

function swapColor(model: Model, color: ModelColor): void {
  state.colorId = color.id;

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
  Modo foco (ficha técnica) — idêntico ao catálogo das bikes, incluindo o
  respiro extra entre logo e bike quando o painel abre (ver main.css).
*/
function setFocusMode(on: boolean): void {
  state.focusMode = on;

  const main = document.querySelector<HTMLElement>('[data-role="catalog-main"]');
  const nav = document.querySelector<HTMLElement>('[data-role="model-nav"]');
  const rail = document.querySelector<HTMLElement>('[data-role="color-rail"]');
  const panel = document.querySelector<HTMLElement>('[data-role="specs-panel"]');
  const logo = document.querySelector<HTMLElement>('[data-role="model-logo"]');
  const bikeWrapper = document.querySelector<HTMLElement>('[data-role="bike-wrapper"]');

  // stage-section não recebe mais nenhuma classe aqui: o padding-right que
  // existia nela reservava um espaço fantasma que nunca virava o painel de
  // verdade (ver main.css) — removido, o painel agora cresce (64rem) pra
  // ocupar essa mesma faixa sozinho.
  main?.classList.toggle("is-focus-open", on);
  nav?.classList.toggle("is-focus-collapsed", on);
  rail?.classList.toggle("is-focus-collapsed", on);
  logo?.classList.toggle("is-focus-open", on);
  bikeWrapper?.classList.toggle("is-focus-open", on);

  if (panel) {
    panel.classList.toggle("is-focus-open", on);
    panel.setAttribute("aria-hidden", on ? "false" : "true");
  }
}

/*
  Delegação de evento num único listener — sobrevive a cada re-render. Sem
  branch de aro aqui (não existe nesta página).
*/
function initInteractions(): void {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.focusMode) setFocusMode(false);
  });

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    const backLink = target.closest<HTMLElement>('[data-role="header-back"]');
    if (backLink && state.focusMode) {
      event.preventDefault();
      setFocusMode(false);
      return;
    }

    const specsButton = target.closest<HTMLElement>('[data-action="open-specs"]');
    if (specsButton) {
      setFocusMode(true);
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

window.addEventListener("load", preloadAllBikePhotos);
