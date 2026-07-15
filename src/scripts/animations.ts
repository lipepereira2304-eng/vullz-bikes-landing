/*
  Rede de segurança, não sincronia: é só um teto folgado acima de qualquer
  duração+delay de entrada plausível. Deliberadamente não espelha os valores do
  CSS — se espelhasse, mexer na duração lá silenciosamente quebraria o fallback
  aqui. O que importa é que uma hora libere; o valor exato, não.
*/
const REVEAL_FALLBACK_MS = 3000;

/*
  Faxina de fim de entrada. Duas coisas que só valem durante a animação de
  entrada e viram problema se ficarem:

  1. `will-change` (vem do CSS): prepara uma camada de composição antes da
     animação. Mantê-lo depois prende o elemento numa camada para sempre,
     gastando memória de GPU à toa.
  2. `transition-delay` (vem do stagger inline): escalona a entrada. Depois dela
     o delay continua valendo para TODA transição do elemento — inclusive hover.
     Sem remover, o botão fica 220-440ms imóvel após o cursor chegar antes de
     começar a subir. Precisa ser removido aqui, no inline: qualquer tentativa de
     zerar por CSS perde para o style inline.
*/
function finishReveal(el: HTMLElement): void {
  el.style.willChange = "auto";
  el.style.transitionDelay = "0s";
}

/*
  Roda a faxina no fim da transição — com fallback por tempo porque
  `transitionend` não é garantido: se o elemento é revelado com a aba em segundo
  plano, o navegador não renderiza, a transição nunca roda e o evento nunca
  dispara, deixando a limpeza por fazer.
*/
function releaseAfterReveal(el: HTMLElement): void {
  const timer = window.setTimeout(() => finishReveal(el), REVEAL_FALLBACK_MS);

  el.addEventListener(
    "transitionend",
    () => {
      window.clearTimeout(timer);
      finishReveal(el);
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
      finishReveal(el);
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
