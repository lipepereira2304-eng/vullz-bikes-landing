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
  revealDelayMs: number
): string {
  return /* html */ `
    <button
      type="button"
      data-model="${model.id}"
      style="animation-delay:${revealDelayMs}ms; animation-duration:380ms"
      class="reveal-left-in shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-left text-sm font-bold uppercase tracking-widest transition-[transform,color,border-color] duration-[var(--dur-hover)] ease-lift hover:translate-x-2 lg:block lg:w-full lg:whitespace-normal lg:rounded-none lg:px-0 lg:py-3 ${
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
        ${label}
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
  revealDelayMs: number
): string {
  return /* html */ `
    <button
      type="button"
      data-color="${color.id}"
      aria-label="${color.name}"
      aria-pressed="${active}"
      style="animation-delay:${revealDelayMs}ms"
      class="reveal-left-in relative h-8 w-8 shrink-0 rounded-full border-2 transition-[border-color,transform] duration-150 ${
        active ? "border-vullz-black scale-110" : "border-vullz-gray-200 hover:border-vullz-gray-500"
      }"
    >
      <span class="absolute inset-[2px] rounded-full" style="background:${color.swatch};"></span>
    </button>
  `;
}
