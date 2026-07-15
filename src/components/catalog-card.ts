export interface CatalogCardOptions {
  title: string;
  href: string;
  delayMs: number;
  newTab?: boolean;
  linkLabel?: string;
}

export function catalogCardMarkup({
  title,
  href,
  delayMs,
  newTab = true,
  linkLabel = "Acessar catálogo",
}: CatalogCardOptions): string {
  const targetAttrs = newTab ? `target="_blank" rel="noopener noreferrer"` : "";

  return /* html */ `
    <a
      href="${href}"
      ${targetAttrs}
      data-reveal
      class="group relative flex w-full flex-col items-start justify-center gap-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-left backdrop-blur-xl transition-[transform,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[${delayMs}ms] hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_24px_48px_-24px_rgba(245,197,24,0.22)] active:translate-y-0 active:scale-[0.985] active:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-vullz-graphite sm:p-12 sm:min-h-[220px]"
    >
      <h3 class="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">${title}</h3>

      <span
        class="inline-flex items-center gap-2 text-sm font-semibold text-vullz-yellow transition-[gap,color] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:gap-3.5"
      >
        ${linkLabel}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5"
        >
          <path d="M3.5 8H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M8.5 3.5L13 8L8.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>

      <span
        class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-vullz-yellow/10 opacity-0 blur-3xl transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
        aria-hidden="true"
      ></span>
    </a>
  `;
}
