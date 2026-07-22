import "../styles/main.css";
import { createCatalogPage } from "../catalog/create-catalog-page";
import type { ProductColor, ProductModel } from "../catalog/types";

/*
  Catálogo interativo das BICICLETAS. Este arquivo é só dados: os modelos, as
  cores e como a barra lateral se agrupa. Toda a tela (layout, crossfade,
  sanfona, trilho de cores) mora em src/catalog/ e é compartilhada com o
  catálogo de elétricos.

  Página em branco de propósito: as fotos reais têm fundo transparente, e a
  ideia (referência: página de produto da Apple) é que a imagem pareça flutuar
  num fundo infinito, sem nenhuma borda de card cortando essa ilusão.

  FOTOS: qualquer arquivo em src/assets/bikes/<model-id>/<color-id>.jpg (ou
  .jpeg/.png/.webp) é carregado automaticamente pelo import.meta.glob abaixo —
  não precisa tocar neste arquivo de novo, só seguir a convenção de nome. Ver
  src/assets/bikes/README.md para a lista de ids de cada modelo/cor. Enquanto o
  arquivo não existe, aparece "Em breve..." no lugar da foto.

  LOGOS: mesma ideia, em src/assets/bikes/<model-id>/logo.svg (ou .png/.webp) —
  o nome estilizado do modelo, que aparece acima da bike no lugar do texto
  simples. Enquanto não existe, cai de volta no nome em texto. O "!.../logo.*"
  existe só pra excluir esses arquivos do glob de fotos — sem isso, logo.webp
  seria também testado (inutilmente) como se fosse a foto de uma cor "logo".
*/
const photos = import.meta.glob<string>(
  ["../assets/bikes/*/*.{jpg,jpeg,png,webp}", "!../assets/bikes/*/logo.*"],
  { eager: true, import: "default" }
);

const logos = import.meta.glob<string>("../assets/bikes/*/logo.{svg,png,webp}", {
  eager: true,
  import: "default",
});

/** Tamanho do aro, usado só pra agrupar a barra lateral (ex.: "Aro 29"). */
interface BikeModel extends ProductModel {
  aro: number;
}

/*
  Paleta de referência: valores reais passados pelo cliente, usando a tabela da
  Oregon como base (foi a mais completa que ele mandou). Uma cor com o mesmo
  NOME pode ter um tom levemente diferente por modelo — ver
  MODEL_COLOR_OVERRIDES logo abaixo — mas quando ele não especificou um tom
  próprio pra um modelo, é este valor daqui que é usado.
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

/** Cor sólida simples: nome vem da paleta (ou de um override), tom pode ser específico do modelo. */
function solid(
  modelId: string,
  id: keyof typeof PALETTE,
  ref: string,
  nameOverride?: string
): ProductColor {
  return { id, name: nameOverride ?? PALETTE_NAMES[id], swatch: resolveColor(modelId, id), ref };
}

/** Quadro de uma cor com dois acentos — bolinha dividida em 3 (como a Oregon). */
function framed(
  modelId: string,
  id: string,
  name: string,
  ref: string,
  frame: keyof typeof PALETTE,
  accentA: keyof typeof PALETTE,
  accentB: keyof typeof PALETTE
): ProductColor {
  return {
    id,
    name,
    ref,
    swatch: `conic-gradient(from 0deg, ${resolveColor(modelId, frame)} 0% 34%, ${resolveColor(modelId, accentA)} 34% 67%, ${resolveColor(modelId, accentB)} 67% 100%)`,
  };
}

const OREGON_COLORS: ProductColor[] = [
  framed("oregon", "quadro-preto-azul-dourado", "Quadro Preto (Azul + Dourado)", "268/10", "preto", "azul", "dourado"),
  framed("oregon", "quadro-branco-azul-dourado", "Quadro Branco (Azul + Dourado)", "268/11", "branco", "azul", "dourado"),
  solid("oregon", "branco", "268/05"),
  solid("oregon", "rosa", "268/03", "Rosa Neon"),
  solid("oregon", "verde", "268/02", "Verde Neon"),
  solid("oregon", "laranja", "268/01", "Laranja Neon"),
];

const SLIM_COLORS: ProductColor[] = [
  framed("slim", "preto-azul-rosa", "Preto (Azul + Rosa)", "269/06", "preto", "azul", "rosa"),
];

const STREET_COLORS: ProductColor[] = [
  solid("street", "roxo", "270/08"),
  solid("street", "azul", "270/04"),
  solid("street", "laranja", "270/01", "Laranja Neon"),
  solid("street", "verde", "270/02", "Verde Neon"),
];
const DOBLE_COLORS: ProductColor[] = [
  solid("doble", "laranja", "271/01", "Laranja Neon"),
  solid("doble", "verde", "271/02", "Verde Neon"),
  solid("doble", "rosa", "271/03", "Rosa Neon"),
];
const PULSE_COLORS: ProductColor[] = [
  solid("pulse", "azul", "272/04"),
  solid("pulse", "laranja", "272/01", "Laranja Neon"),
  solid("pulse", "verde", "272/02", "Verde Neon"),
];
const MAJESTIC_COLORS: ProductColor[] = [solid("majestic", "rosa", "273/03"), solid("majestic", "preto", "273/06")];
const PRO_KIDS_COLORS: ProductColor[] = [solid("pro-kids", "azul", "274/04"), solid("pro-kids", "vermelho", "274/07")];
const LOVE_KIDS_COLORS: ProductColor[] = [solid("love-kids", "rosa", "275/03"), solid("love-kids", "branco", "275/05")];

const MODELS: BikeModel[] = [
  { id: "oregon", name: "Oregon", aro: 29, colors: OREGON_COLORS },
  { id: "slim", name: "Slim", aro: 29, colors: SLIM_COLORS },
  { id: "street", name: "Street", aro: 26, colors: STREET_COLORS },
  { id: "doble", name: "Doble", aro: 26, colors: DOBLE_COLORS },
  { id: "pulse", name: "Pulse", aro: 20, colors: PULSE_COLORS },
  { id: "majestic", name: "Majestic", aro: 20, colors: MAJESTIC_COLORS },
  { id: "pro-kids", name: "Pro Kids", aro: 16, colors: PRO_KIDS_COLORS },
  { id: "love-kids", name: "Love Kids", aro: 16, colors: LOVE_KIDS_COLORS },
];

createCatalogPage<BikeModel>({
  models: MODELS,
  photos,
  logos,
  emptyMessage: "Escolha um modelo ao lado para ver a bike.",
  grouping: {
    keyOf: (model) => model.aro,
    labelOf: (aro) => `Aro ${aro}`,
  },
});
