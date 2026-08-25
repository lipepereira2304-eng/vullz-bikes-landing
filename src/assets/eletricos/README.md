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
`vermelho`. Enquanto uma foto não existe, o catálogo mostra "Em breve..." no
lugar dela — não precisa ser tudo de uma vez, cor por cor já funciona.

| Modelo             | Pasta                                       | Status                                 |
| ------------------- | -------------------------------------------- | ---------------------------------------- |
| Urban Citycoco      | `src/assets/eletricos/urban-citycoco/`       | sem fotos ainda                          |
| Urban Drive         | `src/assets/eletricos/urban-drive/`          | sem fotos ainda                          |
| Urban Max           | `src/assets/eletricos/urban-max/`            | `preto`/`vermelho`, fundo OPACO (ver nota abaixo) — falta `branco` |
| Urban Plus          | `src/assets/eletricos/urban-plus/`           | sem fotos ainda                          |
| V-10                | `src/assets/eletricos/v-10/`                 | sem fotos ainda                          |
| Urban Volt (V-50)   | `src/assets/eletricos/urban-volt-v50/`       | `preto`/`vermelho`, fundo transparente — falta `branco` |

Arquivos esperados em cada pasta: `branco.webp`, `preto.webp`, `vermelho.webp`
(ou `.jpg`/`.jpeg`/`.png`).

**Urban Volt (V-50)** era exibida como "V-50" — nome trocado a pedido do
cliente. O nome novo é o que aparece em qualquer lugar do site que mostre
este modelo; `id`/pasta acompanharam a troca.

## Padrão de canvas (o mesmo do catálogo das bikes)

Ver `src/assets/bikes/README.md` pro padrão completo. Resumindo: canvas
**1800×1320px**, fundo transparente (não branco sólido), mesma
posição/enquadramento entre as cores de um mesmo modelo, WebP comprimido
(qualidade ~90).

**Exceção conhecida — Urban Max:** as fotos recebidas vieram com fundo branco
sólido (sem canal alfa), a pedido do cliente para testar o resultado antes de
investir em recorte. Fundo transparente continua sendo o padrão pedido para
todo modelo novo; se uma foto chegar sem transparência, o modelo correspondente
precisa declarar `stageShadow: false` em `src/scripts/catalogo-eletricos.ts`
(ver o comentário no próprio código) — sem isso, a sombra flutuante do palco
desenha um contorno visível ao redor do retângulo da foto.

## Logos (nome estilizado de cada modelo)

Mesma pasta do modelo, arquivo `logo.svg` (ou `.png`/`.webp`), fundo
transparente. Aparece acima da bike no lugar do nome em texto — enquanto não
existe (nenhum modelo tem ainda), o nome em texto continua aparecendo
normalmente.

```
src/assets/eletricos/<id-do-modelo>/logo.svg
```
