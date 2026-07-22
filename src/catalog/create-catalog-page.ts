import { initRevealOnScroll } from "../scripts/animations";
import { preloadAll } from "./assets";
import {
  colorLabelMarkup,
  colorSwatchMarkup,
  headerBackMarkup,
  headerBrandMarkup,
  sidebarGroupMarkup,
  sidebarItemMarkup,
  stageMarkup,
  stageWrapperMarkup,
} from "./markup";
import { paintStage, type StageTransition } from "./stage";
import type { CatalogConfig, ProductColor, ProductModel } from "./types";

/*
  Motor das páginas de catálogo interativo. As duas páginas (bicicletas e
  elétricos) são a MESMA tela: fundo branco, foto grande "flutuando", barra de
  modelos à esquerda, trilho de cores à direita, crossfade na troca. O que muda
  entre elas cabe inteiro no CatalogConfig — pasta de assets, agrupamento da
  lateral e presença de código de referência.

  Antes isto vivia duplicado linha a linha nos dois scripts de página, e cada
  refinamento de microinteração precisava ser aplicado duas vezes (uma delas
  sempre esquecida). Agora o script de página é só dados + configuração.
*/

/*
  Agrupa a lista (já na ordem final) em blocos CONSECUTIVOS de mesma chave, pra
  renderizar um rótulo acima de cada bloco na barra lateral. Consecutivos, e não
  um agrupamento por valor: a ordem dos modelos é decidida pelos dados e deve
  ser respeitada como está.
*/
function groupConsecutive<M extends ProductModel>(
  models: M[],
  keyOf: (model: M) => number
): { key: number; models: M[] }[] {
  const groups: { key: number; models: M[] }[] = [];
  for (const model of models) {
    const key = keyOf(model);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.key === key) {
      lastGroup.models.push(model);
    } else {
      groups.push({ key, models: [model] });
    }
  }
  return groups;
}

