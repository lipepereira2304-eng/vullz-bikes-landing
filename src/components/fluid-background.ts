interface Blob {
  tone: "yellow" | "white" | "gray";
  /** Posição/tamanho em % do container. */
  left: number;
  top: number;
  width: number;
  height: number;
}

/*
  Cada blob é um radial-gradient que já desvanece para transparente — a suavidade
  vem de graça, sem filtro. A primeira versão desenhava estas elipses dentro de um
  <filter> SVG com feGaussianBlur stdDeviation=80 e as animava em loop infinito, o
  que re-rasterizava o filtro a cada frame (~18ms medidos, contra ~1.6ms sem
  filtro) e estourava sozinho o orçamento de 16.7ms de um frame a 60fps.

  A deriva lenta que restou depois disso também saiu: a 22-32s por ciclo ela era
  imperceptível, então só custava trabalho contínuo à toa. O fundo agora é
  estático — o brilho continua, o movimento (que ninguém via) não.
*/
const BLOBS: Blob[] = [
  { tone: "yellow", left: -18, top: -24, width: 72, height: 62 },
  { tone: "white", left: 58, top: 6, width: 68, height: 62 },
  { tone: "gray", left: 8, top: 44, width: 82, height: 66 },
  { tone: "yellow", left: -22, top: 62, width: 62, height: 58 },
];

export function fluidBackgroundMarkup(): string {
  const blobs = BLOBS.map(
    ({ tone, left, top, width, height }) => /* html */ `
      <div
        class="blob blob--${tone}"
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
