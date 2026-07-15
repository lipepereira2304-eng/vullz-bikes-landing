# Prompt para Claude Code (usar modelo Opus)

Cole o texto abaixo inteiro no Claude Code, dentro da pasta do projeto
(`/Applications/vullz-bikes-landing`), depois de ativar o modelo Opus.

---

Este é um projeto Vite + TypeScript + Tailwind CSS v4 (sem framework, HTML
gerado via template strings em `src/scripts/main.ts` e componentes em
`src/components/*.ts`). É a landing page de catálogo digital da Vullz Bikes,
publicada em produção na Vercel (vullzbikes.com.br), conectada a um repo no
GitHub via git remoto SSH.

## Contexto do que já foi feito

1. Favicon: recortei o "V" estilizado da logo (`src/assets/images/vullz-logo.png`,
   bounding box aproximado rows 0-320, cols 200-717 do PNG original) e apliquei
   como ícone em `public/favicon.svg` (SVG com `<image>` embutido em base64,
   512x512, fundo grafite `#111111` arredondado) e `public/apple-touch-icon.png`
   (180x180, mesmo design). Também corrigi um segundo ícone que estava
   escondido dentro de `public/em-breve.html` (um `<svg>` com um V genérico
   desenhado à mão) — troquei pelo mesmo PNG em base64.

2. Bug de animação identificado e corrigido: havia uma regra `[data-reveal]`
   em `src/styles/main.css` declarada **fora de qualquer `@layer`**. Em CSS
   moderno (cascade layers), qualquer regra sem `@layer` sempre vence
   qualquer regra dentro de `@layer` (Tailwind gera utilitários dentro de
   `@layer utilities`), não importa a especificidade. Isso fazia o
   `transition-property` dessa regra global (só `opacity, transform`)
   sequestrar silenciosamente as transições de hover dos cards (que
   precisavam também de `background-color`, `border-color`, `box-shadow`).
   Corrigi movendo a regra pra dentro de `@layer components` em
   `src/styles/main.css`, e ajustei `src/components/catalog-card.ts` pra
   declarar a lista completa de propriedades
   (`transition-[opacity,transform,background-color,border-color,box-shadow]`)
   com duração `duration-[750ms]` e easing `ease-[cubic-bezier(0.16,1,0.3,1)]`.

3. Também descobri que `delay-[${delayMs}ms]` (classe Tailwind com valor
   interpolado dinamicamente via template string JS) nunca funcionava — o
   scanner do Tailwind não consegue extrair valores de expressões JS em
   tempo de build. Troquei para `style="transition-delay:${delayMs}ms"`
   (inline style) nos cards, que funciona de forma confiável.

4. Verifiquei via JavaScript (`getComputedStyle`) rodando direto no site
   publicado que o `transitionProperty`, `transitionDuration`,
   `transitionDelay` e `transitionTimingFunction` finais estão corretos.
   O usuário, porém, continua percebendo as animações como "travadas" mesmo
   depois do deploy — hipótese mais provável é cache de navegador (favicon
   principalmente é cacheado de forma muito agressiva por navegadores/celulares),
   mas pode haver algo mais sutil que não percebi. **Não assuma que já está
   tudo certo só porque o CSS computado bate — teste de fato no navegador,
   force reload sem cache, e avalie com olhos críticos se a sensação de
   suavidade realmente corresponde ao que foi pedido.**

## O que fazer agora

1. **Revalide tudo do zero, com ceticismo.** Rode `npm run build` e
   `npm run preview` (ou `npm run dev`), abra no navegador, force um hard
   reload (Cmd+Shift+R) e teste manualmente: hover nos cards de "Bicicletas"
   e "Elétricos", clique nos botões de WhatsApp/Instagram, veja a página
   `/em-breve.html`. Confirme visualmente que:
   - O favicon (aba do navegador, favoritos) mostra o V estilizado da marca,
     não um ícone genérico.
   - Ao carregar a página, o conteúdo aparece com fade + leve deslocamento
     vertical suave (não instantâneo, não "pulando").
   - Ao passar o mouse sobre os cards de catálogo, eles sobem levemente,
     ganham uma sombra amarela suave, e tudo isso transiciona suavemente
     (nada "pisca" ou muda instantaneamente).

2. **Se ainda sentir que as animações estão rígidas/mecânicas**, considere:
   - Aumentar ainda mais a duração (testar 900ms-1000ms para entrada).
   - Revisar se existe algum outro CSS/JS no projeto que force
     `transition: none` ou reset em algum momento (procure por
     `prefers-reduced-motion`, `will-change`, ou qualquer JS que manipule
     classes de forma abrupta).
   - Verificar se o `IntersectionObserver` em `src/scripts/animations.ts`
     está disparando a tempo (pode haver flash-of-unstyled-content se o CSS
     carrega depois do primeiro paint).
   - Considerar adicionar cache-busting no favicon (ex.: renomear para
     `favicon.svg?v=2` nos links do `index.html`, ou versionar o nome do
     arquivo) já que favicons são notoriamente difíceis de invalidar em cache
     de navegador — isso pode ser a causa raiz do usuário ainda ver o ícone
     antigo mesmo com o deploy correto.

3. **Ajustes de conteúdo pendentes** (podem já estar corrigidos numa sessão
   anterior — confirme lendo os arquivos antes de mexer):
   - `public/em-breve.html`: o texto "EM BREVE..." deveria estar inteiro na
     mesma cor (branco, sem destaque amarelo nas reticências) e as
     reticências "..." menores que o resto do texto.

4. **Faça uma revisão de qualidade geral** em cima de tudo: espaçamento,
   tipografia, proporções, consistência de easing/duração entre todos os
   elementos interativos da página (cards, botões de WhatsApp/Instagram,
   página em-breve). O objetivo é uma landing page com sensação de produto
   finalizado e premium (referências: Stripe, Linear, Apple, Nothing), não
   de protótipo.

5. Depois de qualquer mudança, rode `npx tsc --noEmit` para garantir que não
   quebrou tipagem, e `git status` antes de commitar pra conferir exatamente
   o que está sendo enviado (o usuário já teve pelo menos um caso de token
   sensível colado sem querer no chat — cuidado redobrado pra não commitar
   nada sensível).

6. Ao final, rode `git add -A && git commit -m "..." && git push origin main`
   você mesmo (você tem acesso direto ao terminal, diferente da sessão
   anterior que precisava pedir pro usuário colar comandos manualmente).
   O deploy na Vercel é automático a cada push na branch `main`.
