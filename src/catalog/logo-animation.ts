/*
  Logos animadas dos modelos — o MOTOR. As coreografias de cada logo moram em
  src/scripts/logo-animations-bikes.ts; aqui fica só o que é comum a todas.

  Como funciona: as logos só existem em imagem (.webp, sem vetor). Cada uma
  foi recortada em CAMADAS — letras, asas, faixas, estilhaços... — que,
  empilhadas na posição certa, reproduzem a logo original pixel a pixel
  (conferido na geração). Animar a logo é animar essas camadas; parada, ela é
  idêntica à imagem de sempre.

  Quando toca: TODA vez que um modelo é selecionado (decidido em
  create-catalog-page.ts). Pra quem pediu menos movimento no sistema, a logo é
  a imagem simples com a entrada discreta de sempre (`.model-logo-enter`).

  Tudo por Web Animations API (element.animate): toca uma vez, segura o
  quadro final (`fill: "both"`) e não deixa nenhuma classe/estado pra limpar.
*/

/** Uma camada da logo, em % da caixa da logo (o canvas original). */
export interface LogoLayer {
  name: string;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LogoAnimationContext {
  /** A camada pelo nome (undefined se não existir). */
  layer(name: string): HTMLElement | undefined;
  /** Envolve a logo inteira — é o que treme nos impactos (Doble). */
  shaker: HTMLElement;
  /** element.animate com o padrão do site: segura o fim e usa a curva de entrada. */
  animate(el: Element | undefined, keyframes: Keyframe[], options: KeyframeAnimationOptions): void;
}

export interface LogoAnimation {
  /** Tamanho do canvas original, em px — define a proporção da caixa. */
  width: number;
  height: number;
  layers: LogoLayer[];
  play(ctx: LogoAnimationContext): void;
}

/** Mesma curva de `--ease-glide` (main.css): entrada de algo que aparece por conta própria. */
export const EASE_GLIDE = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Mesma curva de `--ease-out` (main.css). */
export const EASE_OUT = "cubic-bezier(0.33, 1, 0.68, 1)";

/*
  Teto de espera pelas camadas antes de começar. Elas são pré-carregadas depois
  do load (ver preloadAll), então quase sempre já estão prontas; se a rede
  estiver lenta, melhor tocar com o que houver do que segurar a logo enquanto
  a bike já está entrando.
*/
const DECODE_WAIT_MS = 300;

export function logoAnimationMarkup(anim: LogoAnimation, alt: string): string {
  const layers = anim.layers
    .map(
      (l) => /* html */ `
        <img data-layer="${l.name}" src="${l.url}" alt="" draggable="false"
          style="left:${l.x}%;top:${l.y}%;width:${l.w}%;height:${l.h}%" />`
    )
    .join("");
  return /* html */ `
    <div data-role="logo-anim" class="logo-anim" role="img" aria-label="${alt}">
      <div class="logo-anim-box" style="aspect-ratio:${anim.width} / ${anim.height}">
        <div class="logo-anim-shaker">${layers}</div>
      </div>
    </div>
  `;
}

/*
  A caixa precisa se comportar como o `<img object-contain>` que ela
  substitui: o maior tamanho que cabe no espaço da logo, centralizado. Em CSS
  puro, `aspect-ratio` com altura E largura máximas não reduz as duas juntas
  de forma confiável, então o tamanho é medido e aplicado aqui — e refeito se
  o espaço mudar (girar o celular, redimensionar a janela).
*/
function fitBox(root: HTMLElement, box: HTMLElement, anim: LogoAnimation): void {
  const fit = (): void => {
    const scale = Math.min(root.clientWidth / anim.width, root.clientHeight / anim.height);
    box.style.width = `${anim.width * scale}px`;
    box.style.height = `${anim.height * scale}px`;
  };
  // Já na hora (o observador só dispara no próximo quadro desenhado).
  fit();
  const observer = new ResizeObserver(() => {
    // A logo sai da tela a cada render novo; o observador sai junto.
    if (!root.isConnected) return observer.disconnect();
    fit();
  });
  observer.observe(root);
}

export function playLogoAnimation(container: HTMLElement, anim: LogoAnimation): void {
  const root = container.querySelector<HTMLElement>("[data-role='logo-anim']");
  const box = root?.querySelector<HTMLElement>(".logo-anim-box");
  const shaker = root?.querySelector<HTMLElement>(".logo-anim-shaker");
  if (!root || !box || !shaker) return;

  fitBox(root, box, anim);

  const layers = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLImageElement>("[data-layer]").forEach((img) => layers.set(img.dataset.layer!, img));

  const ctx: LogoAnimationContext = {
    layer: (name) => layers.get(name),
    shaker,
    animate(el, keyframes, options) {
      el?.animate(keyframes, { fill: "both", easing: EASE_GLIDE, ...options });
    },
  };

  /*
    Esconde tudo até começar (sem isto, quem não está com o primeiro quadro
    aplicado ainda apareceria pronto por um instante) e espera as camadas
    decodificarem — com teto, ver DECODE_WAIT_MS.
  */
  shaker.style.visibility = "hidden";
  const decoded = Promise.all([...layers.values()].map((img) => (img as HTMLImageElement).decode().catch(() => undefined)));
  const timeout = new Promise((resolve) => window.setTimeout(resolve, DECODE_WAIT_MS));
  void Promise.race([decoded, timeout]).then(() => {
    if (!root.isConnected) return;
    anim.play(ctx);
    shaker.style.visibility = "";
  });
}
