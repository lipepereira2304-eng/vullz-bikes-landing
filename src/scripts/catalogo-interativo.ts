import "../styles/main.css";
import { initRevealOnScroll } from "./animations";
// Mesmo arquivo da home, mas com "VULLZ" recolorido de branco pra preto: o
// original foi feito pra fundo grafite, e aqui a página é branca.
import vullzLogo from "../assets/images/vullz-logo-dark-text.webp";

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

  LOGOS: mesma ideia, mas em src/assets/bikes/<model-id>/logo.svg (ou .png/
  .webp) — a imagem/nome estilizado de cada modelo, que aparece acima da bike
  no lugar do texto simples. Enquanto não existe, cai de volta no nome em
  texto (ver modelNameMarkup). O "!.../logo.*" abaixo existe só pra excluir
  esses arquivos do glob de fotos — sem isso, logo.webp seria também testado
  (inutilmente) como se fosse a foto de uma cor chamada "logo".
*/
const bikePhotos = import.meta.glob<string>(
  ["../assets/bikes/*/*.{jpg,jpeg,png,webp}", "!../assets/bikes/*/logo.*"],
  { eager: true, import: "default" }
);

const modelLogos = import.meta.glob<string>("../assets/bikes/*/logo.{svg,png,webp}", {
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
  Sem isso, o navegador só baixa a foto de um modelo/cor (ou logo) na primeira
  vez que ela aparece na tela — daí aquele delayzinho perceptível na primeira
  troca (depois fica em cache e é instantâneo). Disparando o download de todas
  em segundo plano assim que a página carrega, a primeira troca já vem rápida
  também. `new Image()` sem inserir no DOM só existe pra forçar o fetch.
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
  Paleta de referência: valores reais passados pelo cliente, usando a tabela
  da Oregon como base (foi a mais completa que ele mandou). Uma cor com o
  mesmo NOME pode ter um tom levemente diferente por modelo — ver
  MODEL_COLOR_OVERRIDES logo abaixo — mas quando ele não especificou um tom
  próprio pra um modelo, é este valor daqui que é usado ("pode usar o mesmo
  que eu já citei acima").
*/
const PALETTE = {
  preto: "#060606",
  branco: "#fcfefd",
  // Só a Pro Kids usa vermelho hoje; valor já é o tom que o cliente mandou pra ela.
  vermelho: "#c60314",
  azul: "#0084d2",
  amarelo: "#f5c518",
  rosa: "#fa1589",
  verde: "#82fc03",
  laranja: "#fc3901",
  // Só a Street usa roxo hoje; valor já é o tom que o cliente mandou pra ela.
  roxo: "#2a1359",
  dourado: "#d9a553",
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

/*
  Alguns modelos pintam a mesma cor (mesmo nome) num tom próprio — ex.: o
  "azul" da Slim não é o mesmo azul da Oregon. Isso só existe pros casos que o
  cliente destacou explicitamente; qualquer modelo/cor fora daqui cai no valor
  compartilhado de PALETTE acima.
*/
const MODEL_COLOR_OVERRIDES: Partial<Record<string, Partial<Record<keyof typeof PALETTE, string>>>> = {
  slim: { azul: "#00b2f4", rosa: "#ec4891" },
  street: { azul: "#00cbfa" },
  pulse: { azul: "#01aaaf" },
  majestic: { rosa: "#fd35a2" },
  "pro-kids": { azul: "#054493" },
  "love-kids": { rosa: "#fd7ec1" },
};

function resolveColor(modelId: string, key: keyof typeof PALETTE): string {
  return MODEL_COLOR_OVERRIDES[modelId]?.[key] ?? PALETTE[key];
}

/** Cor sólida simples: nome vem da paleta, tom pode ser específico do modelo. */
function solid(modelId: string, id: keyof typeof PALETTE): ModelColor {
  return { id, name: PALETTE_NAMES[id], swatch: resolveColor(modelId, id) };
}

/** Quadro de uma cor com dois acentos — bolinha dividida em 3 (como a Oregon). */
function framed(
  modelId: string,
  id: string,
  name: string,
  frame: keyof typeof PALETTE,
  accentA: keyof typeof PALETTE,
  accentB: keyof typeof PALETTE
): ModelColor {
  return {
    id,
    name,
    swatch: `conic-gradient(from 0deg, ${resolveColor(modelId, frame)} 0% 34%, ${resolveColor(modelId, accentA)} 34% 67%, ${resolveColor(modelId, accentB)} 67% 100%)`,
  };
}

const OREGON_COLORS: ModelColor[] = [
  framed("oregon", "quadro-preto-azul-dourado", "Quadro Preto (Azul + Dourado)", "preto", "azul", "dourado"),
  framed("oregon", "quadro-branco-azul-dourado", "Quadro Branco (Azul + Dourado)", "branco", "azul", "dourado"),
  solid("oregon", "branco"),
  solid("oregon", "rosa"),
  solid("oregon", "verde"),
  solid("oregon", "laranja"),
];

const SLIM_COLORS: ModelColor[] = [
  framed("slim", "preto-azul-rosa", "Preto (Azul + Rosa)", "preto", "azul", "rosa"),
];

const STREET_COLORS: ModelColor[] = [
  solid("street", "roxo"),
  solid("street", "azul"),
  solid("street", "laranja"),
  solid("street", "verde"),
];
const DOBLE_COLORS: ModelColor[] = [solid("doble", "laranja"), solid("doble", "verde"), solid("doble", "rosa")];
const PULSE_COLORS: ModelColor[] = [solid("pulse", "azul"), solid("pulse", "laranja"), solid("pulse", "verde")];
const MAJESTIC_COLORS: ModelColor[] = [solid("majestic", "rosa"), solid("majestic", "preto")];
const PRO_KIDS_COLORS: ModelColor[] = [solid("pro-kids", "azul"), solid("pro-kids", "vermelho")];
const LOVE_KIDS_COLORS: ModelColor[] = [solid("love-kids", "rosa"), solid("love-kids", "branco")];

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
const state: {
  modelId: string | null;
  colorId: string | null;
  expandedAro: number | null;
  /** Modo foco: ficha técnica aberta, aro/cores recolhidos. */
  focusMode: boolean;
} = {
  modelId: null,
  colorId: null,
  expandedAro: null,
  focusMode: false,
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

/*
  Com logo (src/assets/bikes/<model-id>/logo.*): um detalhe pequeno, não o
  protagonista — a bike é o foco máximo. Por isso o logo é `absolute`,
  flutuando por cima do topo do PRÓPRIO contêiner da bike (não mais um item
  de flex-col em sequência com ele): assim ele nunca disputa altura com a
  bike, que continua recebendo exatamente o mesmo espaço que teria se o logo
  não existisse. h-full+object-contain (mesma técnica da foto da bike)
  garante que o logo nunca estica: encolhe pra caber na largura se precisar.

  Sem logo ainda: cai de volta pro nome em texto puro — é o que faz os outros
  modelos continuarem funcionando normalmente enquanto só a Oregon tem
  imagem própria. Também `absolute` (mesma posição), e não só por
  consistência: o contêiner-pai é `flex` sem `flex-col`, então um item
  normal ficaria lado a lado com a bike (linha), não acima dela.
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
  No desktop cada modelo vira uma linha com sublinhado (não mais um "pill"
  solto): resolve a reclamação de tudo parecer "flutuando" sem alinhamento.
  A linha do modelo ATIVO fica mais grossa e preta em vez de preencher o
  fundo — mantém a paleta clean, só reforça o traço. No mobile mantém o
  visual anterior (chip arredondado numa tira horizontal) — não foi pedido
  mexer nesse layout, só na barra lateral do desktop.
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
  Cabeçalho de cada aro agora é um botão (sanfona): controla se os modelos
  daquele aro aparecem ou não. Só a seta gira — o texto do rótulo não muda de
  peso/cor ao abrir, pra não competir com os nomes dos modelos.

  No desktop, o cabeçalho também ganha o mesmo sublinhado dos modelos (mesma
  linguagem visual, uma lista contínua de "linhas"), e o espaçamento entre
  aros vem do gap do <nav> (ver render()) — bem maior que antes.
*/
function sidebarGroupMarkup(aro: number, models: Model[], activeModelId: string | null, expanded: boolean): string {
  return /* html */ `
    <div class="flex shrink-0 flex-col gap-2 lg:gap-0">
      <button
        type="button"
        data-aro="${aro}"
        aria-expanded="${expanded}"
        class="flex items-center gap-2 px-4 text-left text-xl font-extrabold uppercase tracking-wide text-vullz-black transition-colors duration-150 lg:border-b lg:border-vullz-gray-200 lg:px-0 lg:pb-3"
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
            <div class="flex flex-col gap-1 lg:mt-2 lg:gap-0">
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

/*
  Preenchimento e anel de borda são dois elementos separados de propósito:
  quando o background e o border-radius vivem no MESMO elemento, o navegador
  às vezes deixa um fiapo de 1px sem cobrir num ponto do círculo (mais visível
  em elementos pequenos e animados) — lê como um "corte" na borda. Um span
  interno, recuado a distância exata da borda, cobre tudo com folga e não
  depende desse alinhamento de sub-pixel.
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
  Entrada suave só na primeira renderização — a mesma linguagem da home
  ([data-reveal], ver main.css/animations.ts). Nas renderizações seguintes
  (clique em aro/modelo) isto fica de fora, senão a página inteira reapareceria
  do zero a cada clique, já que `render()` reconstrói o innerHTML inteiro.
*/
let isFirstRender = true;

function revealAttrs(delayMs: number): string {
  return isFirstRender ? `data-reveal style="transition-delay:${delayMs}ms"` : "";
}

/*
  render() reconstrói o app.innerHTML inteiro toda vez (clique em aro, clique
  em modelo, etc.) — então #bike-stage-inner é sempre um contêiner novo e
  vazio, mesmo quando o modelo continuou o mesmo (ex.: só abriu/fechou um
  aro na lateral). paintStage() precisa rodar de qualquer jeito pra preencher
  esse contêiner novo, mas a VELOCIDADE da entrada deve mudar conforme o
  motivo: guardamos qual foi o último modelo pintado pra saber se isto é uma
  troca de modelo de verdade (entrada lenta, tipo home) ou só um re-render
  incidental do mesmo modelo (entrada rápida, quase imperceptível).
*/
let lastPaintedModelId: string | null = null;

/*
  Logo Vullz no canto direito do cabeçalho — reintroduz um toque de
  identidade da marca nesta página (que não tem mais o logo grande em cima,
  removido lá no início).
*/
function headerBrandMarkup(): string {
  return /* html */ `
    <a href="/" aria-label="Vullz" class="inline-flex items-center">
      <img src="${vullzLogo}" alt="Vullz" class="h-[30px] w-auto sm:h-9" />
    </a>
  `;
}

/*
  "Voltar" com contorno (mesmo tom cinza do texto) + ícone de casinha ao
  lado, os dois à esquerda. A casinha vai direto pra home sempre — diferente
  do "Voltar", que sai do modo foco antes de navegar quando a ficha técnica
  está aberta (ver initInteractions). Os dois levarem ao mesmo lugar não é
  redundância à toa: a casinha é um atalho reconhecível por ícone, útil
  conforme a página crescer e o "Voltar" ganhar outros significados também.
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
  pt-4 aqui empurra só a BIKE pra baixo, sem mexer no logo. O logo é
  `position:absolute` com `top:0`, e a referência desse `top:0` é a borda do
  próprio contêiner — ela não se move quando o padding muda, só o conteúdo em
  fluxo (a bike, centralizada aqui dentro por items-center/justify-center) é
  que desce. É como se ganha mais respiro entre os dois sem risco de cortar o
  logo: ele já está encostado no topo, e empurrá-lo pra cima exigiria invadir
  a área com overflow:hidden (necessário pra conter o crossfade da bike),
  cortando a própria imagem do logo.
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
          class="flex shrink-0 gap-4 overflow-x-auto pb-2 lg:w-52 lg:flex-col lg:justify-center lg:gap-8 lg:overflow-visible"
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
  Crossfade de verdade: a camada nova nasce por cima (opacity 0) e sobe pra 1
  enquanto QUALQUER camada anterior desce pra 0 ao mesmo tempo — as duas
  ficam visíveis e se misturando durante a transição inteira. A versão
  anterior escondia a foto (opacity 0), só então trocava o conteúdo por baixo
  e reaparecia: isso cria um instante em que nada aparece, e mesmo rápido
  aquele "nada" lê como um flash/pisca, não como uma dissolução suave. Com
  duas camadas sobrepostas nunca existe esse vazio.

  Duas velocidades, de propósito:
  - "color": rápida (220ms, linear, sem deslocamento) — troca de cor, que
    precisa ficar quase imperceptível (só a cor registra). Já confirmado
    como "perfeito" antes; não mexe.
  - "model": lenta (900ms, mesma curva e deslocamento vertical do
    [data-reveal] da home) — clicar num modelo novo merece uma entrada
    suave e deliberada, não uma troca instantânea.
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

  // Força o navegador a "commitar" o opacity:0 antes de animar — senão ele
  // agrupa criação + transição no mesmo frame e a transição não roda.
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
  Modo foco (ficha técnica): NÃO passa por render(). Se passasse, o
  app.innerHTML inteiro seria trocado por uma string nova e as classes que
  acabamos de ligar/desligar não teriam "antes" pra transicionar a partir de
  — só apareceriam já no estado final, sem animação nenhuma. Manipulando os
  mesmos elementos que já estão na tela (nav/aside/painel), o navegador anima
  a mudança de classe normalmente, sem nenhum truque de rAF.

  Aro e cores ficam com pointer-events:none enquanto o painel está aberto
  (ver main.css), então nenhum clique neles pode disparar um render() no meio
  da transição — não precisa se preocupar com esse caso.
*/
function setFocusMode(on: boolean): void {
  state.focusMode = on;

  const main = document.querySelector<HTMLElement>('[data-role="catalog-main"]');
  const nav = document.querySelector<HTMLElement>('[data-role="model-nav"]');
  const rail = document.querySelector<HTMLElement>('[data-role="color-rail"]');
  const panel = document.querySelector<HTMLElement>('[data-role="specs-panel"]');
  const stage = document.querySelector<HTMLElement>('[data-role="stage-section"]');
  const logo = document.querySelector<HTMLElement>('[data-role="model-logo"]');
  const bikeWrapper = document.querySelector<HTMLElement>('[data-role="bike-wrapper"]');

  /*
    A tentativa anterior de fechar o vão fantasma da coluna de cores recolhida
    era tirá-la do fluxo (display:none) um instante DEPOIS que a transição de
    encolher terminava — só que isso causava um segundo ajuste de layout bem
    ali (a "piscada com aumentadinha" que foi reportada): o navegador refluía
    tudo de uma vez, fora da transição suave. Trocado por uma solução de um
    passo só: reduz o próprio gap do `main` (ver main.css) na MESMA transição
    de 420ms que já anima o resto — sem segundo estágio, sem reajuste depois.
  */
  main?.classList.toggle("is-focus-open", on);
  nav?.classList.toggle("is-focus-collapsed", on);
  rail?.classList.toggle("is-focus-collapsed", on);
  stage?.classList.toggle("is-focus-aligned", on);
  // Logo acima da bike encolhe junto, na mesma duração — fica proporcional
  // ao tamanho que a bike também está assumindo enquanto o painel abre.
  logo?.classList.toggle("is-focus-open", on);
  // O respiro entre logo e bike (pt-4) sozinho não bastava dentro da ficha
  // técnica — a bike acaba renderizando menor ali (menos largura disponível
  // com o painel aberto), o que por si só já mudava a distância percebida.
  // Este reforço garante a mesma folga em ambos os estados.
  bikeWrapper?.classList.toggle("is-focus-open", on);

  if (panel) {
    panel.classList.toggle("is-focus-open", on);
    panel.setAttribute("aria-hidden", on ? "false" : "true");
  }
}

/*
  Delegação de evento num único listener: sobrevive a cada re-render (que troca
  o innerHTML inteiro), sem precisar re-anexar listener em botão nenhum.
*/
function initInteractions(): void {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.focusMode) setFocusMode(false);
  });

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    // Enquanto o modo foco está aberto, o "Voltar" do cabeçalho sai da ficha
    // técnica em vez de navegar pra home — mesmo botão, mesmo lugar, ação
    // contextual conforme o que está na tela.
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
