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

  Os dois são OPCIONAIS e independentes, porque chegam em tempos diferentes: a
  tabela `details` veio para todos os modelos de uma vez (planilha do cliente),
  mas os `highlights` só existem para os aro 29 até agora. Um modelo só com
  `details` mostra a tabela direto, sem o botão "Mais informações" (não há
  primeiro nível para recolher); quando ganhar `highlights`, o botão volta
  sozinho. Ver specsContentMarkup.

  Seis não é um número solto: o grid é 3x2, e uma lista de tamanho diferente
  quebra essa simetria. Se um modelo tiver mais de seis características
  marcantes, a escolha é editorial (quais seis destacar), não técnica.
*/
export interface SpecHighlight {
  /*
    Nome do ARQUIVO do ícone (sem extensão), procurado em src/assets/icons/ —
    mesma convenção das fotos e dos logos: larga o arquivo na pasta com o nome
    certo e ele aparece, sem tocar em código.

    Enquanto o arquivo não existe, o cartão reserva o espaço e o deixa vazio.
    Reservar desde já (em vez de encolher o cartão) é o que garante que, no dia
    em que os ícones chegarem, nada no layout se desloque.
  */
  icon: string;
  label: string;
}

export interface ProductSpecs {
  highlights?: SpecHighlight[];
  details?: SpecDetail[];
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
  /* Ícones dos destaques da ficha técnica. Opcional: sem ele os cartões
     aparecem com o espaço do ícone reservado e vazio. */
  icons?: AssetMap;
  /** Convite mostrado no palco enquanto nenhum modelo foi escolhido. */
  emptyMessage: string;
  grouping?: CatalogGrouping<M>;
}
