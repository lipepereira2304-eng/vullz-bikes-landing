# Vullz Bikes — Catálogo Digital

Landing page premium que serve de porta de entrada para o catálogo digital da Vullz Bikes, acessada principalmente via QR Code impresso. Base do futuro site institucional.

## Stack

- **Vite + TypeScript** (vanilla, sem framework de UI) — página essencialmente estática, mantém o JS de runtime mínimo para carregamento instantâneo no celular.
- **Tailwind CSS v4** (CSS-first via `@theme` em `src/styles/main.css`, sem `tailwind.config.js`).
- Background fluido 100% vetorial (SVG + `blur` + animação CSS), sem imagens pesadas ou libs de canvas.

## Estrutura

```
index.html               → home (catálogos)
catalogo-interativo.html → mostruário das bicicletas
catalogo-eletricos.html  → mostruário dos elétricos
public/            → assets estáticos servidos como estão (favicon, manifest, robots.txt)
  catalogos/        → PDFs finais dos catálogos
src/
  assets/bikes/     → fotos e logos das bicicletas, por convenção de nome (ver README de lá)
  assets/eletricos/ → idem, para os elétricos
  assets/images/    → logos da marca
  catalog/          → motor compartilhado das duas páginas de catálogo interativo
  components/       → módulos TS que retornam markup da home (cards, botões, background)
  scripts/          → um arquivo por página + animations.ts (reveal on scroll)
  styles/           → main.css (tokens de marca + estilos base)
```

Cada `.html` da raiz é um entry point registrado em `rollupOptions.input` no
`vite.config.ts` — página nova exige as duas coisas.

As duas páginas de catálogo interativo são a **mesma tela**: todo o
comportamento (layout, sanfona da lateral, trilho de cores, crossfade da foto)
vive em `src/catalog/`, e cada script em `src/scripts/catalogo-*.ts` é só
**dados + configuração** (modelos, cores, pasta de assets, agrupamento). Um
refinamento de UX feito em `src/catalog/` vale automaticamente para as duas.

## Sistema de movimento

Todo tempo, curva e deslocamento do site vem de tokens em `@theme`
(`src/styles/main.css`) — nenhum valor de animação é escrito solto no markup ou
em JS:

| Token | Papel |
| --- | --- |
| `--duration-fast` (150ms) | press/`:active` e troca de cor pura |
| `--duration-base` (220ms) | hover em geral |
| `--duration-slow` (400ms) | sanfona, seta que a acompanha, entrada da ficha técnica |
| `--duration-layout` (520ms) | a tela se reorganiza (produto sai do centro) |
| `--duration-entrance` (700ms) | entrada de conteúdo e troca de modelo |
| `--ease-out` | reação ao cursor |
| `--ease-glide` | entradas |
| `--ease-inout` | abre/fecha (sai e chega parado) |
| `--stagger` / `--stagger-tight` | intervalo entre elementos que entram em sequência |
| `--shift-sm` (6px) / `--shift-md` (12px) | deslocamento de hover / de entrada |

Os gestos são utilities (`btn-motion`, `item-motion`, `swatch-motion`,
`tint-motion`, `chevron-motion`, `stage-fade-*`) — o markup escolhe **qual
gesto**, nunca quantos milissegundos.

### Ficha técnica: dois atos encadeados

Abrir a ficha é uma reorganização de layout em duas etapas que **nunca** se
sobrepõem — abrir: o bloco do produto encolhe e sai do centro, e só depois de
parar a ficha entra pela direita; fechar: o caminho inverso, na mesma ordem.

Quem encadeia é `setSpecsOpen()` em `create-catalog-page.ts`, esperando
`getAnimations()` do elemento terminar de verdade — não um `setTimeout` com a
duração copiada do CSS, que passaria a mentir no dia em que o token mudasse.
Por isso também os dois atos são dirigidos por atributos separados
(`data-specs` no `<main>`, `data-visible` no painel): um atributo só dispararia
tudo junto.

Um contador de geração (`specsRun`) descarta sequências interrompidas — clicar
duas vezes rápido não deixa a ficha reaparecer sozinha depois de fechada.

**Ajustar onde o produto para** é mexer em duas variáveis, em um lugar só
(`[data-role="stage-section"]` em `main.css`):

| | |
| --- | --- |
| `--specs-scale` | tamanho do bloco aberto (1 = original) |
| `--specs-x` | quanto ele anda para a esquerda, em % da largura dele |

As duas são independentes graças ao `transform-origin: left center`. Com a
origem no centro (o padrão), encolher também puxa a borda esquerda para
dentro — então mudar a escala movia a peça, e acertar os dois virava
perseguição. Com a origem na esquerda, a escala muda só o tamanho e o
translate só onde a borda esquerda para.

O movimento usa `--ease-layout`, uma curva escolhida medindo o percurso quadro
a quadro: `--ease-inout` tem um patamar no início que, nesta distância, faz o
bloco parecer que encolhe primeiro e só depois desliza.

### Duas armadilhas de camada (já corrigidas — não reintroduzir)

1. **`translate`/`scale`/`rotate` não são `transform`.** No Tailwind v4 as
   utilities `-translate-y-*`, `scale-*` e `rotate-*` geram essas propriedades
   individuais. Um `transition-property: transform` não cobre nenhuma delas e o
   efeito chega seco, sem transição — é preciso listar `translate, scale,
   rotate`. Só quem escreve `transform:` à mão (o `[data-reveal]` e o
   `stage-fade-model`) transiciona `transform`.

2. **`@layer utilities` sempre vence `@layer components`**, independente de
   especificidade. Por isso: (a) uma propriedade cujas duas pontas precisam
   conversar — como o `overflow` do painel, que recorta durante a abertura e
   libera depois — tem que morar inteira na mesma camada, nunca metade em
   classe de markup; (b) a duração de entrada do reveal é imposta por style
   inline em `animations.ts`, porque `btn-motion` (utilities) venceria
   `[data-reveal]` (components) e os cards entrariam na velocidade de hover.

## Substituindo os catálogos

Os botões dos cards apontam para `/catalogos/bicicletas.pdf` e `/catalogos/eletricos.pdf`. Basta colocar os arquivos finais com esses nomes dentro de `public/catalogos/` — nenhuma alteração de código é necessária.

## Desenvolvimento

```bash
npm install
npm run dev       # servidor local com HMR
npm run build     # build de produção em dist/
npm run preview   # servir o build de produção localmente
```

## Deploy

Projeto pronto para deploy zero-config na **Vercel** (mesma estratégia planejada para o vullz-control): detecta Vite automaticamente, builda com `npm run build` e serve `dist/`. Para publicar em `vullzbikes.com.br`:

1. Subir este projeto para um repositório Git (GitHub/GitLab).
2. Importar o repositório na Vercel.
3. Apontar o domínio `vullzbikes.com.br` para o projeto na Vercel (registro CNAME/A conforme instruções da própria Vercel).

## Escalabilidade futura

Novas seções institucionais (Institucional, Produtos, Peças, Assistência Técnica, Garantia, Revendedores, Contato) podem ser adicionadas como novas páginas Vite (novos `.html` na raiz como entry points) reaproveitando os componentes e tokens de marca já existentes em `src/`.
