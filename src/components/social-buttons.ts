export interface SocialButtonsOptions {
  whatsappNumber: string;
  whatsappMessage?: string;
  instagramHandle: string;
  delayMs: number;
}

/*
  `btn-motion` carrega a mesma linguagem de movimento dos cards (ver main.css), e
  o glow é um halo externo (box-shadow, que por especificação só pinta fora da
  borda — nunca por baixo do botão). Branco e discreto de propósito: o amarelo
  é a cor de marca, não um efeito de hover — reservá-la para logo/foco evita que
  a interface pisque amarelo toda vez que o cursor passa por cima de algo.
*/
const BASE_BUTTON_CLASSES =
  "group inline-flex flex-1 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white btn-motion hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07] hover:shadow-[0_0_55px_-14px_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-[0.985] active:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vullz-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-vullz-graphite sm:text-base";

export function socialButtonsMarkup({
  whatsappNumber,
  whatsappMessage = "Olá! Vi o catálogo da Vullz e queria saber mais.",
  instagramHandle,
  delayMs,
}: SocialButtonsOptions): string {
  const digits = whatsappNumber.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage)}`;
  const instagramHref = `https://www.instagram.com/${instagramHandle.replace(/^@/, "")}/`;

  return /* html */ `
    <div class="flex w-full max-w-3xl gap-4" data-reveal>
      <a
        href="${whatsappHref}"
        target="_blank"
        rel="noopener noreferrer"
        class="${BASE_BUTTON_CLASSES}"
        style="transition-delay:${delayMs}ms"
        aria-label="Falar no WhatsApp"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          class="text-[#25D366] transition-transform duration-[var(--dur-hover)] ease-lift group-hover:scale-110"
          aria-hidden="true"
        >
          <path
            d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.28-1.38a9.9 9.9 0 0 0 4.7 1.2h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.35c0-4.53 3.7-8.22 8.25-8.22 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.53-3.7 8.2-8.24 8.2Zm4.52-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.24-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.73 2.65 4.2 3.71.59.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z"
          />
        </svg>
        WhatsApp
      </a>

      <a
        href="${instagramHref}"
        target="_blank"
        rel="noopener noreferrer"
        class="${BASE_BUTTON_CLASSES}"
        style="transition-delay:${delayMs + 60}ms"
        aria-label="Seguir no Instagram"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="transition-transform duration-[var(--dur-hover)] ease-lift group-hover:scale-110"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="#E1306C" stroke-width="1.6" />
          <circle cx="12" cy="12" r="4.2" stroke="#E1306C" stroke-width="1.6" />
          <circle cx="17.15" cy="6.85" r="1.1" fill="#E1306C" />
        </svg>
        Instagram
      </a>
    </div>
  `;
}
