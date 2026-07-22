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
