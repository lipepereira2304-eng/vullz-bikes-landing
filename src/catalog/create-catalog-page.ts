import { initRevealOnScroll } from "../scripts/animations";
import { preloadAll } from "./assets";
import {
  colorLabelMarkup,
  colorSwatchMarkup,
  headerBackMarkup,
  headerBrandMarkup,
  sidebarGroupMarkup,
  sidebarItemMarkup,
  specsButtonMarkup,
  specsPanelMarkup,
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
  const { models, photos, logos, emptyMessage, grouping, icons = {} } = config;

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

  function revealAttrs(revealStep: number): string {
    return isFirstRender
      ? `data-reveal style="transition-delay:calc(var(--stagger) * ${revealStep})"`
      : "";
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
      return models.map((m, i) => sidebarItemMarkup(m, m.id === activeModelId, i)).join("");
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
            .map((c, i) => colorSwatchMarkup(c, c.id === activeColor.id, i))
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
          ${revealAttrs(1)}
          data-role="model-nav"
          aria-label="Modelos"
          class="flex shrink-0 gap-4 overflow-x-auto pb-2 lg:w-52 lg:flex-col lg:justify-center ${navGapClass} lg:overflow-visible"
        >
          ${sidebarMarkup(activeModel?.id ?? null)}
        </nav>

        <section
          ${revealAttrs(2)}
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
                ${specsButtonMarkup()}
              `
              : ""
          }
        </section>

        <aside
          ${revealAttrs(3)}
          data-role="color-rail"
          class="flex shrink-0 flex-col items-center gap-2 pb-2 lg:w-auto lg:items-end lg:justify-center lg:gap-4 lg:pb-0"
        >
          ${colorRailContent}
        </aside>

        ${activeModel && activeColor ? specsPanelMarkup(activeModel, activeColor, icons) : ""}
      </main>
    </div>
  `;

    /*
      Painel que já nasce aberto (re-render após escolher um modelo dentro do
      grupo) não tem transição para esperar — logo, nenhum `transitionend` vai
      chegar. Marcar aqui evita que o recorte fique valendo para sempre e corte
      o anel de foco dos modelos daquele grupo.
    */
    app.querySelectorAll<HTMLElement>('[data-panel][data-open="true"]').forEach((panel) => {
      panel.dataset.settled = "true";
    });

    /*
      render() troca o innerHTML inteiro: a ficha que estava aberta acabou de
      deixar de existir, e a nova nasce fechada. O estado em JS precisa dizer o
      mesmo, senão o próximo clique no botão tentaria FECHAR uma ficha que já
      não está na tela — e nada aconteceria.

      Incrementar `specsRun` cancela de quebra qualquer sequência que ainda
      esteja no meio de um `await`: ela vai acordar, ver que a geração mudou e
      desistir, em vez de mexer em elementos que saíram do DOM.
    */
    specsOpen = false;
    specsRun++;
    detailsOpen = false;
    detailsRun++;

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

    /*
      O subtítulo da ficha carrega a REF, e a REF é da COR — então trocar de
      cor tem que reescrevê-lo aqui. `swapColor` não passa por render(), então
      nada mais atualiza esse texto: sem isto a ficha continuaria mostrando o
      código da cor anterior, silenciosamente errado.
    */
    const subtitle = document.querySelector("[data-role='specs-subtitle']");
    if (subtitle) subtitle.textContent = `${model.name}${color.ref ? ` — REF. ${color.ref}` : ""}`;

    paint(model, color, "color");
  }

  /*
    Abrir/fechar grupo mexe no DOM existente em vez de chamar render(). Não é
    otimização: é o que torna a animação possível. render() troca o innerHTML
    inteiro, então o painel do grupo nasceria já com a altura final — sem estado
    anterior, não há de onde animar — e fechar destruiria o elemento antes de
    qualquer transição rodar. Alterando os atributos in loco, o mesmo elemento
    percorre 0fr ↔ 1fr nos dois sentidos.

    Um grupo por vez continua valendo: o laço passa por todos e só o clicado
    recebe `true`, então abrir um fecha o outro no mesmo movimento.
  */
  function toggleGroup(key: number): void {
    state.expandedGroup = state.expandedGroup === key ? null : key;

    document.querySelectorAll<HTMLElement>("[data-group]").forEach((button) => {
      const isOpen = Number(button.dataset.group) === state.expandedGroup;
      const panel = button.parentElement?.querySelector<HTMLElement>("[data-panel]");

      button.setAttribute("aria-expanded", String(isOpen));
      button
        .querySelector<SVGElement>("[data-role='group-chevron']")
        ?.classList.toggle("rotate-90", isOpen);

      if (!panel) return;
      panel.dataset.open = String(isOpen);

      /*
        `data-settled` libera o recorte do painel (ver main.css) e só pode valer
        com a altura já estabilizada: ao fechar, sai imediatamente; ao abrir,
        entra no fim da transição. Sem `once`, um clique repetido acumularia
        ouvintes no mesmo painel.
      */
      delete panel.dataset.settled;
      if (!isOpen) return;

      panel.addEventListener(
        "transitionend",
        () => {
          if (panel.dataset.open === "true") panel.dataset.settled = "true";
        },
        { once: true }
      );
    });
  }

  /*
    Espera as animações de um elemento terminarem DE VERDADE.

    Por que `getAnimations()` e não `setTimeout(520)`: um timeout é um palpite
    sobre quanto a animação demora, e erra sempre que o valor do CSS muda, que
    é justamente o que os tokens permitem fazer. Aqui quem responde é o próprio
    motor de animação — se a duração mudar em main.css, isto continua correto
    sem ninguém lembrar de sincronizar.

    O `.catch()` não é descuido: `finished` REJEITA quando a transição é
    cancelada, e cancelamento é o caso normal aqui (clicar em fechar no meio da
    abertura). Quem decide o que fazer nesse caso é o contador de geração em
    setSpecsOpen, não este helper — por isso ele só resolve e devolve a
    palavra.

    A leitura de `offsetHeight` força o navegador a recalcular o estilo agora:
    sem isso as transições ainda não existem neste instante e `getAnimations()`
    voltaria vazio, fazendo o ato 2 começar junto com o ato 1 — exatamente o
    que a interação não pode fazer. É o mesmo empurrão usado em stage.ts.
  */
  function animationsSettled(el: HTMLElement): Promise<void> {
    void el.offsetHeight;

    const animations = el.getAnimations();
    if (animations.length === 0) return Promise.resolve();

    return Promise.all(animations.map((animation) => animation.finished))
      .then(() => undefined)
      .catch(() => undefined);
  }

  /*
    A interação em dois atos, encadeada — nunca simultânea.

    Abrir:  produto encolhe e sai do centro  →  (espera terminar)  →  ficha entra.
    Fechar: ficha sai  →  (espera terminar)  →  produto volta ao centro.

    O fechamento é o mesmo caminho de trás pra frente, e é por isso que ele lê
    como o inverso da abertura em vez de "outra animação": mesma ordem de
    atores, mesmas durações, mesmas curvas.

    `run` protege contra o clique repetido. Se alguém abrir e fechar antes do
    primeiro ato acabar, a sequência antiga acorda depois do `await` e descobre
    que já não é a corrente — então desiste em vez de escrever por cima do
    estado novo. Sem isso, a ficha reapareceria sozinha depois de fechada.
  */
  let specsOpen = false;
  let specsRun = 0;

  async function setSpecsOpen(open: boolean): Promise<void> {
    if (open === specsOpen) return;
    specsOpen = open;
    const run = ++specsRun;

    const main = document.querySelector<HTMLElement>("[data-role='catalog-main']");
    const panel = document.querySelector<HTMLElement>("[data-role='specs-panel']");
    const block = document.querySelector<HTMLElement>("[data-role='stage-section']");
    const toggle = document.querySelector<HTMLElement>("[data-role='specs-toggle']");
    if (!main || !panel || !block || !toggle) return;

    toggle.setAttribute("aria-expanded", String(open));

    if (open) {
      /*
        A ficha sempre abre no primeiro nível. O painel não é reconstruído
        entre uma abertura e outra, então sem isto ela reabriria no estado em
        que foi fechada — com a tabela aberta e os destaques recolhidos, que
        não é a leitura pretendida de "abri a ficha".

        Sem animação, de propósito: acontece com o painel ainda invisível.
      */
      resetSpecsDetails();
      main.dataset.specs = "open";
      await animationsSettled(block);
      if (run !== specsRun) return;

      panel.removeAttribute("inert");
      panel.dataset.visible = "true";
      return;
    }

    panel.dataset.visible = "false";
    await animationsSettled(panel);
    if (run !== specsRun) return;

    /*
      `inert` só depois que a ficha terminou de sair: aplicado antes, ele
      tiraria o foco do teclado de dentro do painel no primeiro quadro da
      saída — e quem fechou pelo botão de dentro veria o foco pular para o
      nada no meio da animação.
    */
    panel.setAttribute("inert", "");
    delete main.dataset.specs;
  }

  /*
    Segundo nível da ficha: os destaques recolhem e a tabela completa aparece.

    Encadeado, não simultâneo — pelo mesmo motivo da abertura da ficha. Os dois
    blocos vivem um embaixo do outro no MESMO quadro: animar a altura dos dois
    ao mesmo tempo faz o conteúdo de baixo subir enquanto o de cima ainda está
    descendo, e o quadro inteiro treme. Recolhendo primeiro, a altura só muda
    uma vez em cada sentido.

    A ordem se inverte ao voltar, e é sempre "sai quem está, depois entra quem
    vem": abrindo, destaques saem → tabela entra; fechando, tabela sai →
    destaques entram.
  */
  let detailsOpen = false;
  let detailsRun = 0;

  /** Devolve a ficha ao primeiro nível (destaques à mostra), sem animar. */
  function resetSpecsDetails(): void {
    detailsOpen = false;
    detailsRun++;

    const highlights = document.querySelector<HTMLElement>("[data-role='specs-highlights']");
    const details = document.querySelector<HTMLElement>("[data-role='specs-details']");
    const toggle = document.querySelector<HTMLElement>("[data-role='specs-details-toggle']");
    const label = document.querySelector<HTMLElement>("[data-role='specs-details-label']");

    if (highlights) {
      highlights.dataset.open = "true";
      highlights.dataset.settled = "true";
    }
    if (details) {
      details.dataset.open = "false";
      delete details.dataset.settled;
    }
    toggle?.setAttribute("aria-expanded", "false");
    if (label) label.textContent = "Mais informações";
  }

  async function toggleSpecsDetails(): Promise<void> {
    const highlights = document.querySelector<HTMLElement>("[data-role='specs-highlights']");
    const details = document.querySelector<HTMLElement>("[data-role='specs-details']");
    const toggle = document.querySelector<HTMLElement>("[data-role='specs-details-toggle']");
    const label = document.querySelector<HTMLElement>("[data-role='specs-details-label']");
    if (!highlights || !details || !toggle) return;

    detailsOpen = !detailsOpen;
    const run = ++detailsRun;

    toggle.setAttribute("aria-expanded", String(detailsOpen));
    if (label) label.textContent = detailsOpen ? "Menos informações" : "Mais informações";

    const sai = detailsOpen ? highlights : details;
    const entra = detailsOpen ? details : highlights;

    delete sai.dataset.settled;
    sai.dataset.open = "false";
    await animationsSettled(sai);
    if (run !== detailsRun) return;

    entra.dataset.open = "true";
    await animationsSettled(entra);
    if (run !== detailsRun) return;

    // Solta o recorte só com a altura estabilizada — senão o anel de foco de
    // teclado do primeiro e do último item fica cortado na borda do bloco.
    entra.dataset.settled = "true";
  }

  /*
    Delegação de evento num único listener: sobrevive a cada re-render (que
    troca o innerHTML inteiro), sem precisar re-anexar listener em botão nenhum.
  */
  function initInteractions(): void {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      /*
        Com a ficha aberta, o "Voltar" do cabeçalho fecha a ficha em vez de ir
        para a home: ele volta UM passo, e o passo mais recente foi abrir a
        ficha. Sair direto da página aqui seria pular um nível de navegação que
        o usuário não pediu — e é o que o link faria sozinho, por isso o
        preventDefault.
      */
      if (specsOpen && target.closest("[data-role='header-back']")) {
        event.preventDefault();
        void setSpecsOpen(false);
        return;
      }

      if (target.closest("[data-role='specs-details-toggle']")) {
        void toggleSpecsDetails();
        return;
      }

      if (target.closest("[data-role='specs-toggle']")) {
        void setSpecsOpen(true);
        return;
      }

      if (grouping) {
        const groupButton = target.closest<HTMLElement>("[data-group]");
        if (groupButton) {
          toggleGroup(Number(groupButton.dataset.group));
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

    /*
      Esc fecha — e fecha pelo caminho animado, não sumindo. Uma camada que
      cobre metade da tela e só sai por um alvo específico é a definição de
      armadilha para quem navega por teclado.
    */
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && specsOpen) void setSpecsOpen(false);
    });
  }

  render();
  initInteractions();

  // Depois que a página e seus recursos críticos (CSS, JS, logo) já carregaram
  // — pra não competir com eles por banda — começa a baixar todas as fotos.
  window.addEventListener("load", () => preloadAll(photos, logos));
}
