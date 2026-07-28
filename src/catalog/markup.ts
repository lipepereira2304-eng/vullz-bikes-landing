import vullzLogo from "../assets/images/vullz-logo-dark-text.webp";
import { findLogo, findPhoto, findSpecIcon } from "./assets";
import type { AssetMap, ProductColor, ProductModel, ProductSpecs, SpecDetail } from "./types";

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

  `max-lg:min-h-11` / `max-lg:h-11` — ÁREA DE TOQUE, só abaixo do desktop.
  Medidos no celular, os dois alvos tinham 34px e 32px de altura, contra os
  44px que iOS e Android pedem como mínimo. No desktop o ponteiro do mouse tem
  precisão de pixel e a altura menor é a proporção aprovada, então o piso vive
  atrás de `max-lg:` e o CSS de ≥1024px não muda.
*/
export function headerBackMarkup(): string {
  return /* html */ `
    <div class="flex items-center gap-3">
      <a
        href="/"
        data-role="header-back"
        class="inline-flex items-center gap-1.5 rounded-full border border-vullz-gray-500 px-4 py-1.5 text-sm font-medium text-vullz-gray-500 tint-motion hover:border-vullz-black hover:text-vullz-black active:scale-95 max-lg:min-h-11"
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
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-vullz-gray-500 tint-motion hover:text-vullz-black active:scale-95 max-lg:h-11 max-lg:w-11"
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
      class="btn-motion mt-1 inline-flex items-center gap-2 rounded-full border border-vullz-gray-500 px-5 py-2 text-xs font-bold uppercase tracking-widest text-vullz-gray-500 hover:-translate-y-[var(--shift-sm)] hover:border-vullz-black hover:text-vullz-black active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-black focus-visible:ring-offset-2 max-lg:min-h-11"
    >
      Ficha Técnica
    </button>
  `;
}

