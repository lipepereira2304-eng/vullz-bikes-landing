# Pendências — Vullz Bikes Landing

Relatório vivo do que ficou em aberto. Atualizado conforme surgem itens; revisar
quando quiser. Ordenado por prioridade dentro de cada seção.

_Última atualização: 2026-07-23._

---

## 🔴 Precisam de decisão/ação sua

### 1. Inconsistências na planilha (dados aplicados fielmente, NÃO corrigidos)
A tabela agora usa os dados reais da planilha "Ficha Técnica Bikes", aplicados
tal como vieram — só limpei espaços em excesso. **Não corrigi capitalização,
acentos nem formatação**, porque isso seria adivinhar. Pontos a revisar na
fonte (`src/scripts/catalogo-interativo.ts`, const `DETAILS`):
- **"90K"** na Majestic (peso máximo) — provável erro de "90Kg".
- **"ALUMINIO"** sem acento (vários) vs. "ALUMÍNIO" no guidão — inconsistente.
- **"18.5kg"** (Doble) usa ponto e minúsculas; os outros usam "14,5 Kg" (vírgula,
  espaço, Kg). Padrões de unidade misturados no geral (Kg/kg, cm/m, aspas).
- **CAIXA ALTA** em muitos valores ("A DISCO MECÂNICO", "V-FIRE 21V") ao lado de
  "V-brake", "Grip-shift" minúsculos — a tabela fica visualmente heterogênea.
- **"NÃO"** aparece nos modelos sem marcha (Pulse/Majestic/Kids) — está correto,
  mas confirmar se prefere assim ou uma linha omitida.
**Decidir:** você corrige na planilha e reenvia, ou me autoriza a padronizar
(com cuidado manual nas siglas TZ31/PACO/SHIMANO/LEVORIN).

### 2. Ordem das linhas da tabela
Mantive a ordem exata da planilha. Nela "Freio traseiro" (7º) fica longe de
"Freio dianteiro" (13º), e "Peso máximo" cai no meio. Se preferir reagrupar por
tema (pesos juntos, freios juntos, transmissão junta), é só dizer a ordem.

### 3. Ficha da Slim usa os mesmos destaques (cards) da Oregon
A **tabela** da Slim agora é própria (dados da planilha, com "15.5''"). Mas os
**seis cards de destaque** ainda são os mesmos da Oregon (const compartilhada
`ARO29_HIGHLIGHTS`), a seu pedido. Confirmar se a Slim tem os mesmos destaques.

### 4. Ícones dos novos cards (9 arquivos faltando)
Os cards de destaque dos 6 modelos já estão definidos, mas 9 ícones ainda não
existem — hoje mostram o espaço tracejado reservado. Largar na pasta
`src/assets/icons/` com o nome exato (ver o README de lá):
`freio-v-brake`, `18-velocidades`, `dupla-suspensao`, `pedivela-monobloco`,
`aros-36-raios`, `descanso-lateral`, `cestinha-frontal`, `rodinhas-de-apoio`,
`capa-de-protecao`.

### 5. Doble tem 5 cards (não 6) → uma célula vazia no grid
Você listou 4 características + aro para a Doble = 5 cards. O grid é 3×2, então
sobra uma célula vazia no canto inferior direito. Fica aceitável, mas se quiser
simetria, definir um 6º destaque para a Doble.

### 5. Labels dos cards (aro 29): manter detalhados ou encurtar?
Ao definir a ordem você escreveu nomes curtos ("câmbio traseiro", "freio a
disco"...). Mantive os **detalhados** ("Câmbio traseiro Shimano TZ31" etc.) para
não perder a informação técnica. **Decidir:** detalhado (alguns quebram em 3
linhas) ou curto (cards mais limpos). Trivial trocar.

### 6. Faltam as fichas do catálogo de ELÉTRICOS
Todo o `catalogo-eletricos.ts` ainda está sem ficha técnica.

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
- Tabela "Mais informações" com dados reais da planilha aplicada aos **8
  modelos** de bicicleta. Modelos sem cards abrem a tabela direto (sem botão);
  os aro 29 mantêm cards + botão. Verificado modelo a modelo.
