# Fotos dos elétricos — convenção de pastas

Mesma convenção do catálogo das bikes (`src/assets/bikes/README.md`), só que
nesta pasta. Cada modelo tem sua própria pasta aqui dentro, e cada foto de
cor vai direto nessa pasta com o **nome exato do id da cor** (sem espaço,
sem acento, tudo minúsculo, separado por hífen). O sistema
(`src/scripts/catalogo-eletricos.ts`) carrega qualquer arquivo `.jpg`,
`.jpeg`, `.png` ou `.webp` que siga esse caminho automaticamente — não
precisa avisar, nem mexer em código.

```
src/assets/eletricos/<id-do-modelo>/<id-da-cor>.jpg
```

## Modelos e cores (por enquanto)

Todos os modelos abaixo têm as mesmas 3 cores padrão: `branco`, `preto` e
`vermelho`. Ainda faltam fotos reais de todos — enquanto não existem, o
catálogo mostra "Em breve..." no lugar da foto.

| Modelo         | Pasta                              |
| -------------- | ----------------------------------- |
| Urban Citycoco | `src/assets/eletricos/urban-citycoco/` |
| Urban Drive    | `src/assets/eletricos/urban-drive/`    |
| Urban Max      | `src/assets/eletricos/urban-max/`      |
| Urban Plus     | `src/assets/eletricos/urban-plus/`     |
| V-10           | `src/assets/eletricos/v-10/`           |
| V-50           | `src/assets/eletricos/v-50/`           |

Arquivos esperados em cada pasta: `branco.jpg`, `preto.jpg`, `vermelho.jpg`
(ou `.jpeg`/`.png`/`.webp`).

## Padrão de canvas (o mesmo do catálogo das bikes)

Ver `src/assets/bikes/README.md` pro padrão completo. Resumindo: canvas
**1800×1320px**, fundo transparente (não branco sólido), mesma
posição/enquadramento entre as cores de um mesmo modelo, WebP comprimido
(qualidade ~90).

## Logos (nome estilizado de cada modelo)

Mesma pasta do modelo, arquivo `logo.svg` (ou `.png`/`.webp`), fundo
transparente. Aparece acima da bike no lugar do nome em texto — enquanto não
existe (nenhum modelo tem ainda), o nome em texto continua aparecendo
normalmente.

```
src/assets/eletricos/<id-do-modelo>/logo.svg
```
