# Vullz Bikes — Catálogo Digital

Landing page premium que serve de porta de entrada para o catálogo digital da Vullz Bikes, acessada principalmente via QR Code impresso. Base do futuro site institucional.

## Stack

- **Vite + TypeScript** (vanilla, sem framework de UI) — página essencialmente estática, mantém o JS de runtime mínimo para carregamento instantâneo no celular.
- **Tailwind CSS v4** (CSS-first via `@theme` em `src/styles/main.css`, sem `tailwind.config.js`).
- Background fluido 100% vetorial (SVG + `blur` + animação CSS), sem imagens pesadas ou libs de canvas.

## Estrutura

```
public/            → assets estáticos servidos como estão (favicon, manifest, robots.txt)
  catalogos/        → coloque aqui os PDFs finais: bicicletas.pdf e eletricos.pdf
src/
  assets/images/    → imagens otimizadas do projeto (hoje vazio)
  components/       → módulos TS que retornam markup (hero, cards, ícones, background)
  scripts/          → main.ts (monta a página) e animations.ts (reveal on scroll)
  styles/           → main.css (tokens de marca + estilos base)
```

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
