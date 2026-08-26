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

Diferente do catálogo das bikes, aqui **cada modelo tem sua própria lista de
cores** — não são as mesmas 3 pra todo mundo (ver `MODELS` em
`catalogo-eletricos.ts`, cada um chama `colors(modelId, [...])` com a lista
própria). A lista é a linha de produto real, confirmada pelo cliente em
25/08/2026 — um modelo não ter uma cor listada aqui não é "falta foto", é
"não existe nessa cor": a bolinha nem aparece na tela. Isso é diferente de
uma cor que EXISTE na lista mas ainda não tem foto, que aparece normalmente e
mostra "Em breve..." no lugar da imagem.

| Modelo             | Pasta                                       | Cores da linha         | Status                          |
| ------------------- | -------------------------------------------- | ------------------------ | ---------------------------------- |
| Urban Citycoco      | `src/assets/eletricos/urban-citycoco/`       | `preto`                  | completo                          |
| Urban Drive         | `src/assets/eletricos/urban-drive/`          | `azul`, `laranja`, `verde` | completo (tons próprios — ver nota abaixo) |
| Urban Max           | `src/assets/eletricos/urban-max/`            | `preto`, `vermelho`      | completo, fundo opaco             |
| Urban Plus          | `src/assets/eletricos/urban-plus/`           | `branco`, `preto`, `vermelho` | completo (sombra do `preto` reconstruída — ver nota abaixo, **resultado ainda não aprovado**) |
| Urban Volt (V-50)   | `src/assets/eletricos/urban-volt-v50/`       | `preto`, `vermelho`      | completo, fundo transparente (sem sombra própria — ver nota abaixo) |

Arquivos esperados em cada pasta: `branco.webp`, `preto.webp`, `vermelho.webp`
etc. (ou `.jpg`/`.jpeg`/`.png`), sempre batendo com a lista de cores do
modelo na tabela acima.

**V-10 foi removido do catálogo** (25/08/2026) — é o mesmo produto que a
Urban Citycoco, não um modelo à parte; não existe mais como entrada
separada em `MODELS` nem como pasta de assets.

**Urban Volt (V-50)** era exibida como "V-50" — nome trocado a pedido do
cliente. O nome novo é o que aparece em qualquer lugar do site que mostre
este modelo; `id`/pasta acompanharam a troca.

**Urban Drive — cor é acento, não pintura inteira.** Diferente dos outros
modelos (corpo inteiro numa cor), a Urban Drive é preta com só um acento
colorido (punho do guidão, garfo, faixa da carenagem) — o tom genérico da
`PALETTE` (pensado pra pintura de corpo inteiro) ficava visivelmente errado
nas bolinhas de seleção. Por isso tem entrada própria em
`MODEL_COLOR_OVERRIDES`, com os três tons medidos direto das fotos reais
(amostra de pixel em dois pontos do acento por cor, filtrando por saturação
HSV pra pegar só o "miolo" puro da cor, sem borda nem reflexo). Se a Urban
Drive ganhar fotos novas, vale reconferir se o tom do acento mudou antes de
reaproveitar esses valores.

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

**Urban Plus `preto` — sombra reconstruída manualmente, REPROVADA pelo
cliente (25/08/2026), ajuste pendente.** As fotos `branco` e `vermelho`
vieram com um pedaço retangular do chão de estúdio (com sombra) ainda colado
no recorte; a `preto` recebeu um recorte mais limpo, sem sobra de chão
nenhuma — e por isso, sem sombra. Como as três fotos não são pixel-alinhadas
entre si (escala/enquadramento variam um pouco de uma sessão de captura pra
outra), copiar a sombra das irmãs direto por cima da preta ficaria deslocado;
a sombra foi reconstruída do zero como uma sombra de contato sintética,
ancorada nos pontos reais de onde as rodas TOCAM O CHÃO nessa própria foto.
O cliente avaliou o resultado publicado como ruim e pediu pra deixar pra
depois — **não repetir essa técnica em outro modelo sem revisar antes**. Se
um dia a Urban Plus ganhar fotos novas com recorte consistente entre as três
cores, o problema todo deixa de existir.

## Ficha técnica (25/08/2026)

Todos os 5 modelos têm ficha técnica agora, no mesmo padrão das bikes (ver
`ProductSpecs`/`SpecHighlight` em types.ts) — só com uma diferença
deliberada: **sem o botão "Mais informações"**, a pedido do cliente ("não
precisa ter... por não ter uma ficha muito detalhada e extensa"). Isso não
exigiu nenhuma mudança no motor: o botão só aparece quando o modelo declara
`details` (a tabela completa) em `ProductSpecs`, e nenhum elétrico declara —
só `highlights`, os cartões.

Os 5 cartões (Tipo de Bateria, Potência do Motor, Autonomia, Velocidade
Máxima, Capacidade de Carga) vêm da planilha `Vullz_Ficha_Tecnica_Modelos.xlsx`
que o cliente enviou, na mesma ordem das colunas dela. **3 campos da Urban
Drive são PROVISÓRIOS na planilha original** (potência, autonomia e carga —
só bateria e velocidade são confirmados pelo cliente); ver o comentário de
`electricHighlights` em `catalogo-eletricos.ts` antes de tratar esses
números como definitivos.

**REF. por cor:** códigos reais recebidos do cliente em 26/08/2026, em `REFS`
(`catalogo-eletricos.ts`). A Urban Drive é exceção — um único código (264)
cobre as 3 cores. `REF_PLACEHOLDER` (`xxx/xx`) continua existindo como rede de
segurança pra qualquer cor futura que ainda não tenha código.

**Descrição genérica:** o quadro acima da ficha técnica (campo `description`)
usa o mesmo texto placeholder pros 5 modelos por enquanto — o cliente ainda
vai escrever a descrição própria de cada um (`GENERIC_DESCRIPTION` em
`catalogo-eletricos.ts`).

Ícones dos 5 cartões: ver `src/assets/icons/README.md`.

## Logos (nome estilizado de cada modelo)

Mesma pasta do modelo, arquivo `logo.svg` (ou `.png`/`.webp`), fundo
transparente. Aparece acima da bike no lugar do nome em texto — enquanto não
existe (nenhum modelo tem ainda), o nome em texto continua aparecendo
normalmente.

```
src/assets/eletricos/<id-do-modelo>/logo.svg
```
