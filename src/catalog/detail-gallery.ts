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

/*
  Arrastar: soltar depois de percorrer mais que esta fração da largura da foto
  passa pra próxima; menos que isso, a foto volta pro lugar. Um "peteleco"
  rápido também passa, mesmo curto — é o gesto natural no celular, e exigir
  1/4 da tela nesse caso faria o toque parecer ignorado.
*/
const SWIPE_DISTANCE_FRACTION = 0.25;
const SWIPE_FLICK_SPEED = 0.35; // px/ms
const SWIPE_FLICK_MIN_PX = 12;

/*
  Elástico nas pontas: puxando além da primeira/última foto, a trilha anda só
  esta fração do que o dedo andou — resiste em vez de travar seco, e deixa
  claro que ali acabou.
*/
const EDGE_RESISTANCE = 0.3;

/** Abaixo disso o gesto conta como toque, não como arraste. */
const DRAG_SLOP_PX = 6;

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
  Miniaturas embaixo da foto principal. O espaço delas é SEMPRE reservado
  (ver o slot em create-catalog-page.ts): cor sem closes mostra "Em breve..."
  no lugar — o mesmo aviso que o palco já usa quando falta a foto — em vez de
  as miniaturas sumirem e a bike mudar de tamanho a cada troca de cor.
*/
export function detailThumbsMarkup(urls: string[]): string {
  if (urls.length === 0) {
    return /* html */ `<p class="detail-soon text-sm font-medium tracking-wide text-vullz-gray-400">Em breve...</p>`;
  }
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
      <div class="detail-gallery-clip">
        <div data-gallery="track" class="detail-gallery-track"></div>
      </div>
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
  const track = root.querySelector<HTMLElement>("[data-gallery='track']")!;
  const thumbsBox = root.querySelector<HTMLElement>("[data-gallery='thumbs']")!;
  const closeButton = root.querySelector<HTMLElement>("[data-gallery='close']")!;

  let urls: string[] = [];
  let current = 0;
  let returnFocusTo: HTMLElement | null = null;

  function isOpen(): boolean {
    return root.dataset.open === "true";
  }

  /*
    As fotos ficam LADO A LADO numa trilha, e não empilhadas com crossfade:
    é o que permite a foto acompanhar o dedo no arraste — com camadas
    empilhadas não existe "a próxima foto ali do lado" pra ir aparecendo.
    O passo de uma foto pra outra é a largura dela + o vão da trilha
    (`column-gap`, lido do CSS pra não duplicar o valor aqui).
  */
  function step(): number {
    return view.clientWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
  }

  function place(offsetPx: number, animate: boolean): void {
    track.dataset.animate = String(animate);
    track.style.transform = `translateX(${offsetPx}px)`;
  }

  /*
    Setas, teclado e miniaturas circulam (da última volta à primeira); o
    arraste não — nele as pontas resistem (ver EDGE_RESISTANCE), e quem chega
    ao fim e continua puxando volta pro lugar.
  */
  function show(index: number, animate = true): void {
    current = (index + urls.length) % urls.length;
    place(-current * step(), animate);
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

    track.innerHTML = urls
      .map(
        (url) => /* html */ `
          <div data-slide class="detail-gallery-slide">
            <img src="${url}" alt="${alt}" draggable="false" />
          </div>
        `
      )
      .join("");
    thumbsBox.innerHTML = thumbButtonsMarkup(urls, index, "data-gallery-thumb");

    root.removeAttribute("inert");
    root.dataset.open = "true";
    document.documentElement.dataset.galleryOpen = "true";
    fitArrows();
    // Já nasce na foto clicada, sem deslizar até ela.
    show(index, false);
    closeButton.focus({ preventScroll: true });
  }

  function close(): void {
    if (!isOpen()) return;
    root.dataset.open = "false";
    root.setAttribute("inert", "");
    delete document.documentElement.dataset.galleryOpen;
    returnFocusTo?.focus({ preventScroll: true });
  }

  /*
    Um arraste termina com um "click" no ponto em que o dedo/mouse foi solto.
    Sem engolir esse click, soltar fora da foto (no vão da trilha) fecharia o
    vidro no meio do gesto.
  */
  let suppressClick = false;

  root.addEventListener("click", (event) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    const target = event.target as HTMLElement;
    const action = target.closest<HTMLElement>("[data-gallery]")?.dataset.gallery;
    const thumb = target.closest<HTMLElement>("[data-gallery-thumb]");

    if (thumb) return show(Number(thumb.dataset.galleryThumb));
    if (action === "close") return close();
    if (action === "prev") return show(current - 1);
    if (action === "next") return show(current + 1);

    // Clique no vidro vazio (fora da foto e dos controles) fecha.
    if (!target.closest("[data-slide] img, [data-gallery='thumbs']")) close();
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowRight") show(current + 1);
    if (event.key === "ArrowLeft") show(current - 1);
  });

  /*
    ARRASTE: a trilha segue o dedo em tempo real (sem transição, senão ela
    ficaria "atrasada" atrás do dedo) e, ao soltar, desliza com a curva de
    entrada do site até a foto escolhida — ou volta pro lugar.
  */
  let dragStartX: number | null = null;
  let dragStartTime = 0;
  let dragDx = 0;

  view.addEventListener("pointerdown", (event) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragStartX = event.clientX;
    dragStartTime = performance.now();
    dragDx = 0;
    // Mantém o arraste vivo mesmo se o dedo/mouse sair de cima da foto.
    // Pode falhar se o ponteiro já tiver sido liberado — aí o arraste segue
    // sem a captura, que é só um reforço.
    try {
      view.setPointerCapture(event.pointerId);
    } catch {
      /* sem captura */
    }
  });

  view.addEventListener("pointermove", (event) => {
    if (dragStartX === null) return;
    dragDx = event.clientX - dragStartX;
    const pastEdge = (current === 0 && dragDx > 0) || (current === urls.length - 1 && dragDx < 0);
    place(-current * step() + (pastEdge ? dragDx * EDGE_RESISTANCE : dragDx), false);
  });

  const endDrag = (): void => {
    if (dragStartX === null) return;
    dragStartX = null;

    const distance = Math.abs(dragDx);
    if (distance > DRAG_SLOP_PX) {
      suppressClick = true;
      /*
        O click "de brinde" do arraste, quando vem, chega logo em seguida ao
        pointerup, antes de qualquer timer. No toque, o navegador nem manda
        esse click depois de um arraste — sem esta expiração a trava ficaria
        armada e engoliria o PRÓXIMO toque de verdade (numa seta, por ex.).
      */
      window.setTimeout(() => (suppressClick = false), 0);
    }

    const speed = distance / Math.max(performance.now() - dragStartTime, 1);
    const passed =
      distance > view.clientWidth * SWIPE_DISTANCE_FRACTION ||
      (speed > SWIPE_FLICK_SPEED && distance > SWIPE_FLICK_MIN_PX);
    const target = passed ? current + (dragDx < 0 ? 1 : -1) : current;

    // O arraste não circula: além da última foto, volta pra ela.
    show(Math.max(0, Math.min(urls.length - 1, target)));
  };
  view.addEventListener("pointerup", endDrag);
  view.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", () => {
    if (!isOpen()) return;
    fitArrows();
    show(current, false);
  });

  return { open };
}
