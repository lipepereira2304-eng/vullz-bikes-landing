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
  3 cores padrão por enquanto, as mesmas pra todo modelo — REFs e detalhes
  finos ficam pra depois. Mantém o mesmo padrão de override do catálogo das
  bikes: hoje vazio porque nenhum modelo precisa de um tom próprio ainda, mas
  se algum elétrico precisar (ex.: um "vermelho" ligeiramente diferente), é só
  adicionar uma entrada aqui, sem mexer no resto.
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

const DEFAULT_COLOR_IDS: (keyof typeof PALETTE)[] = ["branco", "preto", "vermelho"];

function defaultColors(modelId: string): ProductColor[] {
  return DEFAULT_COLOR_IDS.map((id) => ({
    id,
    name: PALETTE_NAMES[id],
    swatch: resolveColor(modelId, id),
  }));
}

const MODELS: ProductModel[] = [
  { id: "urban-citycoco", name: "Urban Citycoco", colors: defaultColors("urban-citycoco") },
  { id: "urban-drive", name: "Urban Drive", colors: defaultColors("urban-drive") },
  { id: "urban-max", name: "Urban Max", colors: defaultColors("urban-max") },
  { id: "urban-plus", name: "Urban Plus", colors: defaultColors("urban-plus") },
  { id: "v-10", name: "V-10", colors: defaultColors("v-10") },
  { id: "v-50", name: "V-50", colors: defaultColors("v-50") },
];

createCatalogPage({
  models: MODELS,
  photos,
  logos,
  emptyMessage: "Escolha um modelo ao lado para ver o elétrico.",
});
