export interface CatalogCardOptions {
  title: string;
  /*
    Texto complementar, menor, numa linha própria logo abaixo do título — caso
    do card "Catálogo PDF" / "(Bicicletas)": as duas linhas no tamanho cheio do
    título quebrariam feio dentro do card (que é estreito, um de três numa
    grade). `block` (e não deixar o texto seguir corrido depois do título) é o
    que garante a quebra SEMPRE no mesmo lugar, não só quando o texto não
    coubesse mais na mesma linha.
  */
  subtitle?: string;
  href: string;
  /** Posição do card na sequência de entrada. O intervalo é o `--stagger`. */
  revealStep: number;
  newTab?: boolean;
  linkLabel?: string;
  /*
    Quando presente, o card deixa de ser um único link cobrindo tudo e passa a
    ter DOIS botões lado a lado por baixo do título: um pra visualizar (mesmo
    `href`/comportamento de sempre) e um exclusivo pra baixar (atributo
    `download`, que faz o navegador salvar o arquivo em vez de navegar até
    ele). Pedido explícito só pro card do PDF — os outros cards continuam como
    um card inteiro clicável.
  */
  download?: { href: string; label?: string };
}

/*
  De propósito SEM `flex-1`/`w-full`: "Visualizar" e "Baixar" têm rótulos de
  tamanhos bem diferentes, e forçar os dois a dividir o espaço em fatias
  iguais (flex-1) faz o mais largo estourar pra fora do card — cada botão
  fica do tamanho do próprio conteúdo, e é a LINHA (abaixo) que centraliza o
  par como bloco.
*/
const ACTION_BUTTON_CLASSES =
  "group/btn inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold btn-motion hover:-translate-y-[var(--shift-sm)] hover:border-white/25 hover:bg-white/[0.08] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-vullz-graphite";

export function catalogCardMarkup({
  title,
  subtitle,
  href,
  revealStep,
  newTab = true,
  linkLabel = "Acessar catálogo",
  download,
}: CatalogCardOptions): string {
  const targetAttrs = newTab ? `target="_blank" rel="noopener noreferrer"` : "";

  if (download) {
    return /* html */ `
      <div
        data-reveal
        style="transition-delay:calc(var(--stagger) * ${revealStep})"
        class="flex w-full flex-col items-start justify-center gap-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-left sm:min-h-[220px]"
      >
        <h3 class="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          ${title}${subtitle ? /* html */ `<span class="block text-lg sm:text-xl">${subtitle}</span>` : ""}
        </h3>

        <div class="flex w-full flex-wrap items-stretch justify-center gap-2">
          <a href="${href}" ${targetAttrs} class="${ACTION_BUTTON_CLASSES} text-vullz-yellow">
            ${linkLabel}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="btn-motion group-hover/btn:translate-x-[var(--shift-sm)]"
            >
              <path d="M3.5 8H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M8.5 3.5L13 8L8.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>

          <!--
            O PDF tem ~20 MB: no celular, entre o toque e o arquivo salvo
            passam vários segundos, e antes nada na tela mudava nesse meio
            tempo — parecia que o botão não funcionava. Agora o próprio botão
            mostra o andamento (ver o handler de [data-force-download] em
            main.ts): uma faixa preenche da esquerda pra direita conforme o
            arquivo chega, com a porcentagem no lugar do rótulo, e no fim
            "Pronto" com um ✓ por um instante.

            Os três rótulos (e os dois ícones) ficam EMPILHADOS na mesma
            célula de grid, só um visível por vez: a largura do botão é a do
            maior deles e nunca muda entre estados — senão o "Visualizar" ao
            lado seria empurrado a cada porcentagem nova.
          -->
          <a
            href="${download.href}"
            download
            data-force-download
            data-state="idle"
            class="${ACTION_BUTTON_CLASSES} relative overflow-hidden text-vullz-yellow"
          >
            <span data-role="download-fill" aria-hidden="true" class="download-fill"></span>
            <span class="download-stack">
              <span data-when="idle">${download.label ?? "Baixar"}</span>
              <span data-when="loading" data-role="download-percent" class="tabular-nums">0%</span>
              <span data-when="done">Pronto</span>
            </span>
            <span class="download-stack">
              <svg
                data-when="idle loading"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="btn-motion group-hover/btn:translate-y-[var(--shift-sm)]"
              >
                <path d="M8 2.5V10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path d="M4.5 7.5L8 11L11.5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2.5 13.5H13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              <svg data-when="done" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span data-role="download-status" class="sr-only" aria-live="polite"></span>
          </a>
        </div>
      </div>
    `;
  }

  return /* html */ `
    <a
      href="${href}"
      ${targetAttrs}
      data-reveal
      style="transition-delay:calc(var(--stagger) * ${revealStep})"
      class="group relative flex w-full flex-col items-start justify-center gap-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-left btn-motion hover:-translate-y-[var(--shift-sm)] hover:border-white/25 hover:bg-white/[0.06] hover:shadow-[0_0_80px_-16px_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-vullz-graphite sm:p-12 sm:min-h-[220px]"
    >
      <h3 class="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        ${title}${subtitle ? /* html */ `<span class="block text-lg sm:text-xl">${subtitle}</span>` : ""}
      </h3>

      <span class="inline-flex items-center gap-2 text-sm font-semibold text-vullz-yellow">
        ${linkLabel}
        <!--
          A seta avança sozinha, por transform. Antes quem a empurrava era o
          gap do span crescendo de 8px para 14px: mesmo deslocamento, só que
          animando uma propriedade de layout — o navegador recalculava a posição
          do texto a cada quadro do hover. translate-x percorre a mesma
          distância no compositor, sem tocar no layout.

          Usa btn-motion (o mesmo do card) de propósito: a seta não é um efeito
          próprio, é o card se movendo.
        -->
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="btn-motion group-hover:translate-x-[var(--shift-sm)]"
        >
          <path d="M3.5 8H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M8.5 3.5L13 8L8.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>

    </a>
  `;
}
