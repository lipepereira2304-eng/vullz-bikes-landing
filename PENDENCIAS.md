# Pendências — Vullz Bikes Landing

Relatório vivo do que ficou em aberto. Atualizado conforme surgem itens; revisar
quando quiser. Ordenado por prioridade dentro de cada seção.

_Última atualização: 2026-07-23._

---

## 🔴 Precisam de decisão/ação sua

### 1. Dados da tabela ("Mais informações") são inventados
A tabela `details` da ficha (hoje compartilhada por Oregon e Slim) foi escrita
só para dar noção visual — **nenhum número foi conferido com o catálogo**: peso,
medidas, entre-eixos, garantia etc. Os **seis destaques (cards) são reais**; a
tabela não. Substituir pelos valores reais antes de publicar de verdade.
Arquivo: `src/scripts/catalogo-interativo.ts`, const `ARO29_SPECS.details`.

### 2. Ficha da Slim é cópia da Oregon
A pedido seu, a Slim usa **exatamente a mesma ficha** da Oregon por enquanto
(mesma const `ARO29_SPECS`). Os destaques da Oregon podem não valer para a Slim
(câmbio, freio etc. podem diferir). Quando a Slim ganhar dados próprios, separar
em duas constantes.

### 3. Labels dos cards: manter detalhados ou encurtar?
Ao definir a nova ordem você escreveu os nomes curtos ("câmbio traseiro", "freio
a disco", "alavanca 3x7", "aros aéros"). Mantive os **detalhados** ("Câmbio
traseiro Shimano TZ31", "Freio a disco 160 mm", "Alavanca 3x7 V-Fire Index",
"Aros aéros parede dupla") para não perder a informação técnica que veio do
catálogo. **Decidir:** manter detalhado (alguns quebram em 3 linhas no card) ou
encurtar (cards mais limpos, menos informação). Trivial trocar.

### 4. Faltam as fichas dos outros modelos
Só Oregon e Slim (aro 29) têm ficha. Faltam: **Street, Doble, Pulse, Majestic,
Pro Kids, Love Kids** (catálogo de bicicletas) e **todo o catálogo de
elétricos**. Cada um é só preencher `highlights` + `details` no arquivo de dados
da página — sem tocar em código.

---

## 🟡 Qualidade / técnica (recomendo resolver antes de divulgar em massa)

### 5. Ícones têm margens internas diferentes → tamanhos visuais desiguais
Cada PNG tem uma margem transparente diferente (medido: `freio` ocupa 89% da
altura do arquivo, `quadro` só 44%). Como todos entram na mesma caixa de 36px
com `object-contain`, uns aparecem bem maiores que outros. **Correção
definitiva:** reexportar todos com o desenho preenchendo o mesmo % do quadrado.
Alternativa: compensar por CSS ícone a ícone (funciona, mas quebra se os
arquivos forem reexportados). Não mexo nas imagens sem seu aval.

### 6. Peso dos ícones PNG (relevante para mobile / QR Code)
1,2 MB só de ícones — `freio.png` sozinho tem 383 KB para um ícone de 36px.
Num catálogo aberto por QR Code em rede móvel, pesa mais que a foto da bike.
**Ideal: SVG** (poucos KB, nítido em qualquer tela, e é desenho de traço). Se só
houver PNG, reexportar a ~128px em vez de 1024px corta ~95% do peso. Você disse
que salvou PNG "pra testar", então provavelmente já está no radar.

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
