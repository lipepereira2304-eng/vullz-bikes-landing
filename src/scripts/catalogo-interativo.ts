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

/*
  ÍCONES dos destaques da ficha técnica: qualquer arquivo em src/assets/icons/
  é encontrado pelo NOME (sem extensão), que é o que o campo `icon` de cada
  destaque guarda. Mesma convenção das fotos — largar o arquivo na pasta basta,
  sem tocar neste arquivo. Ver src/assets/icons/README.md.
*/
const icons = import.meta.glob<string>("../assets/icons/*.{svg,png,webp}", {
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

/*
  ---------------------------------------------------------------------------
  FICHAS TÉCNICAS — dados reais do cliente (planilha "Ficha Técnica Bikes").
  ---------------------------------------------------------------------------

  `details` (a tabela do "Mais informações") veio para os OITO modelos. Os
  `highlights` (os seis cartões) só existem para os aro 29 até agora; os demais
  abrem a ficha mostrando a tabela direto (ver ProductSpecs / specsContentMarkup).

  Os rótulos são fixos e na mesma ordem da planilha; cada modelo entra como um
  array de 14 valores nessa ordem — é o que torna a edição futura um replace de
  strings, sem risco de desalinhar rótulo e valor.

  A padronização de EXIBIÇÃO (TUDO MAIÚSCULO, "9 KG" com espaço, "NÃO" → traço)
  é aplicada na hora de renderizar, em formatSpecValue/CSS (markup.ts), não
  aqui — assim qualquer valor futuro herda o padrão. Por isso os valores ficam
  aqui em caixa natural, legíveis para editar.

  Erros óbvios da planilha JÁ corrigidos na fonte: acento ("ALUMINIO" →
  "ALUMÍNIO"); "90K" → "90Kg" na Majestic; e separador decimal padronizado para
  VÍRGULA (a maioria da tabela já usava — "14,5", "1,15", "34,7", "31,8" no
  guidão — mas alguns campos tinham ponto: 28.6/31.8 do trocador, 122.5, 18.5,
  1.06, 15.5"/13.5"). NOTA: 28,6/31,8 mm são diâmetros de padrão técnico às
  vezes escritos com ponto; padronizados para vírgula por coerência com o resto
  da tabela — se o cliente preferir o ponto nesses, é só nesses campos.

  "NÃO" = o modelo não tem aquele componente (bikes sem marcha).
*/
const SPEC_LABELS = [
  "Peso",
  "Material do quadro",
  "Alavanca de câmbio",
  "Trocador traseiro",
  "Trocador dianteiro",
  "Pneu",
  "Freio traseiro",
  "Peso máximo suportado",
  "Tamanho do quadro",
  "Movimento central",
  "Entre-eixos",
  "Marchas",
  "Freio dianteiro",
  "Guidão",
] as const;

/** Casa os 14 valores (na ordem de SPEC_LABELS) com seus rótulos. */
function specDetails(values: readonly string[]): { label: string; value: string }[] {
  return SPEC_LABELS.map((label, i) => ({ label, value: values[i] }));
}

// prettier-ignore
const DETAILS: Record<string, { label: string; value: string }[]> = {
  oregon:      specDetails(["14,5 Kg", "ALUMÍNIO", "V-FIRE 21V", "SHIMANO TOURNEY 7V TZ31", "PACO Dual 28,6mm 31,8mm", "PACO / LEVORIN", "A DISCO MECÂNICO", "110Kg", "17''", "BLINDADO 122,5", "1,15m", "21 Velocidades", "A DISCO MECÂNICO", "ALUMÍNIO 31,8mm 720mm"]),
  slim:        specDetails(["14,5 Kg", "ALUMÍNIO", "V-FIRE 21V", "SHIMANO TOURNEY 7V TZ31", "PACO Dual 28,6mm 31,8mm", "PACO / LEVORIN", "A DISCO MECÂNICO", "110Kg", "15,5''", "BLINDADO 122,5", "1,15m", "21 Velocidades", "A DISCO MECÂNICO", "ALUMÍNIO 31,8mm 720mm"]),
  street:      specDetails(["14,5 Kg", "ALUMÍNIO", "V-FIRE 21V", "SHIMANO TOURNEY 7V TZ31", "PACO Dual 28,6mm 31,8mm", "PACO / LEVORIN", "A DISCO MECÂNICO", "110Kg", "13,5''", "BLINDADO 122,5", "1,15m", "21 Velocidades", "A DISCO MECÂNICO", "ALUMÍNIO 31,8mm 720mm"]),
  doble:       specDetails(["18,5kg", "AÇO CARBONO", "Grip-shift - trocador na luva", "PACO 18v", "PACO Dual 28,6mm 31,8mm", "PACO / LEVORIN", "V-brake", "100Kg", "17''", "34,7mm - Rosca 3 Partes", "1,06m", "18 Velocidades", "V-brake", "AÇO CARBONO"]),
  pulse:       specDetails(["11Kg", "AÇO CARBONO", "NÃO", "NÃO", "NÃO", "PACO / LEVORIN", "V-brake", "90Kg", "11''", "MONOBLOCO", "90cm", "NÃO", "V-brake", "AÇO CARBONO"]),
  majestic:    specDetails(["11Kg", "AÇO CARBONO", "NÃO", "NÃO", "NÃO", "PACO / LEVORIN", "V-brake", "90Kg", "11''", "MONOBLOCO", "90cm", "NÃO", "V-brake", "AÇO CARBONO"]),
  "pro-kids":  specDetails(["9Kg", "AÇO CARBONO", "NÃO", "NÃO", "NÃO", "PACO / LEVORIN", "V-brake", "80Kg", "8''", "MONOBLOCO", "75cm", "NÃO", "V-brake", "AÇO CARBONO"]),
  "love-kids": specDetails(["9Kg", "AÇO CARBONO", "NÃO", "NÃO", "NÃO", "PACO / LEVORIN", "V-brake", "80Kg", "8''", "MONOBLOCO", "75cm", "NÃO", "V-brake", "AÇO CARBONO"]),
};

/*
  ---------------------------------------------------------------------------
  CARTÕES DE DESTAQUE por modelo.
  ---------------------------------------------------------------------------
  Ordem = ordem no grid (esquerda→direita, cima→baixo). O PRIMEIRO cartão é
  sempre o aro da bike, e o ícone do aro é próprio de cada um (aro-16/20/26,
  e "aro" = aro 29).

  Sobre os ícones: os que já existem em src/assets/icons/ aparecem; os que ainda
  não existem (ex.: "freio-v-brake", "descanso-lateral") mostram o espaço
  reservado tracejado até o arquivo ser colocado — o cliente vai mandar depois.
  Vários destaques diferentes reusam o MESMO ícone de propósito: "Quadro em aço
  de carbono" usa o ícone `quadro` (mesma silhueta), e "Aros em alumínio" usa o
  `aro-parede-dupla` (o de aros aéros).
*/
const ARO29_HIGHLIGHTS = [
  { icon: "aro", label: "Aro 29" },
  { icon: "quadro", label: "Quadro em alumínio" },
  { icon: "cambio", label: "Câmbio traseiro Shimano TZ31" },
  { icon: "freio", label: "Freio a disco 160 mm" },
  { icon: "alavanca", label: "Alavanca 3x7 V-Fire Index" },
  { icon: "aro-parede-dupla", label: "Aros aéros parede dupla" },
];

// Street é aro 26 mas tem as MESMAS características da Oregon — só o aro muda.
const STREET_HIGHLIGHTS = [{ icon: "aro-26", label: "Aro 26" }, ...ARO29_HIGHLIGHTS.slice(1)];

const DOBLE_HIGHLIGHTS = [
  { icon: "aro-26", label: "Aro 26" },
  { icon: "quadro", label: "Quadro em aço de carbono" },
  { icon: "18-velocidades", label: "18 velocidades" },
  { icon: "freio-v-brake", label: "Freio v-brake" },
  { icon: "dupla-suspensao", label: "Dupla suspensão" },
];

const PULSE_HIGHLIGHTS = [
  { icon: "aro-20", label: "Aro 20" },
  { icon: "quadro", label: "Quadro em aço de carbono" },
  { icon: "pedivela", label: "Pedivela monobloco" },
  { icon: "freio-v-brake", label: "Freio v-brake" },
  { icon: "aro-36-raios", label: "Aros 36 raios" },
  { icon: "descanso-lateral", label: "Descanso lateral" },
];

const MAJESTIC_HIGHLIGHTS = [
  { icon: "aro-20", label: "Aro 20" },
  { icon: "quadro", label: "Quadro em aço de carbono" },
  { icon: "pedivela", label: "Pedivela monobloco" },
  { icon: "freio-v-brake", label: "Freio v-brake" },
  { icon: "cestinha", label: "Cestinha frontal" },
  { icon: "descanso-lateral", label: "Descanso lateral" },
];

const PRO_KIDS_HIGHLIGHTS = [
  { icon: "aro-16", label: "Aro 16" },
  { icon: "quadro", label: "Quadro em aço de carbono" },
  { icon: "rodinha", label: "Rodinhas de apoio" },
  { icon: "freio-v-brake", label: "Freio v-brake" },
  { icon: "capa-de-protecao", label: "Capa de proteção" },
  { icon: "aro-parede-dupla", label: "Aros em alumínio" },
];

const LOVE_KIDS_HIGHLIGHTS = [
  { icon: "aro-16", label: "Aro 16" },
  { icon: "quadro", label: "Quadro em aço de carbono" },
  { icon: "rodinha", label: "Rodinhas de apoio" },
  { icon: "freio-v-brake", label: "Freio v-brake" },
  { icon: "capa-de-protecao", label: "Capa de proteção" },
  { icon: "cestinha", label: "Cestinha frontal" },
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
  { id: "oregon", name: "Oregon", aro: 29, colors: OREGON_COLORS, specs: { highlights: ARO29_HIGHLIGHTS, details: DETAILS.oregon } },
  { id: "slim", name: "Slim", aro: 29, colors: SLIM_COLORS, specs: { highlights: ARO29_HIGHLIGHTS, details: DETAILS.slim } },
  { id: "street", name: "Street", aro: 26, colors: STREET_COLORS, specs: { highlights: STREET_HIGHLIGHTS, details: DETAILS.street } },
  { id: "doble", name: "Doble", aro: 26, colors: DOBLE_COLORS, specs: { highlights: DOBLE_HIGHLIGHTS, details: DETAILS.doble } },
  { id: "pulse", name: "Pulse", aro: 20, colors: PULSE_COLORS, specs: { highlights: PULSE_HIGHLIGHTS, details: DETAILS.pulse } },
  { id: "majestic", name: "Majestic", aro: 20, colors: MAJESTIC_COLORS, specs: { highlights: MAJESTIC_HIGHLIGHTS, details: DETAILS.majestic } },
  { id: "pro-kids", name: "Pro Kids", aro: 16, colors: PRO_KIDS_COLORS, specs: { highlights: PRO_KIDS_HIGHLIGHTS, details: DETAILS["pro-kids"] } },
  { id: "love-kids", name: "Love Kids", aro: 16, colors: LOVE_KIDS_COLORS, specs: { highlights: LOVE_KIDS_HIGHLIGHTS, details: DETAILS["love-kids"] } },
];

createCatalogPage<BikeModel>({
  models: MODELS,
  photos,
  logos,
  icons,
  emptyMessage: "Escolha um modelo ao lado para ver a bike.",
  grouping: {
    keyOf: (model) => model.aro,
    labelOf: (aro) => `Aro ${aro}`,
  },
});
