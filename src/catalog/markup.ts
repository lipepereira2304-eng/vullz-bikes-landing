import vullzLogo from "../assets/images/vullz-logo-dark-text.webp";
import { findLogo, findPhoto } from "./assets";
import type { AssetMap, ProductColor, ProductModel } from "./types";

/*
  Todo o markup compartilhado pelos dois catálogos interativos. Funções puras:
  recebem dados, devolvem string de HTML — nenhuma delas toca no DOM nem guarda
  estado (quem faz isso é create-catalog-page.ts).
*/

/*
  Mesmo arquivo de logo da home, mas com "VULLZ" recolorido de branco pra preto:
  o original foi feito pra fundo grafite, e as páginas de catálogo são brancas.
*/
export function headerBrandMarkup(): string {
  return /* html */ `
    <a href="/" aria-label="Vullz" class="inline-flex items-center">
      <img src="${vullzLogo}" alt="Vullz" class="h-[30px] w-auto sm:h-9" />
    </a>
  `;
}

/*
  "Voltar" com contorno (mesmo tom cinza do texto) + ícone de casinha ao lado,
  os dois à esquerda, os dois indo pra home. A casinha é um atalho reconhecível
  por ícone.
*/
export function headerBackMarkup(): string {
  return /* html */ `
    <div class="flex items-center gap-3">
      <a
        href="/"
        data-role="header-back"
        class="inline-flex items-center gap-1.5 rounded-full border border-vullz-gray-500 px-4 py-1.5 text-sm font-medium text-vullz-gray-500 tint-motion hover:border-vullz-black hover:text-vullz-black active:scale-95"
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
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-vullz-gray-500 tint-motion hover:text-vullz-black active:scale-95"
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
  Botão que abre a ficha técnica. Mora DENTRO do bloco do produto
  ([data-role="stage-section"]) de propósito: no ato 1 esse bloco inteiro
  encolhe e sai do centro, e um botão que ficasse de fora continuaria parado no
  meio da tela, órfão do produto a que se refere. Ele pertence à peça, então
  viaja com ela.

  Ele só ABRE. Fechar é trabalho do "Voltar" do cabeçalho, que enquanto a ficha
  está aberta volta um passo na tela em vez de ir para a home — um botão de
  fechar aqui embaixo seria um segundo caminho para a mesma saída, competindo
  com um controle que já existe e já está no lugar certo. Some junto com o
  ato 1, pelo mesmo motivo que o rótulo da cor some: já não faz sentido depois
  que a ficha está na tela.
*/
export function specsButtonMarkup(): string {
  return /* html */ `
    <button
      type="button"
      data-role="specs-toggle"
      aria-expanded="false"
      aria-controls="specs-panel"
      class="btn-motion mt-1 inline-flex items-center gap-2 rounded-full border border-vullz-gray-500 px-5 py-2 text-xs font-bold uppercase tracking-widest text-vullz-gray-500 hover:-translate-y-[var(--shift-sm)] hover:border-vullz-black hover:text-vullz-black active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-black focus-visible:ring-offset-2"
    >
      Ficha Técnica
    </button>
  `;
}

/*
  ---------------------------------------------------------------------------
  CONTEÚDO PROVISÓRIO DA FICHA
  ---------------------------------------------------------------------------
  O texto real ainda não existe. Está isolado nesta função — e só aqui — para
  que substituí-lo seja uma edição só, sem passar perto da coreografia de
  abertura. Trocar o miolo do <div data-role="specs-body"> basta; nada em
  main.css nem em create-catalog-page.ts depende do que tem dentro.

  Quando as fichas reais chegarem e forem diferentes por modelo, o caminho
  natural é um campo opcional em ProductModel (types.ts) e esta função passar a
  receber o modelo como argumento.
*/
export function specsPanelMarkup(activeColor: ProductColor): string {
  return /* html */ `
    <aside
      id="specs-panel"
      data-role="specs-panel"
      data-visible="false"
      inert
      aria-label="Ficha técnica"
      class="absolute inset-x-4 bottom-4 z-20 flex flex-col justify-end lg:inset-y-0 lg:left-auto lg:right-8 lg:w-[38%] lg:justify-center"
    >
      <!--
        Duas camadas de propósito: o <aside> só POSICIONA (ocupa a faixa
        reservada e centraliza), e este <div> é o quadro visível. Enquanto o
        fundo e a borda estavam no próprio <aside>, o quadro esticava por toda
        a altura da faixa e sobrava um vazio enorme em volta de um texto curto.
        Separando, o quadro abraça o conteúdo e a faixa cuida de onde ele fica.
      -->
      <div class="flex max-h-full flex-col gap-4 overflow-y-auto rounded-3xl border border-vullz-gray-200 bg-white px-6 py-5 shadow-[0_24px_60px_-32px_rgba(17,17,17,0.35)] lg:px-10 lg:py-8">
      <header class="flex flex-col gap-1">
        <h2 class="text-lg font-extrabold uppercase tracking-wide text-vullz-black">
          Ficha Técnica
        </h2>
        <!--
          O rótulo da cor "sobe" para cá: ele desaparece de baixo da foto no
          ato 1 e reaparece aqui como subtítulo no ato 2. Não é o MESMO nó
          viajando pela tela — são dois nós, um saindo e outro entrando no
          tempo certo. Mover o nó real exigiria arrancá-lo do fluxo e animar
          coordenadas medidas em JS, que quebra a cada mudança de layout; a
          leitura para quem assiste é idêntica e isto não tem como quebrar.
        -->
        <p data-role="specs-color" class="text-xs text-vullz-gray-500">
          ${colorLabelMarkup(activeColor)}
        </p>
      </header>

      <div data-role="specs-body" class="text-sm leading-relaxed text-vullz-gray-500">
        <p>
          As especificações técnicas deste modelo estarão disponíveis em breve.
        </p>
      </div>
      </div>
    </aside>
  `;
}

/*
  Sem foto real ainda: mensagem simples em vez de qualquer desenho de
  substituição — mais honesto que fingir um produto que não existe na tela.
*/
export function stageMarkup(photos: AssetMap, model: ProductModel, color: ProductColor): string {
  const photo = findPhoto(photos, model.id, color.id);

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
  Com logo (<pasta>/<model-id>/logo.*): um detalhe pequeno, não o protagonista
  — o produto é o foco máximo. Por isso o logo é `absolute`, flutuando por cima
  do topo do PRÓPRIO contêiner do produto (não um item de flex-col em sequência
  com ele): assim ele nunca disputa altura com a foto, que continua recebendo
  exatamente o mesmo espaço que teria se o logo não existisse. h-full +
  object-contain (mesma técnica da foto) garante que o logo nunca estica.

  Sem logo ainda: cai de volta pro nome em texto puro — é o que faz os modelos
  sem arte própria continuarem funcionando normalmente. Também `absolute`
  (mesma posição), e não só por consistência: o contêiner-pai é `flex` sem
  `flex-col`, então um item normal ficaria lado a lado com a foto (linha), não
  acima dela.
*/
export function modelNameMarkup(logos: AssetMap, model: ProductModel): string {
  const logo = findLogo(logos, model.id);

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
  pt-4 aqui empurra só o PRODUTO pra baixo, sem mexer no logo. O logo é
  `position:absolute` com `top:0`, e a referência desse `top:0` é a borda do
  próprio contêiner — ela não se move quando o padding muda, só o conteúdo em
  fluxo (a foto, centralizada aqui dentro) é que desce. É como se ganha mais
  respiro entre os dois sem risco de cortar o logo: ele já está encostado no
  topo, e empurrá-lo pra cima exigiria invadir a área com overflow:hidden
  (necessário pra conter o crossfade), cortando a própria imagem do logo.
*/
export function stageWrapperMarkup(
  logos: AssetMap,
  activeModel: ProductModel | null,
  stageContent: string
): string {
  return /* html */ `
    <div data-role="stage-wrapper" class="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden pt-4">
      ${activeModel ? modelNameMarkup(logos, activeModel) : ""}
      ${stageContent}
    </div>
  `;
}

/*
  No desktop cada modelo vira uma linha com sublinhado (não um "pill" solto):
  resolve a sensação de tudo parecer "flutuando" sem alinhamento. A linha do
  modelo ATIVO fica mais grossa e preta em vez de preencher o fundo — mantém a
  paleta clean, só reforça o traço. No mobile é um chip arredondado numa tira
  horizontal.
*/
export function sidebarItemMarkup(
  model: ProductModel,
  active: boolean,
  revealIndex: number
): string {
  return /* html */ `
    <button
      type="button"
      data-model="${model.id}"
      style="animation-delay:calc(var(--stagger) * ${revealIndex})"
      class="reveal-left-in item-motion shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-left text-sm font-bold uppercase tracking-widest hover:translate-x-[var(--shift-sm)] active:translate-x-0 lg:block lg:w-full lg:whitespace-normal lg:rounded-none lg:px-0 lg:py-3 ${
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
  Cabeçalho de cada grupo é um botão (sanfona): controla se os modelos daquele
  grupo aparecem ou não. Só a seta gira — o texto do rótulo não muda de
  peso/cor ao abrir, pra não competir com os nomes dos modelos.

  No desktop, o cabeçalho também ganha o mesmo sublinhado dos modelos (mesma
  linguagem visual, uma lista contínua de "linhas"), e o espaçamento entre
  grupos vem do gap do <nav>.

  A lista de modelos é renderizada SEMPRE, aberta ou fechada — só a altura do
  painel muda (ver [data-panel] em main.css). Antes ela só existia no HTML
  quando o grupo estava aberto, e por isso fechar não podia ser animado: não há
  como animar a saída de um elemento que deixa de existir no mesmo quadro. O
  custo é renderizar alguns botões invisíveis; em troca, abrir e fechar viram o
  mesmo movimento em duas direções.
*/
export function sidebarGroupMarkup(
  key: number,
  label: string,
  models: ProductModel[],
  activeModelId: string | null,
  expanded: boolean
): string {
  return /* html */ `
    <div class="flex shrink-0 flex-col gap-2 lg:gap-0">
      <button
        type="button"
        data-group="${key}"
        aria-expanded="${expanded}"
        class="flex origin-left items-center gap-2 px-4 text-left text-xl font-extrabold uppercase tracking-wide text-vullz-black tint-motion active:scale-[0.985] lg:border-b lg:border-vullz-gray-200 lg:px-0 lg:pb-3"
      >
        <svg
          data-role="group-chevron"
          width="14"
          height="14"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="chevron-motion shrink-0 ${expanded ? "rotate-90" : ""}"
        >
          <path d="M2.5 1L7.5 5L2.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        ${label}
      </button>

      <!--
        Este nível intermediário não é decorativo: é ele que recorta a lista
        enquanto a linha do grid ainda está crescendo de 0fr até 1fr. Sem ele o
        conteúdo transborda e a altura "abre" sem nunca ter escondido nada.

        O recorte em si vem do CSS ([data-panel] > * em main.css), não de uma
        classe aqui: é lá que ele também precisa ser LIBERADO quando o painel
        assenta, e as duas pontas têm que estar na mesma camada para uma não
        anular a outra.
      -->
      <div data-panel data-open="${expanded}">
        <div>
          <div class="flex flex-col gap-1 lg:mt-2 lg:gap-0">
            ${models.map((m, i) => sidebarItemMarkup(m, m.id === activeModelId, i)).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Rótulo abaixo da foto. O código de referência só aparece onde ele existe. */
export function colorLabelMarkup(color: ProductColor): string {
  if (!color.ref) return /* html */ `${color.name}`;
  return /* html */ `${color.name} <span class="text-vullz-gray-400">(REF. ${color.ref})</span>`;
}

/*
  Preenchimento e anel de borda são dois elementos separados de propósito:
  quando o background e o border-radius vivem no MESMO elemento, o navegador às
  vezes deixa um fiapo de 1px sem cobrir num ponto do círculo (mais visível em
  elementos pequenos e animados) — lê como um "corte" na borda. Um span
  interno, recuado a distância exata da borda, cobre tudo com folga e não
  depende desse alinhamento de sub-pixel.
*/
export function colorSwatchMarkup(
  color: ProductColor,
  active: boolean,
  revealIndex: number
): string {
  return /* html */ `
    <button
      type="button"
      data-color="${color.id}"
      aria-label="${color.name}"
      aria-pressed="${active}"
      style="animation-delay:calc(var(--stagger-tight) * ${revealIndex})"
      class="reveal-left-in swatch-motion relative h-8 w-8 shrink-0 rounded-full border-2 ${
        /*
          O press sempre AFUNDA em relação ao estado atual: a bolinha ativa já
          está em 110%, então pressioná-la leva a 100%; as inativas partem de
          100% e vão a 95%. Um valor único para as duas faria a ativa "pular"
          para cima ao ser pressionada.
        */
        active
          ? "border-vullz-black scale-110 active:scale-100"
          : "border-vullz-gray-200 hover:border-vullz-gray-500 active:scale-95"
      }"
    >
      <span class="absolute inset-[2px] rounded-full" style="background:${color.swatch};"></span>
    </button>
  `;
}
