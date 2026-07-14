export interface CatalogCardOptions {
  title: string;
  href: string;
  delayMs: number;
}

export function catalogCardMarkup({ title, href, delayMs }: CatalogCardOptions): string {
  return /* html */ `
    <a
      href="${href}"
      target="_blank"
      rel="noopener noreferrer"
      data-reveal
      class="group relative flex w-full flex-col items-start justify-center gap-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-left backdrop-blur-xl transition-all duration-300 ease-out delay-[${delayMs}ms] hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/[0.06] sm:p-12 sm:min-h-[220px]"
    >
      <h3 class="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">${title}</h3>

      <span
        class="inline-flex items-center gap-2 text-sm font-semibold text-vullz-yellow transition-all duration-200 group-hover:gap-3"
      >
        Acessar catálogo
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 8H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M8.5 3.5L13 8L8.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>

      <span
        class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-vullz-yellow/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      ></span>
    </a>
  `;
}
