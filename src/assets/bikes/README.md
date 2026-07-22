# Fotos das bikes — convenção de pastas

Cada modelo tem sua própria pasta aqui dentro, e cada foto de cor vai direto
nessa pasta com o **nome exato do id da cor** (sem espaço, sem acento, tudo
minúsculo, separado por hífen). O sistema (`src/scripts/catalogo-interativo.ts`)
carrega qualquer arquivo `.jpg`, `.jpeg`, `.png` ou `.webp` que siga esse
caminho automaticamente — não precisa avisar, nem mexer em código.

```
src/assets/bikes/<id-do-modelo>/<id-da-cor>.jpg
```

## Oregon (já configurado)

Pasta: `src/assets/bikes/oregon/`

| Arquivo                                  | Cor                              |
| ----------------------------------------- | --------------------------------- |
| `quadro-preto-azul-dourado.jpg`           | Quadro Preto (Azul + Dourado)     |
| `quadro-branco-azul-dourado.jpg`          | Quadro Branco (Azul + Dourado)    |
| `branco.jpg`                              | Branco                            |
| `rosa.jpg`                                | Rosa                              |
| `verde.jpg`                               | Verde                             |
| `laranja.jpg`                             | Laranja                           |

## Slim

Pasta: `src/assets/bikes/slim/`

| Arquivo                    | Cor                    |
| --------------------------- | ---------------------- |
| `preto-azul-rosa.jpg`      | Preto (Azul + Rosa)    |

## Street

Pasta: `src/assets/bikes/street/`

| Arquivo         | Cor      |
| ---------------- | -------- |
| `roxo.jpg`      | Roxo     |
| `azul.jpg`      | Azul     |
| `laranja.jpg`   | Laranja  |
| `verde.jpg`     | Verde    |

## Doble

Pasta: `src/assets/bikes/doble/`

| Arquivo         | Cor      |
| ---------------- | -------- |
| `laranja.jpg`   | Laranja  |
| `verde.jpg`     | Verde    |
| `rosa.jpg`      | Rosa     |

## Pulse

Pasta: `src/assets/bikes/pulse/`

| Arquivo         | Cor      |
| ---------------- | -------- |
| `azul.jpg`      | Azul     |
| `laranja.jpg`   | Laranja  |
| `verde.jpg`     | Verde    |

## Majestic

Pasta: `src/assets/bikes/majestic/`

| Arquivo         | Cor      |
| ---------------- | -------- |
| `rosa.jpg`      | Rosa     |
| `preto.jpg`     | Preto    |

## Pro Kids

Pasta: `src/assets/bikes/pro-kids/`

| Arquivo          | Cor       |
| ----------------- | --------- |
| `azul.jpg`       | Azul      |
| `vermelho.jpg`   | Vermelho  |

## Love Kids

Pasta: `src/assets/bikes/love-kids/`

| Arquivo         | Cor      |
| ---------------- | -------- |
| `rosa.jpg`      | Rosa     |
| `branco.jpg`    | Branco   |

## Padrão de canvas (obrigatório pra todo modelo/cor)

Pra toda foto ficar "perfeitamente alinhada" ao trocar de cor ou modelo, todo
mundo segue o MESMO canvas, sempre:

- **Canvas: 1800×1320px** (proporção 1.3636:1 — mesma da foto original
  entregue pelo cliente, 3000×2200px).
- **Mesma posição/enquadramento em toda foto de um mesmo modelo**: câmera,
  distância e ângulo idênticos entre as cores, pra bike cair sempre no mesmo
  lugar do canvas (mesma margem esquerda/direita/topo/base). O jeito mais
  confiável de garantir isso é fixar a câmera (tripé) e marcar a posição da
  bike no chão antes de fotografar todas as cores em sequência.
- **Fundo transparente** (canal alpha), não branco sólido — mesmo que a
  página seja branca, a transparência é o que faz o efeito de sombra
  flutuante (`drop-shadow` no CSS) desenhar a sombra em volta da BIKE, e não
  um retângulo em volta da foto inteira. Se a foto vier com fundo branco
  sólido (photos de estúdio, por exemplo), o fundo pode ser removido depois
  — a sombra suave sob as rodas, se já vier na foto, não precisa ser
  removida junto (ela fica preservada, só o branco ao redor sai).
- Formato de arquivo: WebP, comprimido (qualidade ~90) — fica bem menor que
  PNG sem perda visível numa foto de produto.

## Logos (nome estilizado de cada modelo)

Mesma pasta do modelo, arquivo `logo.svg` (ou `.png`/`.webp`), fundo
transparente. Aparece acima da bike no lugar do nome em texto — enquanto não
existe, o nome em texto continua aparecendo normalmente.

```
src/assets/bikes/<id-do-modelo>/logo.svg
```

| Modelo     | Status                                  |
| ---------- | ---------------------------------------- |
| Oregon     | `oregon/logo.webp` (configurado)         |
| Slim       | `slim/logo.webp` (configurado)           |
| Street     | `street/logo.webp` (configurado)         |
| Doble      | `doble/logo.webp` (configurado)          |
| Pulse      | `pulse/logo.webp` (configurado)          |
| Majestic   | `majestic/logo.webp` (configurado)       |
| Pro Kids   | `pro-kids/logo.webp` (configurado)       |
| Love Kids  | `love-kids/logo.webp` (configurado)      |

Todos os 8 modelos têm logo configurado.

Recomendações: SVG se for vetor puro; PNG/WebP com transparência se não for.
Cor com bom contraste em fundo branco (preto ou cor da marca). Proporção mais
larga que alta (tipo wordmark) encaixa melhor no espaço reservado. Exportar
em resolução alta (a arte da Oregon, por exemplo, tem 3237×382px pra caber
nítida em qualquer tela, incluindo retina).
