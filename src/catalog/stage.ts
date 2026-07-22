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
  - "color": rápida (220ms, linear, sem deslocamento) — troca de cor, que
    precisa ficar quase imperceptível (só a cor registra).
  - "model": lenta (900ms, mesma curva e deslocamento vertical do
    [data-reveal] da home) — clicar num modelo novo merece uma entrada suave
    e deliberada, não uma troca instantânea.
*/

export type StageTransition = "model" | "color";

const COLOR_FADE_MS = 220;
const MODEL_FADE_MS = 900;

export function paintStage(container: HTMLElement, innerHtml: string, kind: StageTransition): void {
  const isModel = kind === "model";
  const durationMs = isModel ? MODEL_FADE_MS : COLOR_FADE_MS;
  const easing = isModel ? "var(--ease-glide)" : "linear";

  const layer = document.createElement("div");
  layer.className = "absolute inset-0 flex items-center justify-center";
  layer.style.opacity = "0";
  layer.style.transform = isModel ? "translateY(12px)" : "translateY(0)";
  layer.style.transition = isModel
    ? `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`
    : `opacity ${durationMs}ms ${easing}`;
  layer.innerHTML = innerHtml;
  container.appendChild(layer);

  const previousLayers = Array.from(container.children).filter(
    (el): el is HTMLElement => el !== layer
  );

  // Força o navegador a "commitar" o opacity:0 antes de animar — senão ele
  // agrupa criação + transição no mesmo frame e a transição não roda.
  void layer.offsetHeight;

  requestAnimationFrame(() => {
    layer.style.opacity = "1";
    if (isModel) layer.style.transform = "translateY(0)";
    previousLayers.forEach((el) => {
      el.style.transition = `opacity ${durationMs}ms ${easing}`;
      el.style.opacity = "0";
    });
  });

  window.setTimeout(() => {
    previousLayers.forEach((el) => el.remove());
  }, durationMs + 50);
}
