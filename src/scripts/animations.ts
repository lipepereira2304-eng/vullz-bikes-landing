/*
  Rede de segurança, não sincronia: é só um teto folgado acima de qualquer
  duração+delay de entrada plausível. Deliberadamente não espelha os valores do
  CSS — se espelhasse, mexer na duração lá silenciosamente quebraria o fallback
  aqui. O que importa é que uma hora libere; o valor exato, não.
*/
const REVEAL_FALLBACK_MS = 3000;

/*
  Faxina de fim de entrada. Três coisas que só valem durante a animação de
  entrada e viram problema se ficarem:

  1. `will-change` (vem do CSS): prepara uma camada de composição antes da
     animação. Mantê-lo depois prende o elemento numa camada para sempre,
     gastando memória de GPU à toa.
  2. `transition-delay` (vem do stagger inline): escalona a entrada. Depois dela
     o delay continua valendo para TODA transição do elemento — inclusive hover.
     Sem remover, o botão fica até 360ms imóvel após o cursor chegar antes de
     começar a subir. Precisa ser removido aqui, no inline: qualquer tentativa de
     zerar por CSS perde para o style inline.
  3. `transition` (posta por `startReveal`, ver abaixo): a transição de ENTRADA
     inteira. Depois dela, o elemento precisa voltar à transição que o CSS
     define para ele — hover, coreografia de layout, o que for.
*/
function finishReveal(el: HTMLElement): void {
  el.style.willChange = "auto";
  el.style.transitionDelay = "0s";
  el.style.transition = "";
}

/*
  Impõe a transição de entrada COMPLETA no momento exato em que a entrada
  começa — propriedades, duração e curva.

  Por que em JS e não no CSS: um elemento com [data-reveal] quase sempre também
  tem outra regra de transição mirando nele, e [data-reveal] perde para todas.
  Perde para as utilities (`btn-motion` e companhia vivem em @layer utilities,
  que sempre vence @layer components) e empata com as regras de componente da
  mesma camada, onde a ordem do arquivo decide — frágil. Já aconteceu duas
  vezes: os cards da home entrando na duração de hover (220ms em vez de 700ms),
  e a coreografia da ficha técnica trocando a `transition-property` do
  `stage-section` por uma lista sem `transform`, o que fazia a entrada dele
  saltar em vez de deslizar.

  Declarar a transição inteira inline resolve a família toda de uma vez: style
  inline vence qualquer camada, então a entrada fica imune ao que qualquer
  regra futura declare para o mesmo elemento. Os VALORES continuam no CSS — o
  que vai inline são referências a token, não números.

  E some no fim da entrada junto com o resto da faxina, devolvendo o elemento
  à transição que o CSS quiser dar a ele.
*/
const ENTRANCE_TRANSITION =
  "opacity var(--duration-entrance) var(--ease-glide), transform var(--duration-entrance) var(--ease-glide)";

function startReveal(el: HTMLElement): void {
  el.style.transition = ENTRANCE_TRANSITION;
  el.classList.add("is-visible");
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
        startReveal(el);
        observer.unobserve(el);
        releaseAfterReveal(el);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}
