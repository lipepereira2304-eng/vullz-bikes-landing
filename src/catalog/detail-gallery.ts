/*
  Galeria de DETALHES de uma cor: os closes (guidão, quadro, traseira...) que
  complementam a foto principal.

  A foto principal NÃO participa: ela continua parada no palco, flutuando no
  fundo infinito. Os closes são fotografias com borda (a bike sai pelas bordas
  do quadro), e colocá-los no mesmo palco quebrava essa ilusão — testado e
  descartado, junto com esfumar as bordas. Por isso eles vivem em dois lugares
  só deles:

    1. três miniaturas pequenas embaixo da foto, numa pílula de vidro;
    2. um "vidro" que cobre a página inteira (fundo desfocado), aberto ao
       clicar numa miniatura — com setas, as mesmas miniaturas embaixo e o
       close num cartão de cantos arredondados.

  Sem rótulos ("guidão", "quadro"...) de propósito, a pedido do cliente: a
  foto se explica sozinha.

  O vidro é criado UMA vez e mora direto no <body>, fora do #app: render()
  reconstrói o #app inteiro a cada clique, e uma camada aberta ali dentro
  seria destruída no meio do uso.
*/

const CHEVRON_LEFT = /* html */ `
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 3.5L5.5 8L10 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;

const CHEVRON_RIGHT = /* html */ `
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;

const CLOSE_ICON = /* html */ `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
  </svg>`;

/** Distância mínima (px) de arraste horizontal pra contar como "passar a foto". */
const SWIPE_THRESHOLD = 40;

/*
  Folga lateral (px) a partir da qual as setas saem de cima da foto e ficam do
  lado de fora. Abaixo disso (celular) elas ficam por cima, na borda do cartão.
*/
const ROOMY_GUTTER = 96;

function thumbButtonsMarkup(urls: string[], active: number, attr: string): string {
  return urls
    .map(
      (url, i) => /* html */ `
        <button
          type="button"
          ${attr}="${i}"
          aria-label="Ver detalhe ${i + 1} de ${urls.length}"
          ${i === active ? `aria-current="true"` : ""}
          style="--i:${i}"
          class="detail-thumb"
        >
          <img src="${url}" alt="" draggable="false" />
        </button>
      `
    )
    .join("");
}

/*
  Miniaturas embaixo da foto principal. Lista vazia → string vazia: a cor sem
  closes simplesmente não ganha a pílula, e o layout fica como sempre foi.
*/
export function detailThumbsMarkup(urls: string[]): string {
  if (urls.length === 0) return "";
  return /* html */ `
    <div data-role="detail-thumbs" class="glass-surface detail-thumbs" role="group" aria-label="Fotos de detalhe">
      ${thumbButtonsMarkup(urls, -1, "data-detail")}
    </div>
  `;
}

/*
  A "onda": as miniaturas sobem levemente e acendem, uma depois da outra, UMA
  vez — só pra chamar o olho e sugerir que dá pra clicar nelas. Nada diz isso
  por texto (sem rótulos, a pedido), então o movimento é o convite.

  Uma vez por modelo+cor em cada visita: repetir a cada troca de cor viraria
  enfeite, e o que era convite passa a ser ruído. O registro vive em memória
  (some ao recarregar), de propósito — quem volta outro dia ganha o convite
  de novo.

  O tempo de espera antes de começar e o desenho do movimento moram em
  main.css (`detail-wave`); aqui só se liga o atributo e se limpa no fim.
*/
const waved = new Set<string>();

export function playThumbsWave(key: string): void {
  if (waved.has(key)) return;
  const container = document.querySelector<HTMLElement>("[data-role='detail-thumbs']");
  if (!container) return;
  waved.add(key);

  container.dataset.wave = "true";
  const thumbs = container.querySelectorAll<HTMLElement>(".detail-thumb");
  const last = thumbs[thumbs.length - 1];
  last?.addEventListener("animationend", () => delete container.dataset.wave, { once: true });
}

export interface DetailGallery {
  open(urls: string[], index: number, alt: string, returnFocus: HTMLElement | null): void;
}

