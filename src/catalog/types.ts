/*
  Vocabulário compartilhado pelos catálogos interativos (bicicletas e
  elétricos). Deliberadamente neutro quanto a produto: quem tem "aro" é a
  bicicleta, não o catálogo — por isso o agrupamento da barra lateral entra
  como configuração (ver CatalogGrouping), não como campo fixo do modelo.
*/

/** Uma cor disponível de um modelo. */
export interface ProductColor {
  id: string;
  name: string;
  /** Cor sólida ou gradiente usado na bolinha de seleção. */
  swatch: string;
  /**
   * Código de referência real do produto, ex.: "268/01". Opcional porque só o
   * catálogo de bicicletas tem esses códigos hoje — sem ele, o rótulo abaixo
   * da foto mostra apenas o nome da cor.
   */
  ref?: string;
}

/** Uma linha da tabela detalhada da ficha técnica. */
export interface SpecDetail {
  label: string;
  value: string;
}

/*
  Ficha técnica de um modelo. Dividida em dois níveis porque a tela também é:
  `highlights` são os seis cartões que aparecem assim que a ficha abre — o que
  caracteriza a bike de relance — e `details` é a tabela completa, escondida
  atrás do "Mais informações".

  Seis não é um número solto: o grid é 3x2, e uma lista de tamanho diferente
  quebra essa simetria. Se um modelo tiver mais de seis características
  marcantes, a escolha é editorial (quais seis destacar), não técnica.
*/
/*
  Ícone de um destaque. É uma lista fechada de propósito: o desenho vem de
  SPEC_ICONS em markup.ts, então um nome fora da lista viraria um cartão sem
  ícone em silêncio. Com union type, o TypeScript acusa no build.
*/
export type SpecIcon = "frame" | "derailleur" | "brake" | "shifter" | "rim" | "wheel";

export interface SpecHighlight {
  icon: SpecIcon;
  label: string;
}

export interface ProductSpecs {
  highlights: SpecHighlight[];
  details: SpecDetail[];
}

export interface ProductModel {
  id: string;
  name: string;
  colors: ProductColor[];
  /*
    Opcional porque as fichas chegam modelo a modelo. Sem ela, a ficha abre
    com um aviso de "em breve" em vez de cartões vazios — some o conteúdo, não
    a interação.
  */
  specs?: ProductSpecs;
}

/** Mapa "caminho do arquivo" → "URL final", como devolvido por import.meta.glob eager. */
export type AssetMap = Record<string, string>;

/*
  Agrupamento em sanfona da barra lateral. Presente no catálogo de bicicletas
  (agrupa por aro), ausente no de elétricos — que mostra os modelos soltos, um
  por linha. A ausência não é só cosmética: sem grupos não existe estado de
  "grupo aberto", e o espaçamento do <nav> muda (ver createCatalogPage).
*/
export interface CatalogGrouping<M extends ProductModel> {
  /** Valor que define a qual grupo o modelo pertence, ex.: o aro. */
  keyOf: (model: M) => number;
  /** Rótulo exibido no cabeçalho do grupo, ex.: 29 → "Aro 29". */
  labelOf: (key: number) => string;
}

export interface CatalogConfig<M extends ProductModel = ProductModel> {
  models: M[];
  photos: AssetMap;
  logos: AssetMap;
  /** Convite mostrado no palco enquanto nenhum modelo foi escolhido. */
  emptyMessage: string;
  grouping?: CatalogGrouping<M>;
}
