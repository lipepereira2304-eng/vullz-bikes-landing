import "../styles/main.css";
import { createCatalogPage } from "../catalog/create-catalog-page";
import type { ProductColor, ProductModel } from "../catalog/types";

/*
  Catálogo interativo dos ELÉTRICOS. Mesma tela do catálogo das bicicletas
  (motor compartilhado em src/catalog/); este arquivo é só dados.

  A diferença fica na configuração: aqui não existe agrupamento por aro — os
  modelos aparecem soltos, direto na lateral, sem gaveta de categoria nenhuma
  (foi um pedido explícito) — e as cores ainda não têm código de referência.

  FOTOS: src/assets/eletricos/<model-id>/<color-id>.jpg (ou .jpeg/.png/.webp),
  mesma convenção do catálogo das bikes. Enquanto não existe, aparece
  "Em breve..." no lugar da foto.

  LOGOS: src/assets/eletricos/<model-id>/logo.svg (ou .png/.webp) — nenhum
  modelo tem logo própria ainda, então todos caem no nome em texto por
  enquanto. Assim que uma logo for adicionada nessa pasta, ela entra
  automaticamente, sem precisar tocar neste arquivo.
*/
const photos = import.meta.glob<string>(
  ["../assets/eletricos/*/*.{jpg,jpeg,png,webp}", "!../assets/eletricos/*/logo.*"],
  { eager: true, import: "default" }
);

const logos = import.meta.glob<string>("../assets/eletricos/*/logo.{svg,png,webp}", {
  eager: true,
  import: "default",
});

/*
  Paleta de referência. Mesmos tons hexadecimais já usados no catálogo das
  bikes (azul/laranja/verde) — reaproveitados de propósito, é a mesma cor de
  marca em outro produto, não uma decisão nova. Mantém o mesmo padrão de
  override do catálogo das bikes: hoje vazio porque nenhum modelo precisa de
  um tom próprio ainda, mas se algum elétrico precisar (ex.: um "azul"
  ligeiramente diferente), é só adicionar uma entrada aqui, sem mexer no
  resto.
*/
const PALETTE = {
  branco: "#fcfefd",
  preto: "#060606",
  vermelho: "#c60314",
  azul: "#0084d2",
  laranja: "#fc3901",
  verde: "#82fc03",
} as const;

const PALETTE_NAMES: Record<keyof typeof PALETTE, string> = {
  branco: "Branco",
  preto: "Preto",
  vermelho: "Vermelho",
  azul: "Azul",
  laranja: "Laranja",
  verde: "Verde",
};

/*
  Urban Drive: cor é só um acento (punho, garfo, faixa da carenagem) sobre o
  corpo preto — não a pintura inteira, como nas outras. O tom genérico da
  paleta ficava visivelmente errado nas bolinhas. Valores medidos por
  amostragem de pixel direto nas fotos reais (ponta do punho + faixa da
  carenagem, dois pontos por cor, com filtro de saturação HSV pra descartar
  borda/reflexo e pegar só o "miolo" puro da cor) — não são um palpite visual.
*/
const MODEL_COLOR_OVERRIDES: Partial<Record<string, Partial<Record<keyof typeof PALETTE, string>>>> = {
  "urban-drive": { azul: "#01affd", laranja: "#fa7807", verde: "#74d812" },
};

function resolveColor(modelId: string, key: keyof typeof PALETTE): string {
  return MODEL_COLOR_OVERRIDES[modelId]?.[key] ?? PALETTE[key];
}

/*
  Cada modelo tem sua própria lista de cores — diferente das bikes, aqui as
  cores não são as mesmas 3 pra todo mundo. A lista abaixo é a linha atual de
  produto (confirmada pelo cliente em 25/08/2026): o que não está aqui não é
  "falta foto", é "não existe nessa cor" — a bolinha nem aparece, ao contrário
  de uma cor sem foto ainda, que aparece e mostra "Em breve...".
*/
function colors(modelId: string, ids: (keyof typeof PALETTE)[]): ProductColor[] {
  return ids.map((id) => ({
    id,
    name: PALETTE_NAMES[id],
    swatch: resolveColor(modelId, id),
  }));
}

const MODELS: ProductModel[] = [
  { id: "urban-citycoco", name: "Urban Citycoco", colors: colors("urban-citycoco", ["preto"]) },
  { id: "urban-drive", name: "Urban Drive", colors: colors("urban-drive", ["azul", "laranja", "verde"]) },
  { id: "urban-max", name: "Urban Max", colors: colors("urban-max", ["preto", "vermelho"]) },
  { id: "urban-plus", name: "Urban Plus", colors: colors("urban-plus", ["branco", "preto", "vermelho"]) },
  // V-10 removido — é o mesmo produto que a Urban Citycoco, não um modelo à parte.
  // Nome trocado de "V-50" para "Urban Volt (V-50)" a pedido do cliente —
  // passa a ser o nome exibido em qualquer lugar do site que mostre este
  // modelo. `id` e a pasta de fotos (src/assets/eletricos/urban-volt-v50/)
  // acompanham o novo nome.
  { id: "urban-volt-v50", name: "Urban Volt (V-50)", colors: colors("urban-volt-v50", ["preto", "vermelho"]) },
];

createCatalogPage({
  models: MODELS,
  photos,
  logos,
  emptyMessage: "Escolha um modelo ao lado para ver o elétrico.",
  // Nenhuma foto de elétrico hoje é um recorte "premium" com sombra
  // sintética planejada — a sombra de cada foto (quando existe) é a de
  // estúdio, feita na hora da captura, e é ela que deve valer. Sem isto, o
  // filtro CSS do palco tentaria desenhar uma sombra própria por cima —
  // ver o comentário completo em `stageShadow` (types.ts). Padrão do
  // catálogo inteiro: todo modelo novo cai aqui sem precisar declarar nada,
  // a menos que um dia um modelo específico ganhe recorte com sombra
  // pensada pelo site (aí é `stageShadow: true` só nesse modelo).
  stageShadow: false,
  // Replica em elétricos toda a experiência já aprovada nas bicicletas
  // (navegação mobile em duas telas, ficha em folha cheia, linha divisória,
  // exceção do iPad em paisagem) — ver mobileModelBrowser em types.ts.
  mobileModelBrowser: true,
});