export function createDetailGallery(): DetailGallery {
  const root = document.createElement("div");
  root.dataset.role = "detail-gallery";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Fotos de detalhe");
  root.setAttribute("inert", "");
  root.className = "font-catalog";
  root.innerHTML = /* html */ `
    <button type="button" data-gallery="close" aria-label="Fechar" class="glass-surface detail-gallery-close">
      ${CLOSE_ICON}
    </button>
    <div data-gallery="view" class="detail-gallery-view">
      <div data-gallery="layers" class="contents"></div>
      <button type="button" data-gallery="prev" aria-label="Foto anterior" class="glass-surface detail-gallery-arrow" data-side="prev">
        ${CHEVRON_LEFT}
      </button>
      <button type="button" data-gallery="next" aria-label="Próxima foto" class="glass-surface detail-gallery-arrow" data-side="next">
        ${CHEVRON_RIGHT}
      </button>
    </div>
    <div data-gallery="thumbs" class="glass-surface detail-thumbs" role="group" aria-label="Fotos de detalhe"></div>
  `;
  document.body.appendChild(root);

  const view = root.querySelector<HTMLElement>("[data-gallery='view']")!;
  const layersBox = root.querySelector<HTMLElement>("[data-gallery='layers']")!;
  const thumbsBox = root.querySelector<HTMLElement>("[data-gallery='thumbs']")!;
  const closeButton = root.querySelector<HTMLElement>("[data-gallery='close']")!;

  let urls: string[] = [];
  let current = 0;
  let returnFocusTo: HTMLElement | null = null;

  function isOpen(): boolean {
    return root.dataset.open === "true";
  }

  /*
    Uma camada por foto, todas empilhadas; a ativa sobe a opacidade enquanto as
    outras descem — o mesmo crossfade de verdade do palco (ver stage.ts), sem
    instante vazio entre uma foto e outra.
  */
  function show(index: number): void {
    current = (index + urls.length) % urls.length;
    layersBox.querySelectorAll<HTMLElement>("[data-layer]").forEach((layer, i) => {
      layer.dataset.active = String(i === current);
    });
    thumbsBox.querySelectorAll<HTMLElement>("[data-gallery-thumb]").forEach((thumb, i) => {
      if (i === current) thumb.setAttribute("aria-current", "true");
      else thumb.removeAttribute("aria-current");
    });
  }

  function fitArrows(): void {
    view.dataset.roomy = String((window.innerWidth - view.offsetWidth) / 2 > ROOMY_GUTTER);
  }

  function open(nextUrls: string[], index: number, alt: string, returnFocus: HTMLElement | null): void {
    urls = nextUrls;
    returnFocusTo = returnFocus;

    layersBox.innerHTML = urls
      .map(
        (url) => /* html */ `
          <div data-layer class="detail-gallery-layer">
            <img src="${url}" alt="${alt}" draggable="false" />
          </div>
        `
      )
      .join("");
    thumbsBox.innerHTML = thumbButtonsMarkup(urls, index, "data-gallery-thumb");
    show(index);

    root.removeAttribute("inert");
    root.dataset.open = "true";
    document.documentElement.dataset.galleryOpen = "true";
    fitArrows();
    closeButton.focus({ preventScroll: true });
  }

  function close(): void {
    if (!isOpen()) return;
    root.dataset.open = "false";
    root.setAttribute("inert", "");
    delete document.documentElement.dataset.galleryOpen;
    returnFocusTo?.focus({ preventScroll: true });
  }

  root.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.closest<HTMLElement>("[data-gallery]")?.dataset.gallery;
    const thumb = target.closest<HTMLElement>("[data-gallery-thumb]");

    if (thumb) return show(Number(thumb.dataset.galleryThumb));
    if (action === "close") return close();
    if (action === "prev") return show(current - 1);
    if (action === "next") return show(current + 1);

    // Clique no vidro vazio (fora da foto e dos controles) fecha.
    if (!target.closest("[data-layer] img, [data-gallery='thumbs']")) close();
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowRight") show(current + 1);
    if (event.key === "ArrowLeft") show(current - 1);
  });

  // Arrastar pro lado no celular.
  let startX: number | null = null;
  view.addEventListener("pointerdown", (event) => {
    if (!(event.target as HTMLElement).closest("button")) startX = event.clientX;
  });
  view.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) show(current + (dx < 0 ? 1 : -1));
  });

  window.addEventListener("resize", () => {
    if (isOpen()) fitArrows();
  });

  return { open };
}