/*
  ---------------------------------------------------------------------------
  CONTEÚDO PROVISÓRIO DA FICHA
  ---------------------------------------------------------------------------
  O cabeçalho é fixo: "Ficha Técnica" + "MODELO — REF. XXX/XX". A referência
  vem da COR ativa, não do modelo, porque cada cor tem o código dela — trocar
  de cor com a ficha aberta atualiza esse subtítulo.

  Abaixo dele, dois níveis que se revezam:
    1. seis cartões de destaque (grid 3x2), visíveis ao abrir;
    2. a tabela completa, atrás do "Mais informações".
  Um recolhe enquanto o outro abre — ver `toggleSpecsDetails` em
  create-catalog-page.ts.

  Modelo sem `specs` cadastrada continua abrindo a ficha, só que com um aviso
  no lugar do conteúdo: some o texto, não a interação.
*/
export function specsPanelMarkup(
  model: ProductModel,
  activeColor: ProductColor,
  icons: AssetMap,
  mobileSheet: boolean
): string {
  const ref = activeColor.ref ? ` — REF. ${activeColor.ref}` : "";

  /*
    `mobileSheet` (= `mobileModelBrowser` do CatalogConfig — hoje só as
    bicicletas ligam): reduz o padding/gap do quadro da ficha e do título,
    para descrição + 6 cards + botão caberem na tela sem rolar. O
    posicionamento em folha cheia (cobre a foto, sobe do fundo, borra o que
    fica atrás) é CSS puro em main.css, escopado pelo mesmo `[data-mobile-view]`
    — não precisa de classe daqui.
  */
  /*
    Padding de cima e de baixo tratados em separado, e o de baixo ZERADO
    explicitamente — não basta deixar de escrever uma classe pra ele: a base
    (compartilhada com o desktop) já dá padding IGUAL nos dois lados, e uma
    classe mobile que nunca é escrita não apaga a base, só deixa de competir
    com ela. O card não tem MAIS respiro de baixo próprio na folha mobile —
    quem dá esse respiro agora é só o rodapé sticky (footerMobile, mais
    abaixo), de propósito: ver o comentário lá para o motivo ("sticky" não
    convivia bem com a técnica antiga de cancelar o padding por margem
    negativa).
  */
  const fichaCardMobile = mobileSheet ? "max-lg:gap-3 max-lg:px-4 max-lg:pt-4 max-lg:pb-0" : "";
  const titleMobile = mobileSheet ? "max-lg:text-base" : "";

  return /* html */ `
    <aside
      id="specs-panel"
      data-role="specs-panel"
      data-visible="false"
      inert
      aria-label="Ficha técnica"
      class="absolute inset-x-4 bottom-4 z-20 flex max-h-[74%] flex-col justify-end gap-3 lg:inset-y-4 lg:left-auto lg:right-6 lg:w-[42%] lg:max-h-none lg:justify-center"
    >
      <!--
        O <aside> só POSICIONA (ocupa a faixa reservada e centraliza o
        conjunto); os quadros visíveis são os <div> filhos. Enquanto o fundo e a
        borda estavam no próprio <aside>, o quadro esticava por toda a altura da
        faixa e sobrava um vazio enorme em volta de um texto curto.

        São DOIS quadros empilhados — descrição em cima, ficha embaixo — dentro
        do mesmo <aside> de propósito: assim entram e saem como uma coisa só (a
        animação vive no <aside>) e o par fica centralizado em conjunto, o que
        alinha a descrição com o logo e a ficha com a bike do lado esquerdo.
      -->
      ${model.description ? descriptionCardMarkup(model.description, mobileSheet) : ""}

      <!--
        min-h-0 (e não max-h-full): com dois filhos, é o que permite a ficha
        encolher e rolar por dentro quando a tabela abre, em vez de empurrar a
        descrição para fora da tela. A descrição é shrink-0 e fica intacta.

        Sem flex-1 de propósito, mesmo na folha mobile: o quadro cresce só o
        que o próprio conteúdo pede (min-h-0 + overflow-y-auto já cobrem o
        caso da tabela mais alta que a tela). Testado com flex-1 aqui: ele
        esticava o quadro até preencher a folha inteira mesmo com os
        destaques (conteúdo curto) na tela, sobrando uma faixa branca vazia
        embaixo do botão — o justify-content: center do <aside> (ver
        main.css) já centraliza o conjunto sozinho, sem precisar esticar
        nada.

        O respiro de baixo do desktop também foi zerado (o padding vertical
        virou só de cima), pelo mesmo motivo do mobile: o rodapé sticky é
        quem cobre esse espaço agora, em QUALQUER largura — ver o comentário
        completo no próprio rodapé, mais abaixo.
      -->
      <div class="flex min-h-0 flex-col gap-5 overflow-y-auto rounded-3xl border border-vullz-gray-200 bg-white px-6 py-5 shadow-[0_24px_60px_-32px_rgba(17,17,17,0.35)] lg:px-8 lg:pt-7 lg:pb-0 ${fichaCardMobile}">
        <header class="flex flex-col gap-1">
          <h2 class="text-lg font-extrabold uppercase tracking-wide text-vullz-black ${titleMobile}">
            Ficha Técnica
          </h2>
          <p data-role="specs-subtitle" class="text-xs font-medium uppercase tracking-widest text-vullz-gray-500">
            ${model.name}${ref}
          </p>
        </header>

        ${model.specs ? specsContentMarkup(model.specs, icons, mobileSheet) : specsEmptyMarkup()}
      </div>
    </aside>
  `;
}

