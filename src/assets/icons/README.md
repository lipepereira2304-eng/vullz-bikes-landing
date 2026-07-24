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

### ⏳ Faltam (hoje mostram o espaço tracejado)

Cartões que você pediu para reservar. Largar o arquivo com este nome exato:

| Arquivo esperado | Cartão | Modelos |
| --- | --- | --- |
| `freio-v-brake.png` | Freio v-brake | Doble, Pulse, Majestic, Pro Kids, Love Kids |
| `18-velocidades.png` | 18 velocidades | Doble |
| `dupla-suspensao.png` | Dupla suspensão | Doble |
| `pedivela-monobloco.png` | Pedivela monobloco | Pulse, Majestic |
| `aros-36-raios.png` | Aros 36 raios | Pulse |
| `descanso-lateral.png` | Descanso lateral | Pulse, Majestic |
| `cestinha-frontal.png` | Cestinha frontal | Majestic, Love Kids |
| `rodinhas-de-apoio.png` | Rodinhas de apoio | Pro Kids, Love Kids |
| `capa-de-protecao.png` | Capa de proteção | Pro Kids, Love Kids |

## Como os arquivos devem ser

- **Quadrados** (proporção 1:1). São exibidos em 28×28 px, com `object-contain`
  — um arquivo fora do quadrado não distorce, mas sobra espaço de um lado.
- **SVG é o ideal**: escala sem perder nitidez e pesa pouco. Se vier de PNG,
  exportar em pelo menos 84×84 px (3×) para não borrar em tela retina.
- **Fundo transparente.**
- **Traço escuro ou preto.** O fundo do cartão é cinza bem claro (`#fafafa`),
  então ícone claro some. Se os seus vierem em branco, avise — dá para inverter
  por CSS em vez de reexportar tudo.

## Se um arquivo faltar

O cartão continua funcionando: o espaço fica reservado e vazio, com um contorno
tracejado. Nada quebra, nada se desloca — quando o arquivo chegar, ele
simplesmente preenche o lugar que já estava guardado.
