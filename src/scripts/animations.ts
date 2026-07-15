/*
  `[data-reveal]` declara `will-change: opacity, transform` para que o navegador
  prepare uma camada antes da animação de entrada. Isso só faz sentido enquanto
  a animação acontece: mantê-lo depois prende cada elemento numa camada de
  composição para sempre, gastando memória de GPU à toa. Como a entrada roda uma
  única vez, liberamos assim que a transição termina.
*/
const REVEAL_MS = 750;
const REVEAL_MAX_DELAY_MS = 500;

function releaseWillChange(el: HTMLElement): void {
  el.style.willChange = "auto";
}

/*
  Solta o `will-change` no fim da transição — com fallback por tempo porque
  `transitionend` não é garantido: se o elemento é revelado com a aba em segundo
  plano, o navegador não renderiza, a transição nunca roda e o evento nunca
  dispara, deixando o elemento promovido a camada para sempre.
*/
function releaseAfterReveal(el: HTMLElement): void {
  const timer = window.setTimeout(() => releaseWillChange(el), REVEAL_MS + REVEAL_MAX_DELAY_MS + 100);

  el.addEventListener(
    "transitionend",
    () => {
      window.clearTimeout(timer);
      releaseWillChange(el);
    },
    { once: true }
  );
}

export function initRevealOnScroll(): void {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => {
      el.classList.add("is-visible");
      releaseWillChange(el);
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const el = entry.target as HTMLElement;
        el.classList.add("is-visible");
        observer.unobserve(el);
        releaseAfterReveal(el);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}