/*
  Quadro da descrição do produto — mesma linguagem visual da ficha (cantos
  arredondados, borda, sombra), só que baixo: é um parágrafo curto, então o
  quadro fica com cerca de metade da altura do da ficha sem precisar de altura
  fixa. `shrink-0` para ele não ser espremido quando a tabela da ficha abre.
*/
function descriptionCardMarkup(description: string, mobileSheet: boolean): string {
  const cardMobile = mobileSheet ? "max-lg:px-4 max-lg:py-3" : "";

  const card = /* html */ `
    <div
      data-role="description-card"
      class="shrink-0 rounded-3xl border border-vullz-gray-200 bg-white px-6 py-4 shadow-[0_24px_60px_-32px_rgba(17,17,17,0.35)] lg:px-8 lg:py-5 ${cardMobile}"
    >
      <p class="text-[13px] leading-relaxed text-vullz-gray-500 lg:text-sm">
        ${description}
      </p>
    </div>
  `;

  if (!mobileSheet) return card;

  /*
    Só na folha mobile: a descrição precisa poder SUMIR quando "Mais
    informações" abre a tabela (ver toggleSpecsDetails em
    create-catalog-page.ts), acompanhando os destaques — as duas formam a
    "vista compacta" da ficha. Reusa a MESMA sanfona de [data-panel] (
    grid-template-rows 0fr↔1fr) que já anima destaques/tabela, em vez de
    inventar uma segunda técnica. Nasce aberta (data-open="true"): é o estado
    inicial de toda ficha, e o loop de `settled` no fim de render() (ver
    create-catalog-page.ts) cuida de liberar o recorte no primeiro quadro.
  */
  return /* html */ `
    <div data-panel data-open="true" data-role="description-panel" class="shrink-0">
      <div>${card}</div>
    </div>
  `;
}

function specsEmptyMarkup(): string {
  return /* html */ `
    <p class="text-sm leading-relaxed text-vullz-gray-500">
      As especificações técnicas deste modelo estarão disponíveis em breve.
    </p>
  `;
}

/*
  ESPAÇO RESERVADO PARA O ÍCONE DO CARTÃO.

  O quadrado existe sempre, tenha ou não arquivo — é isso que faz "reservado".
  Se ele encolhesse quando o ícone falta, o dia em que os arquivos chegassem
  seria o dia em que todo o texto dos seis cartões mudaria de posição.

  Como preencher: largar o arquivo em src/assets/icons/ com o nome que está no
  campo `icon` do destaque (ex.: quadro.svg para `icon: "quadro"`). Não é
  preciso tocar em código — mesma convenção das fotos e dos logos. Ver
  src/assets/icons/README.md.

  Enquanto falta, fica um contorno tracejado discreto: em produção ele denuncia
  que ali cabia algo, o que é preferível a um buraco branco que parece
  intencional.
*/
function specIconSlotMarkup(icons: AssetMap, iconId: string, mobileSheet: boolean): string {
  const src = findSpecIcon(icons, iconId);
  const sizeMobile = mobileSheet ? "max-lg:h-7 max-lg:w-7" : "";

  if (src) {
    return /* html */ `
      <img src="${src}" alt="" aria-hidden="true" class="h-9 w-9 shrink-0 object-contain ${sizeMobile}" />
    `;
  }

  return /* html */ `
    <span
      data-role="spec-icon-slot"
      aria-hidden="true"
      class="h-9 w-9 shrink-0 rounded-md border border-dashed border-vullz-gray-200 ${sizeMobile}"
    ></span>
  `;
}

/*
  Padroniza a apresentação do VALOR de uma linha da ficha (nunca do rótulo):

  - "NÃO" (o modelo não tem aquele componente) vira um traço — mais limpo que a
    palavra repetida em várias linhas.
  - garante o espaço entre número e unidade de peso ("9Kg" → "9 Kg"); o
    maiúsculo do "KG" vem do CSS, então aqui só o espaço.

  O MAIÚSCULO geral não é feito aqui, é `text-transform: uppercase` no <dd>:
  assim o texto real continua em caixa natural no DOM (melhor para leitor de
  tela) e a caixa é só de exibição. Manter as duas coisas juntas — a regra de
  caixa no CSS, a de conteúdo aqui — é de propósito: são naturezas diferentes.
*/
function formatSpecValue(value: string): string {
  if (value.trim() === "NÃO") return "–";
  return value.replace(/(\d)\s*(kg)\b/gi, "$1 $2");
}

