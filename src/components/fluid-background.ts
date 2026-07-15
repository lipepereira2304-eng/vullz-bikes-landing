interface Blob {
  tone: "yellow" | "white" | "gray";
  animation: "a" | "b" | "c";
  /** Posição/tamanho em % do container. */
  left: number;
  top: number;
  width: number;
  height: number;
}

/*
  Cada blob é um radial-gradient que já desvanece para transparente — ou seja,
  a suavidade vem de graça, sem filtro. A versão anterior desenhava estas mesmas
  elipses dentro de um <filter> SVG com feGaussianBlur stdDeviation=80: como as
  elipses animam em loop infinito, o filtro era re-rasterizado a cada frame
  (~18ms medidos, contra ~1.6ms sem filtro), estourando sozinho o orçamento de
  16.7ms de um frame a 60fps. Gradiente puro + animação só de transform mantém
  o visual e deixa o trabalho por frame com o compositor (GPU), sem repaint.
*/
const BLOBS: Blob[] = [
  { tone: "yellow", animation: "a", left: -18, top: -24, width: 72, height: 62 },
  { tone: "white", animation: "b", left: 58, top: 6, width: 68, height: 62 },
  { tone: "gray", animation: "c", left: 8, top: 44, width: 82, height: 66 },
  { tone: "yellow", animation: "b", left: -22, top: 62, width: 62, height: 58 },
];

export function fluidBackgroundMarkup(): string {
  const blobs = BLOBS.map(
    ({ tone, animation, left, top, width, height }) => /* html */ `
      <div
        class="blob blob--${tone} animate-blob-${animation}"
        style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"
      ></div>`
  ).join("");

  return /* html */ `
    <div
      class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >${blobs}
    </div>
  `;
}
