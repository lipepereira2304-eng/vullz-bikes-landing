# Prompt para Claude Code (usar modelo Opus)

Cole o texto abaixo inteiro no Claude Code, dentro da pasta do projeto
(`/Applications/vullz-bikes-landing`), depois de ativar o modelo Opus. Pode
colar na mesma janela/contexto que já vinha sendo usado neste projeto — é
só texto de instrução, não gera conflito. Só rode `git status` e `git pull`
antes, pra garantir que está enxergando os commits mais recentes.

---

Este é um projeto Vite + TypeScript + Tailwind CSS v4 (sem framework, HTML
gerado via template strings em `src/scripts/main.ts` e componentes em
`src/components/*.ts`). É a landing page de catálogo digital da Vullz Bikes,
publicada em produção na Vercel (vullzbikes.com.br), conectada a um repo no
GitHub via git remoto SSH. Deploy é automático a cada push na branch `main`.

## PRIORIDADE MÁXIMA: investigar lentidão real de performance

O usuário reportou que o site "parece lento" e as animações "travadas" —
mas ele mesmo suspeita agora que não é sobre easing/duração de CSS, e sim
sobre **performance real de renderização**, testando no computador (ainda
não testou no celular). Ele quer uma varredura completa: identifique e
corrija (ou aponte, se não tiver certeza) qualquer imperfeição de
performance ou qualidade que encontrar.

**Suspeita principal, já levantada (mas não comprovada — valide com
profiling antes de mexer):** `src/components/fluid-background.ts` renderiza
um `<svg>` de fundo com 4 elipses grandes dentro de um `<g filter="url(#blob-blur)">`
usando `<feGaussianBlur stdDeviation="80" />` — um blur muito pesado —
combinado com `mix-blend-screen`, e essas elipses são animadas via CSS em
loop infinito (`animate-blob-a/b/c`, 22-32s cada, ver `@keyframes` em
`src/styles/main.css`). Por cima disso, os cards de catálogo (
`src/components/catalog-card.ts`) e os botões de WhatsApp/Instagram
(`src/components/social-buttons.ts`) usam `backdrop-blur-xl`, que precisa
recalcular constantemente o que está atrás — e o que está atrás é esse
blur SVG animado sem parar. Essa combinação (filtro SVG pesado + animação
infinita + backdrop-filter por cima) é um padrão clássico de jank/lentidão
contínua em navegadores, mesmo em páginas "paradas".

Passos sugeridos:

1. Abra o site localmente (`npm run dev`) e no Chrome DevTools, aba
   **Performance**, grave um perfil de ~5s parado na página (sem interagir)
   e outro fazendo hover nos cards. Veja se o uso de CPU/GPU está alto de
   forma contínua e se há frames longos (jank) durante o hover.
2. Se confirmar que o fundo animado é o problema, considere:
   - Reduzir drasticamente o `stdDeviation` do blur (ex.: de 80 para 30-40).
   - Trocar o blur SVG ao vivo por uma imagem estática pré-borrada (PNG/WebP
     exportada já com o blur "assado"), animando só `transform`/`opacity`
     dessa imagem em vez de recalcular blur a cada frame.
   - Remover ou aliviar o `mix-blend-screen`.
   - Reduzir ou remover o `backdrop-blur-xl` dos cards/botões (ou trocar por
     um `background-color` sólido com leve transparência, sem blur).
   - Pausar as animações de blob quando a aba não está visível
     (`document.visibilityState`) ou usar `prefers-reduced-motion` com mais
     rigor.
3. Meça de novo depois da mudança pra confirmar que realmente melhorou
   (não assuma — compare os perfis antes/depois).

## Contexto do que já foi feito nesta pasta (histórico, pra não repetir trabalho)

1. **Favicon**: troquei o V genérico por um recorte real do V estilizado da
   logo (`src/assets/images/vullz-logo.png`) em `public/favicon.svg` e
   `public/apple-touch-icon.png` (SVG com `<image>` base64 embutido, PNG
   180x180). Também havia um segundo ícone escondido em
   `public/em-breve.html` com um V genérico desenhado à mão — troquei pelo
   mesmo PNG em base64. **Confirmado publicado em produção** via fetch
   direto do arquivo servido pela Vercel — se o usuário ainda estiver vendo
   o ícone antigo, é cache de navegador, não código. Ainda assim, pode valer
   adicionar cache-busting (versionar o nome do arquivo, ex. `favicon.svg?v=2`
   nos `<link>` do `index.html`) já que favicons são notoriamente difíceis
   de invalidar em cache de navegador/celular.

2. **Bug de cascade layer corrigido**: havia uma regra `[data-reveal]` em
   `src/styles/main.css` declarada fora de qualquer `@layer`. Regras sem
   `@layer` sempre vencem regras dentro de `@layer` (Tailwind gera
   utilitários em `@layer utilities`), então essa regra global sequestrava
   silenciosamente o `transition-property` dos cards, cancelando as
   transições de hover (background, borda, sombra mudavam instantaneamente,
   sem suavização). Corrigido movendo pra `@layer components`, e os cards
   agora declaram a lista completa de propriedades em
   `transition-[opacity,transform,background-color,border-color,box-shadow]`
   com `duration-[750ms]` e `ease-[cubic-bezier(0.16,1,0.3,1)]`. Também troquei
   `delay-[${delayMs}ms]` (classe Tailwind com valor JS interpolado, que
   nunca compilava) por `style="transition-delay:${delayMs}ms"` inline.
   **Verificado via `getComputedStyle` direto no site publicado** — os
   valores finais batem com o esperado.

3. **`public/em-breve.html`**: já corrigido — "EM BREVE..." numa cor só
   (branco), reticências menores (`font-size: 0.55em` no `span`).

## O que fazer

1. Foque primeiro na investigação de performance descrita acima — é a
   prioridade do usuário agora.
2. Depois, faça uma varredura geral de qualidade: espaçamento, tipografia,
   proporções, consistência de easing/duração entre todos os elementos
   interativos (cards, botões sociais, página em-breve), acessibilidade
   (contraste, foco visível, `prefers-reduced-motion`). Corrija o que puder
   com segurança; aponte em texto o que for subjetivo/precisar de decisão do
   usuário.
3. Rode `npx tsc --noEmit` depois de qualquer mudança em `.ts`.
4. Confira `git status` antes de commitar (o usuário já colou um token por
   engano no chat uma vez — redobre o cuidado pra não commitar nada
   sensível, tipo chaves ou tokens, mesmo que venham em arquivos novos).
5. Você tem acesso direto ao terminal aqui — pode rodar
   `git add -A && git commit -m "..." && git push origin main` você mesmo.
   O deploy na Vercel acontece automaticamente a cada push em `main`.
