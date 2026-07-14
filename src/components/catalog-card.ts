export interface CatalogCardOptions {
  icon: string;
  title: string;
  description: string;
  href: string;
  delayMs: number;
}

export function catalogCardMarkup({ icon, title, description, href, delayMs }: CatalogCardOptions): string {
  return /* html */ `
    <a
      href="${href}"
      target="_blank"
      rel="noopener noreferrer"
      data-reveal
      style="transition-delay:${delayMs}ms"
      class="group relative flex w-full flex-col items-start gap-5 overflow-hidden rounded-[28px] border border-black/5 bg-white/70 p-8 text-left shadow-[0_1px_2px_rgba(17,17,17,0.04),0_20px_45px_-20px_rgba(17,17,17,0.18)] backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_1px_2px_rgba(17,17,17,0.06),0_30px_60px_-20px_rgba(17,17,17,0.22)] sm:p-10"
    >
      <span
        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-vullz-black text-vullz-yellow transition-transform duration-500 ease-out group-hover:scale-105"
        aria-hidden="true"
        >${icon}</span
      >

      <div class="flex flex-col gap-2">
        <h3 class="text-xl font-semibold tracking-tight text-vullz-black sm:text-2xl">${title}</h3>
        <p class="text-sm leading-relaxed text-vullz-gray-700 sm:text-base">${description}</p>
      </div>

      <span
        class="mt-2 inline-flex items-center gap-2 text-sm font-medium text-vullz-black transition-all duration-300 group-hover:gap-3"
      >
        Acessar catálogo
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 8H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M8.5 3.5L13 8L8.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>

      <span
        class="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-vullz-yellow/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0"
        aria-hidden="true"
      ></span>
    </a>
  `;
}
