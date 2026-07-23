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

### Nomes esperados hoje (Oregon)

| Arquivo | Cartão |
| --- | --- |
| `quadro.svg` | Quadro em alumínio |
| `cambio.svg` | Câmbio traseiro Shimano TZ31 |
| `freio.svg` | Freio a disco 160 mm |
| `alavanca.svg` | Alavanca 3x7 V-Fire Index |
| `aro-parede-dupla.svg` | Aros aéros parede dupla |
| `aro.svg` | Aro 29 |

Os nomes são compartilhados entre modelos: se a Slim também tiver "Quadro em
alumínio", ela reusa o mesmo `quadro.svg`. Só crie um arquivo novo quando o
desenho for realmente outro.

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
