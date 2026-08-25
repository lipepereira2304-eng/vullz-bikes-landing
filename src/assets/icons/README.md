# Ícones dos destaques da ficha técnica

Os seis cartões que aparecem ao abrir a ficha técnica têm um espaço reservado
para um ícone. Enquanto o arquivo não existe, o espaço fica com um contorno
tracejado — **assim que o arquivo entrar aqui, ele aparece sozinho.**

Não é preciso mexer em código: a busca é por **nome de arquivo**, igual às fotos
das bikes.

## Como adicionar

Coloque o arquivo nesta pasta com o nome que está no campo `icon` do destaque
(em `src/scripts/catalogo-interativo.ts`). Extensões aceitas: `.svg`, `.png`,
`.webp` — nessa ordem de preferência.

Os nomes são compartilhados entre modelos: "Quadro em aço de carbono" reusa o
mesmo `quadro`, "Aros em alumínio" reusa o `aro-parede-dupla`. Só crie um
arquivo novo quando o desenho for realmente outro.

### ✅ Já na pasta

| Arquivo | Usado em |
| --- | --- |
| `quadro.png` | Quadro (alumínio ou aço) — todos |
| `cambio.png` | Câmbio traseiro Shimano — aro 29 e Street |
| `freio.png` | Freio a disco — aro 29 e Street |
| `alavanca.png` | Alavanca 3x7 — aro 29 e Street |
| `aro-parede-dupla.png` | Aros aéros / Aros em alumínio |
| `aro.png` | Aro 29 |
| `aro-16.png` `aro-20.png` `aro-26.png` | Aro de cada bike |
| `18-velocidades.png` | 18 velocidades — Doble |
| `dupla-suspensao.png` | Dupla suspensão — Doble |
| `freio-v-brake.png` | Freio v-brake — Doble, Pulse, Majestic, Kids |
| `pedivela.png` | Pedivela monobloco — Pulse, Majestic |
| `aro-36-raios.png` | Aros 36 raios — Pulse |
| `descanso-lateral.png` | Descanso lateral — Pulse, Majestic |
| `cestinha.png` | Cestinha frontal — Majestic, Love Kids |
| `rodinha.png` | Rodinhas de apoio — Pro Kids, Love Kids |
| `capa-de-protecao.png` | Capa de proteção — Pro Kids, Love Kids |
| `tipo-de-bateria.png` | Tipo de bateria — todos os elétricos |
| `potencia-do-motor.png` | Potência do motor — todos os elétricos |
| `autonomia.png` | Autonomia — todos os elétricos |
| `velocidade-maxima.png` | Velocidade máxima — todos os elétricos |
| `capacidade-de-peso.png` | Capacidade de carga — todos os elétricos |

Todos os 8 modelos de bicicleta têm os 6 ícones. Os 5 modelos elétricos com
ficha técnica reusam os últimos 5 ícones da tabela (mesmos ícones pros 5,
só o valor de cada cartão muda) — processados a partir da arte que o
cliente colocou aqui (fundo removido, recolorida pro mesmo cinza,
redimensionada pra 256×256) em 25/08/2026. Nada reservado no momento.

## Como os arquivos devem ser

- **Quadrados** (proporção 1:1). São exibidos em 28×28 px, com `object-contain`.
- **SVG é o ideal**: escala sem perder nitidez e pesa pouco. Se vier de PNG,
  exportar em pelo menos 84×84 px (3×) para não borrar em tela retina.
- **Fundo transparente.**
- **O DESENHO precisa preencher o canvas** — em torno de 80% da largura ou
  altura (o que for maior), não só uma silhueta pequena centralizada num
  quadro grande de espaço vazio. `object-contain` nunca estica o desenho além
  do que o próprio arquivo já ocupa: uma margem generosa ao redor do desenho
  faz o ícone renderizar visivelmente menor que os outros na mesma tela,
  mesmo todos medindo 256×256 — foi exatamente o que aconteceu com os 5
  ícones dos elétricos na primeira leva (preenchiam só ~50% do quadro) e
  precisou de um recorte + reenquadramento à parte pra corrigir.
- **Cor:** o padrão é o cinza `#737373` (o mesmo dos demais ícones). Se o
  arquivo vier preto (ou de outra cor), é recolorido para esse cinza no momento
  de entrar — a forma é preservada, só a cor muda. Ícones sobre fundo branco
  opaco também são convertidos para traço sobre transparente.

## Se um arquivo faltar

O cartão continua funcionando: o espaço fica reservado e vazio, com um contorno
tracejado. Nada quebra, nada se desloca — quando o arquivo chegar, ele
simplesmente preenche o lugar que já estava guardado.
