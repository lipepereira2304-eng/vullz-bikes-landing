export interface CatalogCardOptions {
  title: string;
  href: string;
  /** Posição do card na sequência de entrada. O intervalo é o `--stagger`. */
  revealStep: number;
  newTab?: boolean;
  linkLabel?: string;
}

export function catalogCardMarkup({
  title,
  href,
  revealStep,
  newTab = true,
  linkLabel = "Acessar catálogo",
}: CatalogCardOptions): string {
  const targetAttrs = newTab ? `target="_blank" rel="noopener noreferrer"` : "";

  return /* html */ `
    <a
      href="${href}"
      ${targetAttrs}
      data-reveal
      style="transition-delay:calc(var(--stagger) * ${revealStep})"
      class="group relative flex w-full flex-col items-start justify-center gap-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-left btn-motion hover:-translate-y-[var(--shift-sm)] hover:border-white/25 hover:bg-white/[0.06] hover:shadow-[0_0_80px_-16px_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-vullz-graphite sm:p-12 sm:min-h-[220px]"
    >
      <h3 class="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">${title}</h3>

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
