# Pendências — Vullz Bikes Landing

Relatório vivo do que ficou em aberto. Atualizado conforme surgem itens; revisar
quando quiser. Ordenado por prioridade dentro de cada seção.

_Última atualização: 2026-07-28 (ficha técnica em folha cheia nas bicicletas)._

---

## 📱 Fase mobile (tudo abaixo de 1024px)

O desktop (≥1024px) está **congelado**. Toda alteração desta fase vive atrás de
`max-lg:` ou de um `@media (width < 64rem)`, e isso é verificável: compilando o
CSS antes e depois e descartando os blocos que não alcançam 1024px, os dois
arquivos saem **idênticos byte a byte** (31.166 bytes). Qualquer mudança futura
nesta fase deveria passar no mesmo teste.

### Etapa 1 — correções estruturais (concluída)
Espaçamentos/colisões, áreas de toque, safe areas, paisagem e consistência da
navegação. Detalhe no fim deste arquivo.

### Etapa 2 — navegação de modelos (bicicletas: concluída; elétricos: aguardando aprovação)
Nova navegação mobile em **duas telas** para o catálogo de bicicletas:

- Os 4 aros viram cards de cantos arredondados, empilhados, fechados por
  padrão. Clicar expande e mostra os modelos daquele aro (linhas de lista);
  só um aro fica aberto por vez. Os cards ficam centralizados no espaço
  vertical disponível.
- Escolher um modelo troca a tela inteira para o produto (foto, cores, ficha)
  — a lista de aros sai completamente, não convive mais com o produto.
- "Voltar" ganhou uma camada: com um modelo selecionado, o primeiro clique
  devolve para a lista de aros (com o aro do modelo já aberto) em vez de ir
  direto para a home; a home continua a um clique de distância depois disso.
  Com a ficha técnica aberta, a ordem é ficha → produto → lista → home.

**Como foi escondido dos elétricos por enquanto:** o motor compartilhado
(`src/catalog/`) ganhou uma flag opcional, `mobileModelBrowser`, em
`CatalogConfig`. Só `catalogo-interativo.ts` (bicicletas) liga ela. Enquanto
um catálogo não ligar, o motor desenha ele exatamente como desenhava antes —
inclusive o atributo que decide qual tela mostrar (`data-mobile-view`) nem
chega a existir no HTML de quem não ligou. Verificado no navegador: elétricos
continua com a tira horizontal de sempre, lista e produto convivendo, sem
nenhuma mudança visual ou de comportamento.

**Quando aprovar para os elétricos:** é uma linha — acrescentar
`mobileModelBrowser: true` na chamada de `createCatalogPage` em
`catalogo-eletricos.ts`. Como lá não há agrupamento por aro (pedido explícito
do cliente), o efeito prático seria só a troca de tela lista↔produto, o
"Voltar" em camadas e a ficha em folha cheia; o card de aro não se aplica
(não existe grupo).

### Etapa 3 — ficha técnica em folha cheia (bicicletas: concluída; elétricos: aguardando aprovação)
Mesma flag `mobileModelBrowser`, mesmo status (só bicicletas por enquanto):

- A foto do produto para de se mover ao abrir a ficha no mobile (o Ato 1 do
  desktop — encolher e sair do centro — foi neutralizado só ali).
- A ficha (descrição + cards de destaque) sobe do fundo da tela como uma
  folha cheia, cobrindo completamente a foto e a logo do modelo — só o
  cabeçalho (Voltar + logo Vullz) fica visível por cima.
- O que fica atrás borra (`filter: blur`) enquanto a ficha está aberta.
- Padding/gap/tamanho dos cards de destaque e do quadro de descrição foram
  reduzidos no mobile para caber tudo (descrição + título + 6 cards + botão)
  sem precisar rolar — testado nos 8 modelos, incluindo a Doble (5 cards, uma
  célula vazia).
- "Mais informações" agora esconde a descrição junto com os destaques,
  deixando o espaço inteiro para a tabela completa; "Menos informações" traz
  os dois de volta juntos.

Itens que continuam em aberto:

1. **Ficha em paisagem.** Com a página rolando (herdado da etapa 1), a folha
   cheia da ficha fica mais alta que a tela em 844×390 e é preciso rolar para
   ver tudo — funciona, mas não foi desenhada pensando nesse caso.
2. **"Escolha um modelo ao lado…"** — não aparece mais na Tela 1 (fica
   escondida junto com o resto do palco), mas o texto em si não foi reescrito
   porque vem do config e é compartilhado com o desktop.

