import "../styles/main.css";
import { createCatalogPage } from "../catalog/create-catalog-page";
import type { ProductColor, ProductModel, SpecHighlight } from "../catalog/types";

/*
  Catálogo interativo dos ELÉTRICOS. Mesma tela do catálogo das bicicletas
  (motor compartilhado em src/catalog/); este arquivo é só dados.

  A diferença fica na configuração: aqui não existe agrupamento por aro — os
  modelos aparecem soltos, direto na lateral, sem gaveta de categoria nenhuma
  (foi um pedido explícito) — e os códigos de referência por cor vêm de REFS,
  ver mais abaixo.

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
  ÍCONES dos destaques da ficha técnica: mesma convenção das bikes, qualquer
  arquivo em src/assets/icons/ é encontrado pelo NOME (sem extensão) — os 5
  usados aqui (tipo-de-bateria, potencia-do-motor, autonomia,
  velocidade-maxima, capacidade-de-peso) foram processados a partir do que o
  cliente colocou na pasta: fundo removido (a arte original tinha fundo
  opaco quase-branco, não transparente) e recolorido pro mesmo cinza das
  bikes — sem isso, ficariam com um retângulo claro visível atrás e um tom
  levemente diferente dos ícones das bikes na mesma tela.
*/
const icons = import.meta.glob<string>("../assets/icons/*.{svg,png,webp}", {
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
  Placeholder visível pra qualquer cor que ainda não tenha código real — a
  pedido do cliente, em vez de omitir o campo (o que apagaria a REF. da ficha
  técnica e do rótulo abaixo da foto). Hoje só sobra como rede de segurança:
  toda cor de todo modelo já tem código de verdade em REFS.
*/
const REF_PLACEHOLDER = "xxx/xx";

/*
  Códigos de referência por modelo + cor, passados pelo cliente em
  26/08/2026. A Urban Drive é uma exceção: as 3 cores (azul/laranja/verde)
  usam o MESMO código (264) — não é engano, é um pedido explícito, esse
  modelo tem um único SKU pras três.

  "Urban Turbo Vermelho (38)" no material do cliente é a Urban Plus na cor
  vermelha — nome interno do sistema dele pra essa cor específica, não um
  modelo à parte. No site continua aparecendo como Urban Plus / Vermelho.
*/
const REFS: Partial<Record<string, Partial<Record<keyof typeof PALETTE, string>>>> = {
  "urban-citycoco": { preto: "265" },
  "urban-drive": { azul: "264", laranja: "264", verde: "264" },
  "urban-max": { preto: "2", vermelho: "78" },
  "urban-plus": { branco: "45", preto: "39", vermelho: "38" },
  "urban-volt-v50": { preto: "42", vermelho: "43" },
};

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
    ref: REFS[modelId]?.[id] ?? REF_PLACEHOLDER,
  }));
}

/*
  Descrições próprias por modelo, texto do cliente (26/08/2026) — substituem
  o placeholder genérico que existia antes de elas chegarem.
*/
const DESCRIPTIONS = {
  "urban-citycoco":
    "A Urban CityCoco foi criada para quem busca uma nova forma de se locomover, unindo conforto, estilo e praticidade em um único modelo. Com um design marcante e uma presença que chama atenção por onde passa, ela transforma cada trajeto em uma experiência mais agradável. Ideal para o dia a dia, oferece uma condução confortável e uma proposta moderna de mobilidade, combinando personalidade, elegância e liberdade para acompanhar diferentes estilos de vida.",
  "urban-drive":
    "A Urban Drive foi desenvolvida para quem precisa de agilidade na rotina sem abrir mão do conforto. Compacta, prática e extremamente versátil, ela é perfeita para deslocamentos urbanos, tornando o trânsito mais simples e o dia a dia muito mais eficiente. Seu visual moderno transmite inovação, enquanto sua proposta prioriza economia, facilidade de condução e mobilidade inteligente. Seja para ir ao trabalho, estudar ou resolver compromissos, a Urban Drive oferece uma experiência leve, funcional e confiável, acompanhando o ritmo da cidade com praticidade e estilo.",
  "urban-max":
    "A Urban Max foi desenvolvida para oferecer uma experiência de mobilidade mais segura e funcional. Seu projeto com três rodas proporciona maior estabilidade durante a condução, enquanto o amplo assento com encosto garante mais conforto no dia a dia. O compartimento traseiro amplia a praticidade, permitindo transportar bolsas, pequenas compras e objetos pessoais com facilidade. Uma solução inteligente para quem valoriza mobilidade com mais conveniência em cada trajeto.",
  "urban-plus":
    "A Urban Plus combina estabilidade, praticidade e funcionalidade para tornar a mobilidade ainda mais conveniente. Seu projeto com três rodas oferece uma condução equilibrada, enquanto o assento traseiro acomoda uma segunda pessoa de forma confortável em pequenos deslocamentos. Além disso, conta com um compartimento sob o banco, ideal para guardar objetos pessoais e itens do dia a dia, e uma cesta dianteira que amplia a praticidade para transportar bolsas e pequenas compras. Uma solução versátil para quem busca mais comodidade em cada trajeto.",
  "urban-volt-v50":
    "A Urban Volt reúne praticidade e versatilidade em um modelo pensado para a rotina urbana. Sua cesta dianteira facilita o transporte de bolsas, mochilas, pequenas compras e outros objetos do dia a dia, enquanto o assento traseiro oferece espaço para um segundo passageiro em deslocamentos curtos. Compacta, funcional e fácil de conduzir, é uma excelente opção para quem busca uma forma inteligente de se locomover, tornando cada trajeto mais simples, organizado e conveniente.",
} as const satisfies Record<string, string>;

