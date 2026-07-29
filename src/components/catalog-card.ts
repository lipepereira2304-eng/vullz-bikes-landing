export interface CatalogCardOptions {
  title: string;
  /*
    Texto complementar, menor, numa linha própria logo abaixo do título — caso
    da Bicicletas (Catálogo PDF): "(Catálogo PDF)" no tamanho cheio do título
    quebrava em duas linhas dentro do card (que é estreito, um de três numa
    grade), deixando esse card com três linhas de título contra uma dos outros
    dois. `block` (e não deixar o texto seguir corrido depois do título) é o
    que garante a quebra SEMPRE depois de "Bicicletas", não só quando o texto
    não coubesse mais na mesma linha.
  */
  subtitle?: string;
  href: string;
  /** Posição do card na sequência de entrada. O intervalo é o `--stagger`. */
  revealStep: number;
  newTab?: boolean;
  linkLabel?: string;
}

export function catalogCardMarkup({
  title,
  subtitle,
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
      class="group relative flex w-full flex-col items-start justify-center gap-6 rounded-[28px] border border-vullz-gray-200 bg-vullz-gray-50 p-10 text-left btn-motion hover:-translate-y-[var(--shift-sm)] hover:border-vullz-black hover:bg-vullz-gray-100 hover:shadow-[0_0_80px_-16px_rgba(17,17,17,0.18)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-yellow focus-visible:ring-offset-2 sm:p-12 sm:min-h-[220px]"
    >
      <h3 class="text-balance text-3xl font-extrabold tracking-tight text-vullz-black sm:text-4xl">
        ${title}${subtitle ? /* html */ `<span class="block text-lg sm:text-xl">${subtitle}</span>` : ""}
      </h3>

      <span class="inline-flex items-center gap-2 text-sm font-semibold text-vullz-black">
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