---

## 🔴 Precisam de decisão/ação sua

### 1. Erros da planilha — corrigidos; confirmar 1 escolha
Revisão dos valores feita. Corrigido na fonte (`const DETAILS`): acento
("ALUMINIO"→"ALUMÍNIO"); "90K"→"90Kg" (Majestic); separador decimal
padronizado para vírgula (28.6/31.8 do trocador, 122.5, 18.5, 1.06, 15.5"/13.5"
tinham ponto). **Confirmar:** 28,6/31,8 mm são diâmetros de padrão técnico às
vezes escritos com ponto — padronizei para vírgula por coerência com o resto
da tabela; se preferir o ponto NESSES campos, aviso e reverto só eles.
Conteúdo não-corrigível por mim (precisa dos valores reais): confirmar se
"Aço carbono" leva hífen, e revisar os números da tabela em si na fonte real.

### 2. Ordem das linhas da tabela
Mantive a ordem exata da planilha. Nela "Freio traseiro" (7º) fica longe de
"Freio dianteiro" (13º), e "Peso máximo" cai no meio. Se preferir reagrupar por
tema (pesos juntos, freios juntos, transmissão junta), é só dizer a ordem.

### 3. Ficha da Slim usa os mesmos destaques (cards) da Oregon
A **tabela** da Slim agora é própria (dados da planilha, com "15.5''"). Mas os
**seis cards de destaque** ainda são os mesmos da Oregon (const compartilhada
`ARO29_HIGHLIGHTS`), a seu pedido. Confirmar se a Slim tem os mesmos destaques.

### 4. (resolvido) Ícones dos novos cards
Todos os 6 ícones de cada um dos 8 modelos estão na pasta — nada reservado.
Os 9 novos vieram pretos/branco e foram recoloridos para o cinza padrão
(#737373). NOTA: o desenho de "Capa de proteção" é uma engrenagem (o arquivo
era "coroa", que você indicou usar como capa) — se quiser um desenho mais
representativo de capa depois, é só substituir o `capa-de-protecao.png`.

### 5. Doble tem 5 cards (não 6) → uma célula vazia no grid
Você listou 4 características + aro para a Doble = 5 cards. O grid é 3×2, então
sobra uma célula vazia no canto inferior direito. Fica aceitável, mas se quiser
simetria, definir um 6º destaque para a Doble.

### 5. Labels dos cards (aro 29): manter detalhados ou encurtar?
Ao definir a ordem você escreveu nomes curtos ("câmbio traseiro", "freio a
disco"...). Mantive os **detalhados** ("Câmbio traseiro Shimano TZ31" etc.) para
não perder a informação técnica. **Decidir:** detalhado (alguns quebram em 3
linhas) ou curto (cards mais limpos). Trivial trocar.

### 6. Faltam ficha técnica E descrição do catálogo de ELÉTRICOS
Todo o `catalogo-eletricos.ts` ainda está sem `specs` e sem `description`. A
estrutura já aceita os dois — é só preencher, sem tocar em código.

---

## 🟡 Qualidade / técnica (recomendo resolver antes de divulgar em massa)

### 5. (resolvido) Padronização dos ícones
Todos os 18 ícones foram normalizados: canvas 256×256, desenho ocupando 86% da
maior dimensão, centralizado — tamanho visual uniforme nos cards. De brinde, o
peso caiu de ~2 MB para ~480 KB. Cor unificada em #737373 (exceto os aros, que
ficaram num cinza mais claro — ver abaixo).

### 6. Aros num cinza mais claro que os demais ícones
Os ícones de aro (aro, aro-16/20/26) estão em ~#b0 (cinza claro), enquanto todos
os outros estão em #737373. No card, o aro (1º) fica um pouco mais claro que os
5 seguintes. Não foi pedido para uniformizar; se quiser, recoloro os aros para
#737373 também.

---

## 🟢 Ideias / futuro (sem urgência)

### 7. Fonte de identidade nos cards
Você chegou a pedir uma fonte estilizada e depois preferiu voltar ao clean.
Fica registrado: se um dia quiser reforçar a identidade, o caminho é hospedar
uma fonte condensada no projeto (`src/assets/fonts/` + `@font-face`). Chegamos a
testar Saira Condensed; foi revertido.

---

## ✅ Concluído (histórico)

- Ficha técnica em dois atos (bike desliza → painel entra), com curva de
  movimento ajustada e posição da bike calibrada.