/*
  A tabela de especificações — pares rótulo/valor. `<dl>` e não `<table>`
  porque isto é uma lista de pares, não uma matriz de linhas e colunas: um
  leitor de tela anuncia "Peso, 14,5 kg" em vez de tentar narrar coordenadas.

  Só o valor (`<dd>`) é maiúsculo; o rótulo (`<dt>`) fica em caixa natural.
*/
function specsTableMarkup(details: SpecDetail[]): string {
  return /* html */ `
    <dl class="grid grid-cols-1 gap-x-6 text-sm sm:grid-cols-2">
      ${details
        .map(
          (row) => /* html */ `
            <div class="flex items-baseline justify-between gap-3 border-b border-vullz-gray-200 py-2">
              <dt class="shrink-0 text-vullz-gray-500">${row.label}</dt>
              <dd class="pl-3 text-right font-medium uppercase text-vullz-black">${formatSpecValue(row.value)}</dd>
            </div>
          `
        )
        .join("")}
    </dl>
  `;
}

/*
  A ficha tem dois níveis, mas nem todo modelo tem os dois (ver ProductSpecs):

  - com destaques + tabela → cards no primeiro nível, "Mais informações" abre a
    tabela. Os dois reusam `[data-panel]`, a mesma sanfona da barra lateral, que
    anima `grid-template-rows: 0fr → 1fr` e já resolve "animar até a altura
    natural do conteúdo" sem medir nada em JS. Os destaques nascem ABERTOS e a
    tabela fechada; o botão inverte os dois.

  - só tabela → mostra a tabela direto, sem sanfona e sem botão. Nada a
    recolher, então nada a alternar. Quando o modelo ganhar destaques, cai
    automaticamente no primeiro caso.
*/
function specsContentMarkup(specs: ProductSpecs, icons: AssetMap, mobileSheet: boolean): string {
  const highlights = specs.highlights ?? [];
  const details = specs.details ?? [];

  if (highlights.length === 0) {
    return details.length > 0 ? /* html */ `<div>${specsTableMarkup(details)}</div>` : "";
  }

  // Reduz card/ícone/gap só na folha mobile — a ideia é caber descrição +
  // título + 6 cards + botão na tela sem precisar rolar.
  const cardMobile = mobileSheet ? "max-lg:min-h-[56px] max-lg:gap-2 max-lg:px-2 max-lg:py-2" : "";
  const gridMobile = mobileSheet ? "max-lg:gap-1.5" : "";
  // Reduz padding/gap do rodapé só na folha mobile (ver o "porquê" da margem
  // vertical zerada no comentário do próprio <div>, mais abaixo).
  const footerMobile = mobileSheet ? "max-lg:-mx-4 max-lg:mb-0 max-lg:px-4 max-lg:pb-4 max-lg:pt-2" : "";

  return /* html */ `
    <div data-panel data-open="true" data-role="specs-highlights">
      <div>
        <!--
          3x2 no desktop, 2x3 no celular. O grid é fixo em 3 colunas (e não
          auto-fit) porque a leitura pretendida é "duas fileiras de três": com
          auto-fit a quantidade por linha mudaria com a largura do painel e a
          simetria se perderia.
        -->
        <ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 ${gridMobile}">
          ${highlights
            .map(
              (item, i) => /* html */ `
                <li
                  data-role="spec-card"
                  style="animation-delay:calc(var(--stagger-tight) * ${i})"
                  class="flex min-h-[72px] items-center gap-2.5 rounded-2xl border border-vullz-gray-200 bg-vullz-gray-50 px-3 py-3 text-xs font-semibold uppercase leading-snug tracking-wide text-vullz-black ${cardMobile}"
                >
                  ${specIconSlotMarkup(icons, item.icon, mobileSheet)}
                  <span>${item.label}</span>
                </li>
              `
            )
            .join("")}
        </ul>
      </div>
    </div>

    ${
      details.length > 0
        ? /* html */ `
          <div id="specs-details" data-panel data-open="false" data-role="specs-details">
            <div>${specsTableMarkup(details)}</div>
          </div>

          <!--
            Rodapé fixo do card. Com a tabela aberta o conteúdo pode ficar mais
            alto que o card e passar a rolar por dentro; sem o sticky, o botão —
            que é a ÚNICA forma de fechar a tabela — sairia da área visível e só
            reapareceria depois de rolar até o fim.

            A faixa branca é este <div>, e não o próprio botão: o botão é um
            pill arredondado, então o texto da tabela continuaria aparecendo nas
            laterais dele. As margens negativas HORIZONTAIS (nas duas larguras)
            esticam a faixa até as bordas do card, cancelando o padding — pra
            nenhum ponto vazar dos lados.

            VERTICAL não é mais margem negativa em NENHUMA largura (era só no
            mobile antes; agora vale também para o desktop e o iPad em
            paisagem, que usam as mesmas classes lg:) — "sticky" não convive
            bem com essa técnica: sobrava padding do card + borda (17px no
            mobile, 29px no desktop) sem cobertura, e a última linha da
            tabela aparecia por trás do botão ao rolar. Testado e medido nos
            dois, não é só suspeita. Por isso o card (acima) não tem mais
            respiro de baixo próprio em nenhuma largura — quem cobre esse
            respiro agora é só o padding de baixo deste rodapé, que sticky ou
            não, é sempre o ÚLTIMO elemento — chegando puro até a borda do
            card, sem precisar cancelar nada.
          -->
          <div class="sticky bottom-0 z-10 -mx-6 mb-0 flex justify-center bg-white px-6 pb-5 pt-3 lg:-mx-8 lg:px-8 lg:pb-7 ${footerMobile}">
            <button
              type="button"
              data-role="specs-details-toggle"
              aria-expanded="false"
              aria-controls="specs-details"
              class="btn-motion inline-flex items-center justify-center gap-2 rounded-full border border-vullz-gray-500 px-5 py-2 text-xs font-bold uppercase tracking-widest text-vullz-gray-500 hover:border-vullz-black hover:text-vullz-black active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-black focus-visible:ring-offset-2 max-lg:min-h-11"
            >
              <span data-role="specs-details-label">Mais informações</span>
              <svg
                data-role="specs-details-chevron"
                width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"
                class="chevron-motion shrink-0"
              >
                <path d="M1 3L5 7L9 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        `
        : ""
    }
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
export function modelNameMarkup(logos: AssetMap, model: ProductModel, mobileSheet: boolean): string {
  const logo = findLogo(logos, model.id);

  /*
    `mobileSheet` (= `mobileModelBrowser`, só bicicletas por enquanto):
    aproxima a logo da foto no mobile. O vão entre as duas dependia só da
    centralização da foto dentro do palco — variava bastante de modelo pra
    modelo (a Street, por exemplo, ficava com um vão enorme) sem relação com
    o tamanho real da logo. mobileShift desce a logo em metade da PRÓPRIA
    altura (translate no eixo Y); combina com a centralização horizontal já
    existente (eixo X) porque as duas viram propriedades independentes
    (--tw-translate-x/-y) que o Tailwind v4 junta na hora de montar o
    `translate` final — uma não sobrescreve a outra.
  */
  const mobileShift = mobileSheet ? "max-lg:translate-y-1/2" : "";

  if (logo) {
    return /* html */ `
      <div
        data-role="model-logo"
        class="absolute left-1/2 top-0 z-10 h-11 w-full max-w-xl -translate-x-1/2 sm:h-14 lg:h-[77px] ${mobileShift}"
      >
        <img src="${logo}" alt="${model.name}" class="h-full w-full object-contain" />
      </div>
    `;
  }

  return /* html */ `
    <h1 class="absolute left-1/2 top-0 z-10 w-full max-w-xl -translate-x-1/2 text-center text-2xl font-extrabold uppercase tracking-wide text-vullz-black ${mobileShift}">
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

  `max-lg:landscape:min-h-[240px]` — O PISO DO PALCO NO CELULAR DEITADO.
  Com `flex-1` e `min-h-0`, este contêiner aceita qualquer altura sobrando,
  inclusive nenhuma: num celular em paisagem (medido em 844x390) a barra de
  modelos, o rótulo, o botão e a trilha de cores consumiam a altura toda e a
  foto colapsava para ~30px — restava uma faixa do logo e nada do produto.
  Um piso resolve porque o problema não era distribuição, era falta de espaço:
  abaixo de 240px a foto deixa de cumprir a única função da tela. O que passar
  disso vira rolagem da página (ver o contêiner externo em
  create-catalog-page.ts), que é preferível a um produto invisível.

  Só em paisagem: em retrato a altura sobra e o piso nunca entra em ação.
*/
export function stageWrapperMarkup(
  logos: AssetMap,
  activeModel: ProductModel | null,
  stageContent: string,
  mobileSheet: boolean
): string {
  return /* html */ `
    <div data-role="stage-wrapper" class="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden pt-4 max-lg:landscape:min-h-[240px]">
      ${activeModel ? modelNameMarkup(logos, activeModel, mobileSheet) : ""}
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

  `max-lg:min-h-11`: o chip tinha 36px de altura, abaixo do mínimo de toque.
  Como <button> centraliza o próprio conteúdo na vertical, um piso de altura
  basta — não precisa mexer no padding, que é o que definiria a proporção
  visual do item no desktop.

  `mobileCard`: por trás de `mobileModelBrowser` em CatalogConfig — hoje só as
  bicicletas ligam. true veste a linha como o desktop (bloco de largura
  total, traço embaixo), só que dentro do card do aro em vez de numa coluna
  solta; a última linha do grupo não recebe traço, pra não duplicar a borda
  do próprio card logo abaixo dela. false é o chip de tira horizontal de
  sempre — o que qualquer catálogo que ainda não ligou a flag continua vendo.
*/
export function sidebarItemMarkup(
  model: ProductModel,
  active: boolean,
  revealIndex: number,
  mobileCard: boolean
): string {
  const mobile = mobileCard
    ? "max-lg:block max-lg:w-full max-lg:whitespace-normal max-lg:rounded-none max-lg:border-b max-lg:px-0 max-lg:py-3 max-lg:last:border-b-0"
    : "";

  const tone = active
    ? `text-vullz-black lg:border-b-2 lg:border-vullz-black ${mobileCard ? "max-lg:border-vullz-black" : ""}`
    : `text-vullz-gray-400 hover:text-vullz-black lg:border-b lg:border-vullz-gray-200 ${mobileCard ? "max-lg:border-vullz-gray-200" : ""}`;

  return /* html */ `
    <button
      type="button"
      data-model="${model.id}"
      style="animation-delay:calc(var(--stagger) * ${revealIndex})"
      class="reveal-left-in item-motion shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-left text-sm font-bold uppercase tracking-widest hover:translate-x-[var(--shift-sm)] active:translate-x-0 max-lg:min-h-11 lg:block lg:w-full lg:whitespace-normal lg:rounded-none lg:px-0 lg:py-3 ${mobile} ${tone}"
    >
      ${model.name}
    </button>
  `;
}

/*
  Card individual por modelo — usado só quando o catálogo NÃO tem
  agrupamento (elétricos, com a folha mobile ligada). Sem aro, não existe
  "grupo" pra abrir: cada modelo já É o card, e o clique leva direto ao
  produto. Por isso a mesma seta ">" que os cards de aro mostram fechados
  aparece aqui sempre nesse estado — nunca gira, porque não há o que
  expandir, só "ir".

  Tipografia igual ao CABEÇALHO do card de aro (o mesmo tamanho e peso
  grandes), não à linha pequena de dentro dele: aqui o modelo ocupa o card
  sozinho, tem o mesmo peso visual que um aro fechado tem na tela das
  bicicletas — replicar "a mesma coisa" também é replicar a proporção, não
  só a moldura.

  Desktop INTOCADO: todas as classes novas são max-lg:, então em ≥1024px o
  botão continua exatamente a linha sublinhada de sempre — a mesma que
  sidebarItemMarkup(..., false) já produz hoje pra elétricos.
*/
export function standaloneModelCardMarkup(model: ProductModel, active: boolean, revealIndex: number): string {
  const tone = active
    ? "text-vullz-black lg:border-b-2 lg:border-vullz-black"
    : "text-vullz-gray-400 hover:text-vullz-black lg:border-b lg:border-vullz-gray-200";

  return /* html */ `
    <div class="max-lg:rounded-3xl max-lg:border max-lg:border-vullz-gray-200 max-lg:bg-white max-lg:px-5 max-lg:py-4 max-lg:shadow-[0_24px_60px_-32px_rgba(17,17,17,0.35)]">
      <button
        type="button"
        data-model="${model.id}"
        style="animation-delay:calc(var(--stagger) * ${revealIndex})"
        class="reveal-left-in item-motion shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-left text-sm font-bold uppercase tracking-widest hover:translate-x-[var(--shift-sm)] active:translate-x-0 max-lg:flex max-lg:min-h-11 max-lg:w-full max-lg:items-center max-lg:gap-2 max-lg:whitespace-normal max-lg:rounded-none max-lg:px-0 max-lg:text-xl max-lg:font-extrabold max-lg:tracking-wide lg:block lg:w-full lg:whitespace-normal lg:rounded-none lg:px-0 lg:py-3 ${tone}"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="lg:hidden shrink-0"
          aria-hidden="true"
        >
          <path d="M2.5 1L7.5 5L2.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        ${model.name}
      </button>
    </div>
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

  `mobileCard`: por trás de `mobileModelBrowser` em CatalogConfig — hoje só as
  bicicletas ligam. true veste o grupo inteiro (cabeçalho + painel) como um
  card de cantos arredondados — mesma linguagem de "card branco" já usada na
  ficha técnica e no quadro de descrição desta página (rounded-3xl,
  border-vullz-gray-200, mesma sombra), em vez dos cards escuros da home, que
  não fariam sentido numa página branca. false mantém a sanfona/tira de hoje.

  O padding do card vive no CONTÊINER (wrapperMobile), não no botão nem nas
  linhas — assim cabeçalho e modelos alinham à mesma margem interna sem
  repetir o valor em três lugares.
*/
export function sidebarGroupMarkup(
  key: number,
  label: string,
  models: ProductModel[],
  activeModelId: string | null,
  expanded: boolean,
  mobileCard: boolean
): string {
  const wrapperMobile = mobileCard
    ? "max-lg:rounded-3xl max-lg:border max-lg:border-vullz-gray-200 max-lg:bg-white max-lg:px-5 max-lg:py-4 max-lg:shadow-[0_24px_60px_-32px_rgba(17,17,17,0.35)]"
    : "";
  const headerMobile = mobileCard ? "max-lg:px-0" : "";

  return /* html */ `
    <div class="flex shrink-0 flex-col gap-2 lg:gap-0 ${wrapperMobile}">
      <button
        type="button"
        data-group="${key}"
        aria-expanded="${expanded}"
        class="flex origin-left items-center gap-2 px-4 text-left text-xl font-extrabold uppercase tracking-wide text-vullz-black tint-motion active:scale-[0.985] max-lg:min-h-11 ${headerMobile} lg:border-b lg:border-vullz-gray-200 lg:px-0 lg:pb-3"
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
            ${models.map((m, i) => sidebarItemMarkup(m, m.id === activeModelId, i, mobileCard)).join("")}
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

  A área de toque desta bolinha no celular NÃO mora aqui: é um `::before`
  declarado em main.css, dentro de um @media que só alcança abaixo do desktop.
  Ver a explicação lá.
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
