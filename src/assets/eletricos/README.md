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
| Urban Max           | `src/assets/eletricos/urban-max/`            | `preto`/`vermelho`, fundo opaco — falta `branco` |
| Urban Plus          | `src/assets/eletricos/urban-plus/`           | `preto`/`branco`/`vermelho` completo (sombra do `preto` reconstruída — ver nota abaixo) |
| V-10                | `src/assets/eletricos/v-10/`                 | sem fotos ainda                          |
| Urban Volt (V-50)   | `src/assets/eletricos/urban-volt-v50/`       | `preto`/`vermelho`, fundo transparente (sem sombra própria — ver nota abaixo) — falta `branco` |

Arquivos esperados em cada pasta: `branco.webp`, `preto.webp`, `vermelho.webp`
(ou `.jpg`/`.jpeg`/`.png`).

**Urban Volt (V-50)** era exibida como "V-50" — nome trocado a pedido do
cliente. O nome novo é o que aparece em qualquer lugar do site que mostre
este modelo; `id`/pasta acompanharam a troca.

## Padrão de canvas (o mesmo do catálogo das bikes)

Ver `src/assets/bikes/README.md` pro padrão completo de canvas: **1800×1320px**,
mesma posição/enquadramento entre as cores de um mesmo modelo, WebP comprimido
(qualidade ~90). Fundo pode ser transparente ou opaco — ver a política de
sombra abaixo, que trata os dois casos da mesma forma.

**Sem sombra sintética em nenhum elétrico, por padrão do cliente.** Diferente
das bicicletas, nenhuma foto de elétrico hoje é um recorte pensado como still
de produto flutuando — mesmo quando o arquivo tem canal alfa (caso da Urban
Volt), é uma foto de estúdio comum, e a sombra que ela tiver (ou não tiver) é
a real, feita na captura. Por isso `catalogo-eletricos.ts` liga
`stageShadow: false` para o catálogo inteiro — nenhuma foto nova precisa
declarar nada, ela já nasce sem o filtro CSS. Só ligar `stageShadow: true`
num modelo específico se um dia ele ganhar um recorte pensado de propósito
para o efeito do site (ver o campo em `ProductModel`, em types.ts).

Cuidado ao subir uma foto SEM nenhuma sombra própria (silhueta limpa, fundo
liso até nos cantos onde teria chão): sem a sombra sintética E sem a sombra
real, o produto fica sem nenhum apoio visual — "flutuando" de verdade. Vale
conferir visualmente antes de publicar.

**Urban Plus `preto` — sombra reconstruída manualmente.** As fotos `branco` e
`vermelho` vieram com um pedaço retangular do chão de estúdio (com sombra)
ainda colado no recorte; a `preto` recebeu um recorte mais limpo, sem sobra
de chão nenhuma — e por isso, sem sombra. Como as três fotos não são
pixel-alinhadas entre si (escala/enquadramento variam um pouco de uma sessão
de captura pra outra), copiar a sombra das irmãs direto por cima da preta
ficaria deslocado. A sombra da `preto` foi reconstruída do zero: uma sombra
de contato sintética, ancorada nos pontos reais de onde as rodas TOCAM O CHÃO
nessa própria foto (medidos no alfa dela, que é confiável por ser um recorte
limpo), no mesmo tom e suavidade das irmãs. Se um dia a Urban Plus ganhar
fotos novas, com recorte consistente entre as três cores, esse ajuste manual
deixa de ser necessário.

## Logos (nome estilizado de cada modelo)

Mesma pasta do modelo, arquivo `logo.svg` (ou `.png`/`.webp`), fundo
transparente. Aparece acima da bike no lugar do nome em texto — enquanto não
existe (nenhum modelo tem ainda), o nome em texto continua aparecendo
normalmente.

```
src/assets/eletricos/<id-do-modelo>/logo.svg
```