- Cards de destaque (grid 3×2) com fade escalonado; "Mais informações" recolhe
  os cards e abre a tabela, encadeado.
- Quadro da ficha com mesma altura nos dois estados.
- Encaixe de ícones por nome de arquivo em `src/assets/icons/` (mesma convenção
  das fotos); espaço reservado com contorno tracejado enquanto falta arquivo.
- Ícones da Oregon aplicados (6/6), texto dos cards em maiúsculo, cor das
  imagens preservada.
- Nova ordem dos destaques (aro → quadro → câmbio → freio → alavanca → aros)
  aplicada a Oregon e Slim.
- Tabela "Mais informações" com dados reais da planilha aplicada aos **8
  modelos** de bicicleta. Verificado modelo a modelo.
- Cards de destaque definidos para os **8 modelos** (Street reusa os da Oregon
  com Aro 26; Doble fica com 5 cards de propósito). 9 ícones ainda a chegar.
- Padronização de exibição da tabela: valores em MAIÚSCULO (rótulo em caixa
  natural), peso sempre "NN KG" com espaço, "NÃO" → traço.
- Erros de digitação corrigidos (acento de ALUMÍNIO, "90K"→"90Kg", separador
  decimal padronizado para vírgula).
- Ícones normalizados: 256×256, desenho em 86% da caixa, cor #737373 — tamanho
  visual uniforme. Peso caiu de ~2 MB para ~480 KB.
- **Quadro de descrição** acima da ficha, nos 8 modelos. Botão "Mais
  informações" virou sticky no rodapé do card (com a descrição ocupando espaço,
  ele saía da área visível quando a tabela abria).

### Mobile — etapa 1, correções estruturais (2026-07-28)
- **Colisão cabeçalho/barra de modelos**: a barra começava no pixel exato em
  que o cabeçalho terminava (respiro de 0px). Agora são 16px entre o "Voltar" e
  o primeiro grupo.
- **Áreas de toque**: todos os alvos do catálogo estavam entre 28px e 36px,
  contra os 44px de mínimo de iOS/Android. Todos passaram a 44px. A bolinha de
  cor foi a exceção proposital: manteve os 32px de desenho e ganhou área de
  toque de 44px por um `::before` transparente (main.css), porque engordar a
  peça mudaria a trilha de cores.
- **Safe areas**: os três HTMLs declaram `viewport-fit=cover` e nenhuma regra
  recuava o conteúdo das faixas do aparelho — a trilha de cores terminava
  dentro da área do indicador de home. Os quatro recuos entram agora nos
  contêineres externos; em aparelho sem entalhe `env()` vale 0 e nada muda.
- **Paisagem**: a tela era `h-dvh` + `overflow-hidden`, então em 844×390 a foto
  do produto era espremida a ~30px. Abaixo de 1024px e só em paisagem a altura
  virou mínima e a página rola; o palco ganhou piso de 240px. O piso precisou
  ser repetido no `#stage-inner`: as camadas do crossfade são `absolute`, então
  ele tira a altura do pai por `h-full`, e um `height:100%` não resolve contra
  pai que só tem `min-height` — sem isso a foto ia a 0.
- **Navegação**: o item ativo (e o grupo recém-aberto) passou a ser trazido
  para a vista na tira horizontal; antes a seleção podia nascer fora da tela e
  a barra mostrava um estado que não era o atual. Gesto de rolagem da tira não
  vaza mais para o "voltar" do navegador.
- **`theme-color`**: os dois catálogos declaravam o grafite da home apesar de
  terem fundo branco — a barra de status do celular ficava escura sobre página
  clara. Agora é branco nas duas.

### Mobile — etapa 2, navegação de modelos das bicicletas (2026-07-28)
- Aros viraram cards expansíveis, centralizados no espaço vertical.
- Modelo selecionado troca para tela cheia do produto; "Voltar" devolve à
  lista antes da home. Atrás da flag `mobileModelBrowser` (só bicicletas).

### Mobile — etapa 3, ficha técnica em folha cheia (2026-07-28)
- Foto para de se mover ao abrir a ficha; a ficha sobe do fundo como folha
  cheia cobrindo foto e logo, com blur no que fica atrás.
- Cards de destaque e quadro de descrição reduzidos para caber sem rolar.
- "Mais informações" esconde a descrição junto com os destaques, liberando a
  tela inteira para a tabela; volta junto ao fechar. Mesma flag, só
  bicicletas por enquanto.
