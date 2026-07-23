/*
  Crossfade do palco (a foto grande do produto).

  Crossfade de verdade: a camada nova nasce por cima (opacity 0) e sobe pra 1
  enquanto QUALQUER camada anterior desce pra 0 ao mesmo tempo — as duas ficam
  visíveis e se misturando durante a transição inteira. Uma versão anterior
  escondia a foto (opacity 0), só então trocava o conteúdo por baixo e
  reaparecia: isso cria um instante em que nada aparece, e mesmo rápido aquele
  "nada" lê como um flash/pisca, não como uma dissolução suave. Com duas
  camadas sobrepostas nunca existe esse vazio.

  Duas velocidades, de propósito:
  - "color": `--duration-base`, linear, sem deslocamento — troca de cor, que
    precisa ficar quase imperceptível (só a cor registra). Linear é a única
    exceção de curva do projeto, e por um motivo: numa dissolução pura, sem
    nada se deslocando, uma curva com desaceleração segura a imagem antiga no
    fim e as duas fotos convivem tempo demais.
  - "model": `--duration-entrance`, com a mesma curva e o mesmo deslocamento
    vertical do [data-reveal] da home — clicar num modelo novo é literalmente
    uma entrada de conteúdo, então usa a linguagem de entrada.

  Os tempos e as curvas moram em main.css (`stage-fade-*`), não aqui. Enquanto
  eram strings de `transition` montadas neste arquivo, este era o único ponto do
  site que podia divergir dos tokens sem ninguém perceber.
*/

export type StageTransition = "model" | "color";

/*
  Rede de segurança para remover as camadas antigas, no mesmo espírito do
  fallback de animations.ts: um teto folgado acima de qualquer duração
  plausível, deliberadamente sem espelhar os valores do CSS. Quem manda é o
  `transitionend`; isto só existe porque ele não dispara se a aba estiver em
  segundo plano — sem renderização, não há transição.
*/
const CLEANUP_FALLBACK_MS = 2000;

export function paintStage(container: HTMLElement, innerHtml: string, kind: StageTransition): void {
  const isModel = kind === "model";
  const fadeClass = isModel ? "stage-fade-model" : "stage-fade-color";

  const layer = document.createElement("div");
  layer.className = `absolute inset-0 flex items-center justify-center ${fadeClass}`;
  layer.style.opacity = "0";
  if (isModel) layer.style.transform = "translateY(var(--shift-md))";
  layer.innerHTML = innerHtml;
  container.appendChild(layer);

  const previousLayers = Array.from(container.children).filter(
    (el): el is HTMLElement => el !== layer
  );

  // Força o navegador a "commitar" o opacity:0 antes de animar — senão ele
  // agrupa criação + transição no mesmo frame e a transição não roda.
  void layer.offsetHeight;

  const removePrevious = (): void => previousLayers.forEach((el) => el.remove());
  const timer = window.setTimeout(removePrevious, CLEANUP_FALLBACK_MS);

  requestAnimationFrame(() => {
    layer.style.opacity = "1";
    if (isModel) layer.style.transform = "translateY(0)";

    /*
      As camadas que saem desvanecem recebendo a MESMA classe de quem entra, em
      vez de uma `transition` própria montada aqui: é o que garante que as duas
      pontas do crossfade não possam desandar uma da outra.
    */
    previousLayers.forEach((el) => {
      el.classList.add(fadeClass);
      el.style.opacity = "0";
    });

    layer.addEventListener(
      "transitionend",
      () => {
        window.clearTimeout(timer);
        removePrevious();
      },
      { once: true }
    );
  });
}
