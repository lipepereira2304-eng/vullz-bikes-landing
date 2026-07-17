import "../styles/main.css";

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
  o arquivo não existe, a silhueta de placeholder entra no lugar, tingida com a
  cor escolhida (campo `tint` de cada ModelColor).
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

interface ModelColor {
  id: string;
  name: string;
  /** Cor (ou gradiente) usada na bolinha de seleção. */
  swatch: string;
  /** Cor usada para tingir a silhueta de placeholder enquanto não há foto. */
  tint: string;
}

interface Model {
  id: string;
  name: string;
  colors: ModelColor[];
}

/*
  Paleta genérica, só até cada modelo ter sua paleta real definida (como já
  fizemos com a Oregon). Troque conforme as cores reais forem chegando.
*/
const PLACEHOLDER_COLORS: ModelColor[] = [
  { id: "preto", name: "Preto", swatch: "#1a1a1a", tint: "#1a1a1a" },
  { id: "branco", name: "Branco", swatch: "#f2f2f2", tint: "#f2f2f2" },
  { id: "vermelho", name: "Vermelho", swatch: "#c23b2e", tint: "#c23b2e" },
  { id: "azul", name: "Azul", swatch: "#2f6fb0", tint: "#2f6fb0" },
  { id: "amarelo", name: "Amarelo", swatch: "#f5c518", tint: "#f5c518" },
];

// Dourado usado nos quadros "azul+dourado": mais metálico que o amarelo da marca.
const DOURADO = "#c9a227";
const AZUL = "#2f6fb0";

const OREGON_COLORS: ModelColor[] = [
  {
    id: "quadro-preto-azul-dourado",
    name: "Quadro Preto (Azul + Dourado)",
    swatch: `conic-gradient(from 0deg, #1a1a1a 0% 34%, ${AZUL} 34% 67%, ${DOURADO} 67% 100%)`,
    tint: "#1a1a1a",
  },
  {
    id: "quadro-branco-azul-dourado",
    name: "Quadro Branco (Azul + Dourado)",
    swatch: `conic-gradient(from 0deg, #f2f2f2 0% 34%, ${AZUL} 34% 67%, ${DOURADO} 67% 100%)`,
    tint: "#e4e4e4",
  },
  { id: "branco", name: "Branco", swatch: "#f2f2f2", tint: "#e4e4e4" },
  { id: "rosa", name: "Rosa", swatch: "#e85d9c", tint: "#e85d9c" },
  { id: "verde", name: "Verde", swatch: "#2f9e58", tint: "#2f9e58" },
  { id: "laranja", name: "Laranja", swatch: "#e8791f", tint: "#e8791f" },
];

const MODELS: Model[] = [
  { id: "oregon", name: "Oregon", colors: OREGON_COLORS },
  { id: "slim", name: "Slim", colors: PLACEHOLDER_COLORS },
  { id: "street", name: "Street", colors: PLACEHOLDER_COLORS },
  { id: "doble", name: "Doble", colors: PLACEHOLDER_COLORS },
  { id: "pulse", name: "Pulse", colors: PLACEHOLDER_COLORS },
  { id: "majestic", name: "Majestic", colors: PLACEHOLDER_COLORS },
  { id: "pro-kids", name: "Pro Kids", colors: PLACEHOLDER_COLORS },
  { id: "love-kids", name: "Love Kids", colors: PLACEHOLDER_COLORS },
];

const state = {
  modelId: MODELS[0].id,
  colorId: MODELS[0].colors[0].id,
};

/*
  Silhueta única reaproveitada enquanto não há fotografia real daquele
  modelo+cor. `stroke="var(--bike-color)"` é o que permite trocar só a cor via
  CSS, sem re-renderizar o SVG inteiro. A sombra suave (drop-shadow) é o que
  separa a bike do fundo branco infinito mesmo quando a cor escolhida é branca.
*/
function bikePlaceholderMarkup(tint: string): string {
  return /* html */ `
    <svg
      id="bike-shape"
      viewBox="0 0 200 120"
      width="100%"
      height="100%"
      style="--bike-color:${tint}; max-width: 380px; filter: drop-shadow(0 12px 20px rgba(17,17,17,0.12));"
    >
      <g fill="none" stroke="var(--bike-color)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" class="transition-colors duration-200">
        <circle cx="40" cy="90" r="22" />
        <circle cx="160" cy="90" r="22" />
        <path d="M40 90 L85 45 L130 90 M85 45 L70 20 M62 20 H82 M85 45 L160 90 M60 90 H110" />
        <path d="M100 20 H120 L130 45" />
      </g>
    </svg>
  `;
}

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

  return bikePlaceholderMarkup(color.tint);
}

function sidebarItemMarkup(model: Model, active: boolean): string {
  return /* html */ `
    <button
      type="button"
      data-model="${model.id}"
      class="model-item shrink-0 whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-wide transition-[transform,color] duration-[var(--dur-hover)] ease-lift hover:translate-x-2 lg:w-full ${
        active ? "text-vullz-black" : "text-vullz-gray-400 hover:text-vullz-black"
      }"
    >
      ${model.name}
    </button>
  `;
}

function colorSwatchMarkup(color: ModelColor, active: boolean): string {
  return /* html */ `
    <button
      type="button"
      data-color="${color.id}"
      aria-label="${color.name}"
      aria-pressed="${active}"
      style="background:${color.swatch}"
      class="color-swatch h-8 w-8 shrink-0 rounded-full border-2 transition-[border-color,transform] duration-150 ${
        active ? "border-vullz-black scale-110" : "border-vullz-gray-200 hover:border-vullz-gray-500"
      }"
    ></button>
  `;
}

function render(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  const activeModel = MODELS.find((m) => m.id === state.modelId) ?? MODELS[0];
  const activeColor =
    activeModel.colors.find((c) => c.id === state.colorId) ?? activeModel.colors[0];

  app.innerHTML = /* html */ `
    <div class="relative flex min-h-dvh flex-col bg-white text-vullz-black">
      <header class="relative z-10 flex items-center px-6 pt-8 sm:px-10">
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

      <main class="relative z-10 flex flex-1 flex-col gap-8 px-6 pb-10 sm:px-10 lg:flex-row lg:gap-16 lg:py-16">
        <nav
          aria-label="Modelos"
          class="flex gap-1.5 overflow-x-auto pb-2 lg:w-48 lg:shrink-0 lg:flex-col lg:justify-center lg:gap-1 lg:overflow-visible lg:pb-0"
        >
          ${MODELS.map((m) => sidebarItemMarkup(m, m.id === activeModel.id)).join("")}
        </nav>

        <section class="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <div class="flex aspect-square w-full max-w-md items-center justify-center">
            ${bikeStageMarkup(activeModel, activeColor)}
          </div>

          <div class="flex flex-col items-center gap-3">
            <div class="flex items-center gap-3" role="group" aria-label="Cores disponíveis">
              ${activeModel.colors
                .map((c) => colorSwatchMarkup(c, c.id === activeColor.id))
                .join("")}
            </div>
            <span id="color-label" class="text-xs text-vullz-gray-500">${activeColor.name}</span>
          </div>
        </section>
      </main>
    </div>
  `;
}

/*
  Delegação de evento num único listener: sobrevive a cada re-render (que troca
  o innerHTML inteiro), sem precisar re-anexar listener em botão nenhum.
*/
function initInteractions(): void {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

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
      state.colorId = colorButton.dataset.color!;
      render();
      return;
    }
  });
}

render();
initInteractions();