/*
  Ficha técnica dos elétricos: só o primeiro nível (6 destaques vira 5 aqui,
  um por coluna da planilha do cliente, na mesma ordem dela) — SEM tabela de
  "Mais informações", a pedido do cliente ("não precisa ter o botão").  Isso
  já é suportado pelo motor sem mudar nada nele: `specsContentMarkup` só
  desenha o botão quando `details` existe (ver markup.ts) — aqui nenhum
  modelo declara `details`, então ele nunca aparece.

  Valores da planilha Vullz_Ficha_Tecnica_Modelos.xlsx (25/08/2026). Os 3
  campos da Urban Drive que vieram marcados como provisórios na planilha
  (potência, autonomia, carga) foram confirmados pelo cliente em 27/08/2026 —
  os números abaixo já são definitivos.
*/
function electricHighlights(
  bateria: string,
  potenciaW: number,
  autonomia: string,
  velocidade: string,
  cargaKg: string
): SpecHighlight[] {
  return [
    { icon: "tipo-de-bateria", label: `Bateria de ${bateria}` },
    { icon: "potencia-do-motor", label: `Motor ${potenciaW}W` },
    { icon: "autonomia", label: `Autonomia de ${autonomia}` },
    { icon: "velocidade-maxima", label: `Até ${velocidade}` },
    { icon: "capacidade-de-peso", label: `Carga até ${cargaKg}` },
  ];
}

const MODELS: ProductModel[] = [
  {
    id: "urban-citycoco",
    name: "Urban Citycoco",
    colors: colors("urban-citycoco", ["preto"]),
    description: DESCRIPTIONS["urban-citycoco"],
    specs: { highlights: electricHighlights("Lítio", 1000, "20 a 30 km", "32 km/h", "200 kg") },
  },
  {
    id: "urban-drive",
    name: "Urban Drive",
    colors: colors("urban-drive", ["azul", "laranja", "verde"]),
    description: DESCRIPTIONS["urban-drive"],
    specs: { highlights: electricHighlights("Lítio", 800, "20 a 30 km", "32 km/h", "120 kg") },
  },
  {
    id: "urban-max",
    name: "Urban Max",
    colors: colors("urban-max", ["preto", "vermelho"]),
    description: DESCRIPTIONS["urban-max"],
    specs: { highlights: electricHighlights("Chumbo", 1000, "20 a 30 km", "32 km/h", "180 kg") },
  },
  {
    id: "urban-plus",
    name: "Urban Plus",
    colors: colors("urban-plus", ["branco", "preto", "vermelho"]),
    description: DESCRIPTIONS["urban-plus"],
    specs: { highlights: electricHighlights("Chumbo", 1000, "20 a 30 km", "32 km/h", "180 kg") },
  },
  // V-10 removido — é o mesmo produto que a Urban Citycoco, não um modelo à parte.
  // Nome trocado de "V-50" para "Urban Volt (V-50)" a pedido do cliente —
  // passa a ser o nome exibido em qualquer lugar do site que mostre este
  // modelo. `id` e a pasta de fotos (src/assets/eletricos/urban-volt-v50/)
  // acompanham o novo nome.
  {
    id: "urban-volt-v50",
    name: "Urban Volt (V-50)",
    colors: colors("urban-volt-v50", ["preto", "vermelho"]),
    description: DESCRIPTIONS["urban-volt-v50"],
    specs: { highlights: electricHighlights("Chumbo", 1000, "20 a 30 km", "32 km/h", "120 kg") },
  },
];

createCatalogPage({
  models: MODELS,
  photos,
  logos,
  icons,
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