export function createCatalogPage<M extends ProductModel>(config: CatalogConfig<M>): void {
  const { models, photos, logos, emptyMessage, grouping } = config;

  /*
    Nada selecionado até o cliente clicar num modelo na lateral: a tela abre
    numa mensagem de convite, não já direto no primeiro produto.

    `expandedGroup`: quando existe agrupamento, a barra lateral abre mostrando
    só os rótulos dos grupos — os modelos de um grupo só aparecem depois do
    clique naquele rótulo. Só um grupo fica aberto por vez: abrir outro fecha o
    anterior, pra não poluir a lista com vários abertos juntos.
  */
  const state: {
    modelId: string | null;
    colorId: string | null;
    expandedGroup: number | null;
  } = {
    modelId: null,
    colorId: null,
    expandedGroup: null,
  };

  /*
    Entrada suave só na primeira renderização — a mesma linguagem da home
    ([data-reveal], ver main.css/animations.ts). Nas renderizações seguintes
    (clique em grupo/modelo) isto fica de fora, senão a página inteira
    reapareceria do zero a cada clique, já que render() reconstrói o innerHTML.
  */
  let isFirstRender = true;

  function revealAttrs(delayMs: number): string {
    return isFirstRender ? `data-reveal style="transition-delay:${delayMs}ms"` : "";
  }

  /*
    render() reconstrói o app.innerHTML inteiro toda vez — então o contêiner do
    palco é sempre novo e vazio, mesmo quando o modelo continuou o mesmo (ex.:
    só abriu/fechou um grupo na lateral). Pintar precisa acontecer de qualquer
    jeito, mas a VELOCIDADE da entrada muda conforme o motivo: guardamos qual
    foi o último modelo pintado pra saber se isto é uma troca de modelo de
    verdade (entrada lenta) ou só um re-render incidental (entrada rápida).
  */
  let lastPaintedModelId: string | null = null;

  function paint(model: M, color: ProductColor, kind: StageTransition): void {
    const container = document.querySelector<HTMLElement>("#stage-inner");
    if (!container) return;
    paintStage(container, stageMarkup(photos, model, color), kind);
  }

  function sidebarMarkup(activeModelId: string | null): string {
    if (!grouping) {
      return models.map((m, i) => sidebarItemMarkup(m, m.id === activeModelId, i * 70)).join("");
    }

    return groupConsecutive(models, grouping.keyOf)
      .map((group) =>
        sidebarGroupMarkup(
          group.key,
          grouping.labelOf(group.key),
          group.models,
          activeModelId,
          state.expandedGroup === group.key
        )
      )
      .join("");
  }

  function render(): void {
    const app = document.querySelector<HTMLDivElement>("#app");
    if (!app) return;

    const activeModel = models.find((m) => m.id === state.modelId) ?? null;
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
        <div id="stage-inner" class="relative h-full w-full"></div>
      `
        : /* html */ `
        <p class="max-w-xs text-balance text-base text-vullz-gray-500">
          ${emptyMessage}
        </p>
      `;

    /*
      O nome da cor NÃO mora na coluna de bolinhas: os nomes têm tamanhos muito
      diferentes ("Rosa" vs. "Quadro Preto (Azul + Dourado) (REF. 000/00)"), e
      aquela coluna é estreita de propósito (só precisa caber uma bolinha).
      Texto variável numa coluna estreita quebra de um jeito diferente pra cada
      cor — daí as quebras "aleatórias". Resolvido botando o texto embaixo da
      foto, que tem largura de sobra pra qualquer nome caber numa linha só.
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

    /*
      Com grupos, o gap grande separa uma sanfona da outra. Sem grupos, os
      modelos formam uma lista contínua de linhas sublinhadas — qualquer gap
      abriria um vão entre os traços e quebraria essa continuidade.
    */
    const navGapClass = grouping ? "lg:gap-8" : "lg:gap-0";

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
          class="flex shrink-0 gap-4 overflow-x-auto pb-2 lg:w-52 lg:flex-col lg:justify-center ${navGapClass} lg:overflow-visible"
        >
          ${sidebarMarkup(activeModel?.id ?? null)}
        </nav>

        <section
          ${revealAttrs(170)}
          data-role="stage-section"
          class="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden"
        >
          ${stageWrapperMarkup(logos, activeModel, stageContent)}
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
          data-role="color-rail"
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
      paint(activeModel, activeColor, activeModel.id === lastPaintedModelId ? "color" : "model");
      lastPaintedModelId = activeModel.id;
    } else {
      lastPaintedModelId = null;
    }
  }

  function swapColor(model: M, color: ProductColor): void {
    state.colorId = color.id;

    // Feedback dos botões de cor e do rótulo é instantâneo — só a foto esmaece.
    document.querySelectorAll<HTMLElement>("[data-color]").forEach((btn) => {
      const isActive = btn.dataset.color === color.id;
      btn.classList.toggle("border-vullz-black", isActive);
      btn.classList.toggle("scale-110", isActive);
      btn.classList.toggle("border-vullz-gray-200", !isActive);
      btn.classList.toggle("hover:border-vullz-gray-500", !isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    const label = document.querySelector("#color-label");
    if (label) label.innerHTML = colorLabelMarkup(color);

    paint(model, color, "color");
  }

  /*
    Delegação de evento num único listener: sobrevive a cada re-render (que
    troca o innerHTML inteiro), sem precisar re-anexar listener em botão nenhum.
  */
  function initInteractions(): void {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      if (grouping) {
        const groupButton = target.closest<HTMLElement>("[data-group]");
        if (groupButton) {
          const key = Number(groupButton.dataset.group);
          state.expandedGroup = state.expandedGroup === key ? null : key;
          render();
          return;
        }
      }

      const modelButton = target.closest<HTMLElement>("[data-model]");
      if (modelButton) {
        const modelId = modelButton.dataset.model!;
        const model = models.find((m) => m.id === modelId);
        state.modelId = modelId;
        state.colorId = model ? model.colors[0].id : state.colorId;
        render();
        return;
      }

      const colorButton = target.closest<HTMLElement>("[data-color]");
      if (colorButton) {
        const colorId = colorButton.dataset.color!;
        const model = models.find((m) => m.id === state.modelId);
        const color = model?.colors.find((c) => c.id === colorId);
        if (!model || !color || colorId === state.colorId) return;
        swapColor(model, color);
      }
    });
  }

  render();
  initInteractions();

  // Depois que a página e seus recursos críticos (CSS, JS, logo) já carregaram
  // — pra não competir com eles por banda — começa a baixar todas as fotos.
  window.addEventListener("load", () => preloadAll(photos, logos));
}
