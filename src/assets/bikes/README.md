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

## Recomendações da foto

- Fundo branco puro (ou o mais próximo disso), a mesma pose/ângulo em todas as
  cores de um mesmo modelo — é o que faz a troca de cor parecer só uma troca
  de cor, sem a bike "pular" de posição.
- Tamanho generoso (pelo menos ~1600px no lado maior); a página redimensiona
  pra caber, então maior é sempre mais seguro que menor.
