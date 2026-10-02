import { EASE_OUT, type LogoAnimation, type LogoAnimationContext, type LogoLayer } from "../catalog/logo-animation";

/*
  Coreografias das logos animadas das BICICLETAS (motor em
  src/catalog/logo-animation.ts). Aprovadas uma a uma em simulação, com o
  cliente, antes de entrar aqui.

  GRAMÁTICA DA FAMÍLIA: ~1,5s cada; as letras nascem apertadas no centro e se
  espalham até o lugar (Oregon, Slim), e cada logo tem um detalhe próprio que
  conversa com a bike — asas abrindo, faixas de velocidade, spray, queda
  pesada.

  CAMADAS: src/assets/bikes/<modelo>/logo-anim/<camada>.webp, geradas a partir
  da logo.webp (recortes que, empilhados, reproduzem a logo pixel a pixel).
  Oregon, Slim e Doble usam camadas do tamanho do canvas inteiro (posição 0,0
  100%); a Street usa recortes justos, com a posição de cada um abaixo.
*/

const layerFiles = import.meta.glob<string>("../assets/bikes/*/logo-anim/*.webp", {
  eager: true,
  import: "default",
});

function layerUrl(model: string, name: string): string {
  const url = layerFiles[`../assets/bikes/${model}/logo-anim/${name}.webp`];
  if (!url) throw new Error(`Camada de logo ausente: ${model}/${name}`);
  return url;
}

function fullLayers(model: string, names: string[]): LogoLayer[] {
  return names.map((name) => ({ name, url: layerUrl(model, name), x: 0, y: 0, w: 100, h: 100 }));
}

/* ------------------------------------------------------------------------ */
/* Movimentos compartilhados                                                 */
/* ------------------------------------------------------------------------ */

/** Quanto cada letra começa deslocada em direção ao centro (fração da distância). */
const SPREAD = 0.42;

/*
  As letras nascem apertadas no centro e se espalham até o lugar — a assinatura
  da família. `centers` = centro horizontal de cada letra no canvas original
  (px); as do meio saem primeiro.
*/
function spread(
  ctx: LogoAnimationContext,
  width: number,
  letters: [name: string, center: number][],
  delay: number,
  duration: number,
  step: number
): void {
  const mid = (letters.length - 1) / 2;
  letters.forEach(([name, cx], k) => {
    const tx = ((width / 2 - cx) / width) * 100 * SPREAD;
    ctx.animate(ctx.layer(name), [{ opacity: 0, transform: `translateX(${tx}%)` }, { opacity: 1, transform: "none" }], {
      duration,
      delay: delay + Math.abs(k - mid) * step,
    });
  });
}

/* ------------------------------------------------------------------------ */
/* Oregon — "Expansão": letras se espalham, asas abrem do centro pra fora    */
/* ------------------------------------------------------------------------ */

const OREGON: LogoAnimation = {
  width: 3237,
  height: 382,
  layers: fullLayers("oregon", ["asa-esq", "asa-dir", "linhas", "letra-0", "letra-1", "letra-2", "letra-3", "letra-4", "letra-5"]),
  play(ctx) {
    spread(ctx, 3237, [["letra-0", 610], ["letra-1", 1008], ["letra-2", 1405], ["letra-3", 1802], ["letra-4", 2200], ["letra-5", 2598]], 0, 1200, 33);
    // cada asa só tem conteúdo na sua metade: o recorte que abre do meio desenha as duas pra fora
    for (const wing of ["asa-esq", "asa-dir"]) {
      ctx.animate(ctx.layer(wing), [{ clipPath: "inset(0 50% 0 50%)", opacity: 0 }, { clipPath: "inset(0 0% 0 0%)", opacity: 1 }], {
        duration: 1260,
        delay: 240,
      });
    }
    ctx.animate(ctx.layer("linhas"), [{ opacity: 0 }, { opacity: 1 }], { duration: 800, delay: 600, easing: "linear" });
  },
};

/* ------------------------------------------------------------------------ */
/* Slim — "Passagem": as faixas cruzam primeiro, a palavra se espalha atrás  */
/* ------------------------------------------------------------------------ */

const SLIM: LogoAnimation = {
  width: 3082,
  height: 536,
  layers: fullLayers("slim", ["faixa-rosa", "faixa-azul", "letra-i-pingo", "letra-s", "letra-l", "letra-i", "letra-m"]),
  play(ctx) {
    ctx.animate(ctx.layer("faixa-rosa"), [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], { duration: 710 });
    ctx.animate(ctx.layer("faixa-azul"), [{ clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)" }], { duration: 710, delay: 68 });
    spread(ctx, 3082, [["letra-s", 1098], ["letra-l", 1523], ["letra-i", 1687], ["letra-m", 2078]], 315, 1010, 30);
    ctx.animate(ctx.layer("letra-i-pingo"), [{ opacity: 0, transform: "translateY(-14%)" }, { opacity: 1, transform: "none" }], {
      duration: 465,
      delay: 1020,
    });
  },
};

/* ------------------------------------------------------------------------ */
/* Street — "STREET" carimba; o grafite em volta é escrito a spray           */
/* ------------------------------------------------------------------------ */

/*
  Posições (em % do canvas 2776×500) dos pedaços do grafite já com a borda de
  spray. `d` = distância do centro (ordem de pintura: de perto da palavra pra
  fora); `wide` = traço mais largo que alto (escrito da esquerda pra direita;
  os altos, de cima pra baixo).
*/
interface StreetSeg { name: string; x: number; y: number; w: number; h: number }
interface StreetTag { d: number; wide: boolean; segs: StreetSeg[] }
const STREET_DATA: { word: Omit<StreetSeg, "name">; tags: StreetTag[] } = {"word":{"x":36.023,"y":28.6,"w":27.99,"h":43.0},"tags":[{"d":0.4131,"wide":true,"segs":[{"name":"t0s0","x":0.0,"y":0.0,"w":14.733,"h":78.4},{"name":"t0s1","x":14.733,"y":58.2,"w":3.35,"h":19.4}]},{"d":0.4127,"wide":true,"segs":[{"name":"t1s0","x":9.15,"y":0.2,"w":1.873,"h":19.2},{"name":"t1s1","x":11.023,"y":0.2,"w":4.971,"h":23.2},{"name":"t1s2","x":16.967,"y":0.2,"w":0.72,"h":11.8}]},{"d":0.209,"wide":false,"segs":[{"name":"t2s0","x":24.64,"y":0.4,"w":10.447,"h":13.2},{"name":"t2s1","x":25.0,"y":13.6,"w":8.934,"h":63.6}]},{"d":0.2229,"wide":true,"segs":[{"name":"t3s0","x":35.086,"y":0.6,"w":0.396,"h":8.8},{"name":"t3s1","x":36.852,"y":0.6,"w":0.648,"h":6.0},{"name":"t3s2","x":37.788,"y":0.6,"w":1.153,"h":18.2},{"name":"t3s3","x":38.941,"y":0.6,"w":5.692,"h":19.4}]},{"d":0.1969,"wide":true,"segs":[{"name":"t4s0","x":45.281,"y":0.8,"w":1.765,"h":19.8},{"name":"t4s1","x":47.046,"y":0.8,"w":3.963,"h":20.0}]},{"d":0.2001,"wide":true,"segs":[{"name":"t5s0","x":51.261,"y":0.8,"w":3.242,"h":20.4},{"name":"t5s1","x":54.503,"y":0.8,"w":3.242,"h":19.4}]},{"d":0.2298,"wide":true,"segs":[{"name":"t6s0","x":57.673,"y":1.0,"w":2.125,"h":13.8},{"name":"t6s1","x":59.798,"y":1.0,"w":4.791,"h":17.6}]},{"d":0.2255,"wide":false,"segs":[{"name":"t7s0","x":66.138,"y":1.2,"w":5.98,"h":20.0},{"name":"t7s1","x":64.229,"y":21.2,"w":16.643,"h":78.8}]},{"d":0.3076,"wide":true,"segs":[{"name":"t8s0","x":72.442,"y":1.2,"w":5.079,"h":54.8},{"name":"t8s1","x":77.522,"y":1.2,"w":3.782,"h":55.4},{"name":"t8s2","x":81.304,"y":1.4,"w":4.035,"h":53.4}]},{"d":0.4188,"wide":false,"segs":[{"name":"t9s0","x":83.754,"y":1.4,"w":16.246,"h":70.6},{"name":"t9s1","x":95.029,"y":72.0,"w":4.971,"h":28.0}]},{"d":0.5107,"wide":false,"segs":[{"name":"t10s1","x":0.0,"y":22.2,"w":1.369,"h":17.4}]},{"d":0.2985,"wide":false,"segs":[{"name":"t11s0","x":17.147,"y":0.4,"w":5.043,"h":17.4},{"name":"t11s1","x":15.274,"y":17.8,"w":11.275,"h":55.0}]},{"d":0.4099,"wide":true,"segs":[{"name":"t12s0","x":8.898,"y":72.8,"w":2.269,"h":27.2},{"name":"t12s1","x":11.167,"y":83.8,"w":6.484,"h":16.2}]},{"d":0.4487,"wide":false,"segs":[{"name":"t13s0","x":89.697,"y":74.4,"w":2.269,"h":25.6}]},{"d":0.2246,"wide":true,"segs":[{"name":"t15s0","x":58.79,"y":76.6,"w":5.908,"h":23.4}]},{"d":0.4057,"wide":false,"segs":[{"name":"t16s0","x":84.582,"y":76.6,"w":2.378,"h":23.4}]},{"d":0.2093,"wide":false,"segs":[{"name":"t17s0","x":55.728,"y":79.4,"w":1.801,"h":20.6}]},{"d":0.2033,"wide":false,"segs":[{"name":"t18s0","x":51.513,"y":80.8,"w":1.585,"h":19.2}]},{"d":0.242,"wide":true,"segs":[{"name":"t19s0","x":31.304,"y":86.8,"w":3.818,"h":13.2},{"name":"t19s1","x":35.122,"y":83.0,"w":3.17,"h":17.0},{"name":"t19s2","x":38.293,"y":84.6,"w":2.053,"h":15.4},{"name":"t19s3","x":40.346,"y":84.4,"w":1.261,"h":15.6},{"name":"t19s4","x":41.607,"y":84.4,"w":2.197,"h":15.6}]},{"d":0.3421,"wide":true,"segs":[{"name":"t20s0","x":19.597,"y":83.2,"w":3.782,"h":16.8},{"name":"t20s1","x":23.379,"y":90.2,"w":1.117,"h":9.8}]},{"d":0.2096,"wide":true,"segs":[{"name":"t21s0","x":44.236,"y":83.2,"w":6.412,"h":16.8}]},{"d":0.3021,"wide":true,"segs":[{"name":"t22s0","x":26.045,"y":91.4,"w":0.901,"h":5.4},{"name":"t22s1","x":27.882,"y":84.0,"w":2.63,"h":16.0}]}]};

const STREET_W = 2776;
const STREET_H = 500;
/** ms por pixel do canvas original: a "velocidade da mão" que escreve cada pedaço. */
const HAND_MS_PER_PX = 0.95;

const STREET: LogoAnimation = {
  width: STREET_W,
  height: STREET_H,
  layers: [
    ...STREET_DATA.tags.flatMap((t) => t.segs.map((s) => ({ ...s, url: layerUrl("street", s.name) }))),
    { name: "street", url: layerUrl("street", "street"), ...STREET_DATA.word },
  ],
  play(ctx) {
    // carimbo: chega um pouco maior e assenta, rápido
    ctx.animate(ctx.layer("street"), [{ opacity: 0, transform: "scale(1.16)" }, { opacity: 1, transform: "none" }], {
      duration: 420,
      easing: EASE_OUT,
    });

    /*
      Cada pedaço é ESCRITO: uma máscara de borda suave avança na direção da
      escrita a velocidade constante — pedaço largo leva mais, e as letras
      surgem uma após a outra. Palavras diferentes começam em momentos
      diferentes e se sobrepõem (várias sendo escritas ao mesmo tempo), e
      cada uma é comprimida se preciso pra tudo terminar em ~1,5s.
    */
    const TOTAL = 1500;
    const FIRST = 160;
    const LAST_TAG_START = 880;
    const tags = [...STREET_DATA.tags].sort((a, b) => a.d - b.d);
    const stagger = tags.length > 1 ? (LAST_TAG_START - FIRST) / (tags.length - 1) : 0;

    tags.forEach((tag, k) => {
      const durations = tag.segs.map((s) => {
        const length = tag.wide ? (s.w / 100) * STREET_W : (s.h / 100) * STREET_H * 1.6;
        return Math.min(620, Math.max(240, length * HAND_MS_PER_PX));
      });
      const starts: number[] = [];
      let cursor = 0;
      durations.forEach((d) => {
        starts.push(cursor);
        cursor += d * 0.7;
      });
      const t0 = FIRST + k * stagger;
      const end = starts[starts.length - 1] + durations[durations.length - 1];
      const fit = Math.min(1, (TOTAL - t0) / end);

      tag.segs.forEach((seg, j) => {
        const el = ctx.layer(seg.name);
        if (!el) return;
        /*
          Máscara 2,6× maior que o pedaço, com a passagem preto→transparente
          no meio: deslizá-la é o "spray avançando". Navegador que não anima
          `mask-position` pula essa parte e fica só com o fade — a logo
          termina igual.
        */
        const gradient = `linear-gradient(${tag.wide ? "to right" : "to bottom"}, #000 44%, transparent 54%)`;
        el.style.setProperty("mask-image", gradient);
        el.style.setProperty("-webkit-mask-image", gradient);
        el.style.setProperty("mask-size", tag.wide ? "260% 100%" : "100% 260%");
        el.style.setProperty("-webkit-mask-size", tag.wide ? "260% 100%" : "100% 260%");
        el.style.setProperty("mask-repeat", "no-repeat");
        el.style.setProperty("-webkit-mask-repeat", "no-repeat");
        const from = tag.wide ? "100% 0%" : "0% 100%";
        ctx.animate(
          el,
          [
            { maskPosition: from, webkitMaskPosition: from, opacity: 0 } as Keyframe,
            { opacity: 1, offset: 0.12 },
            { maskPosition: "0% 0%", webkitMaskPosition: "0% 0%", opacity: 1 } as Keyframe,
          ],
          { duration: durations[j] * fit, delay: t0 + starts[j] * fit, easing: "cubic-bezier(0.3, 0.1, 0.45, 1)" }
        );
      });
    });
  },
};

/* ------------------------------------------------------------------------ */
/* Doble — queda pesada: barra, estilhaços, letras do centro pra fora        */
/* ------------------------------------------------------------------------ */

/** Centro horizontal e base (onde "pisa") de cada camada, em % do canvas. */
const DOBLE_PIVOTS: Record<string, { cx: number; base: number }> = {"barra":{"cx":62.12,"base":98.0},"letra-d":{"cx":26.46,"base":61.75},"letra-o":{"cx":43.02,"base":61.75},"letra-b":{"cx":60.0,"base":61.57},"letra-l":{"cx":72.2,"base":61.38},"letra-e":{"cx":83.26,"base":61.38},"caco-0":{"cx":1.77,"base":97.45},"caco-1":{"cx":7.84,"base":98.72},"caco-2":{"cx":10.56,"base":86.52},"caco-3":{"cx":13.89,"base":98.54},"caco-4":{"cx":18.39,"base":98.36},"caco-5":{"cx":16.4,"base":81.24},"caco-6":{"cx":18.67,"base":85.79},"caco-7":{"cx":23.24,"base":98.18}};
/** Acelera como queda livre — peso não desacelera antes do chão. */
const GRAVITY = "cubic-bezier(0.55, 0, 1, 0.45)";
const LAND = 0.8; // fração da animação em que a peça toca o chão

/*
  Cai acelerando, toca o chão em `land` ms, achata um instante a partir da
  própria base (o peso) e volta. Sem mola: peso para seco.
*/
function fall(ctx: LogoAnimationContext, name: string, delay: number, land: number, distance: number, rotate: number, squash: number): void {
  const el = ctx.layer(name);
  const pivot = DOBLE_PIVOTS[name];
  if (!el || !pivot) return;
  el.style.transformOrigin = `${pivot.cx}% ${pivot.base}%`;
  ctx.animate(
    el,
    [
      { transform: `translateY(-${distance}%) rotate(${rotate}deg)`, opacity: 0, easing: GRAVITY },
      { opacity: 1, offset: 0.12 },
      { transform: "translateY(0) rotate(0deg) scale(1, 1)", offset: LAND, easing: EASE_OUT },
      { transform: `translateY(0) rotate(0deg) scale(${2 - squash}, ${squash})`, offset: LAND + 0.07, easing: EASE_OUT },
      { transform: "translateY(0) rotate(0deg) scale(1, 1)", opacity: 1 },
    ],
    { duration: land / LAND, delay, easing: "linear" }
  );
}

/* Tremor do impacto: curto, pequeno e amortecendo — mexe a logo inteira. */
function shake(ctx: LogoAnimationContext, at: number, amplitude: number, duration: number): void {
  const steps = [0, 1, -0.65, 0.4, -0.22, 0.1, 0];
  ctx.animate(
    ctx.shaker,
    steps.map((k, i) => ({
      transform: `translate(${(i % 2 ? 0.25 : -0.25) * k * amplitude}%, ${k * amplitude}%) rotate(${k * amplitude * 0.09 * (i % 2 ? 1 : -1)}deg)`,
    })),
    { duration, delay: at, easing: "linear" }
  );
}

const DOBLE_LETTERS = ["d", "o", "b", "l", "e"];

const DOBLE: LogoAnimation = {
  width: 3031,
  height: 549,
  layers: fullLayers("doble", [
    "barra",
    ...Array.from({ length: 8 }, (_, k) => `caco-${k}`),
    ...DOBLE_LETTERS.map((c) => `letra-${c}`),
  ]),
  play(ctx) {
    // a base cai primeiro e bate seco
    fall(ctx, "barra", 0, 360, 140, 0, 0.97);
    shake(ctx, 360, 1.8, 300);
    // estilhaços logo atrás, cada um girando um pouco
    const spins = [-16, 12, -9, 14, -12, 10, -14, 8];
    spins.forEach((rot, k) => fall(ctx, `caco-${k}`, 250 + k * 32, 320, 160, rot, 1));
    // letras do centro pra fora; cada impacto treme, o último mais forte
    const waves: [string[], number, number][] = [
      [["b"], 500, 1.6],
      [["o", "l"], 670, 2.3],
      [["d", "e"], 840, 3.8],
    ];
    waves.forEach(([letters, at, amplitude], i) => {
      letters.forEach((c) => fall(ctx, `letra-${c}`, at, 330, 110, 0, 0.9));
      shake(ctx, at + 330, amplitude, i === waves.length - 1 ? 380 : 260);
    });
  },
};

/* ------------------------------------------------------------------------ */
/* Pulse — "Juntas": a palavra chega tombada e cada letra se equilibra       */
/* ------------------------------------------------------------------------ */

/*
  Bike infantil: a ideia (do cliente) é a criança aprendendo a se equilibrar.
  A faixa (o chão) chega primeiro; depois a palavra inteira entra pela direita
  como uma fileira rígida — ninguém cruza ninguém — e cada letra gira a partir
  da PRÓPRIA base, passa do ponto e balança cada vez menos até ficar reta.
*/
const PULSE_PIVOTS: Record<string, { cx: number; base: number; x0: number }> = {
  "letra-p": { cx: 22.55, base: 35.16, x0: 17.34 },
  "letra-u": { cx: 40.24, base: 33.33, x0: 34.99 },
  "letra-l": { cx: 58.97, base: 31.71, x0: 53.72 },
  "letra-s": { cx: 77.16, base: 30.08, x0: 71.95 },
  "letra-e": { cx: 94.74, base: 28.46, x0: 89.51 },
  barra: { cx: 32.33, base: 97.36, x0: 0.25 },
};

function balance(ctx: LogoAnimationContext, name: string, delay: number, tilt: number, duration: number, travel?: number): void {
  const el = ctx.layer(name);
  const p = PULSE_PIVOTS[name];
  if (!el || !p) return;
  el.style.transformOrigin = `${p.cx}% ${p.base}%`;
  // começa fora da logo, à direita; com `travel` fixo todas andam a mesma distância
  const fromX = travel ?? 104 - p.x0;
  ctx.animate(
    el,
    [
      { transform: `translateX(${fromX}%) rotate(${tilt}deg)`, opacity: 0, easing: "cubic-bezier(0.25, 0.8, 0.35, 1)" },
      { opacity: 1, offset: 0.1 },
      { transform: `translateX(0%) rotate(${-0.38 * tilt}deg)`, offset: 0.45, easing: "ease-in-out" },
      { transform: `translateX(0%) rotate(${0.2 * tilt}deg)`, offset: 0.63, easing: "ease-in-out" },
      { transform: `translateX(0%) rotate(${-0.09 * tilt}deg)`, offset: 0.79, easing: "ease-in-out" },
      { transform: `translateX(0%) rotate(${0.035 * tilt}deg)`, offset: 0.9, easing: "ease-in-out" },
      { transform: "translateX(0%) rotate(0deg)", opacity: 1 },
    ],
    { duration, delay, easing: "linear" }
  );
}

const PULSE: LogoAnimation = {
  width: 3155,
  height: 492,
  layers: fullLayers("pulse", ["barra", "letra-p", "letra-u", "letra-l", "letra-s", "letra-e"]),
  play(ctx) {
    balance(ctx, "barra", 0, 9, 900);
    const tilts: Record<string, number> = { p: 26, u: 32, l: 24, s: 30, e: 28 };
    ["p", "u", "l", "s", "e"].forEach((c, k) => balance(ctx, `letra-${c}`, 220 + k * 45, tilts[c], 1000, 85));
  },
};

/* ------------------------------------------------------------------------ */
/* Majestic — caligrafia escrita, faixa esticada, detalhes desabrocham       */
/* ------------------------------------------------------------------------ */

const MAJESTIC_BOX = {
  palavra: { x0: 32.5, x1: 79.65 },
  plumas: { x0: 6.89, x1: 12.82, y1: 35.03 },
  folhas: { x0: 33.98, x1: 39.16, y1: 63.57 },
  wordCenter: 56.07,
};

const MAJESTIC: LogoAnimation = {
  width: 3105,
  height: 431,
  layers: fullLayers("majestic", ["faixa", "palavra", "folhas", "plumas"]),
  play(ctx) {
    /*
      1) Caligrafia: a palavra (com o contorno azul colado nela) é revelada da
      esquerda pra direita por uma máscara de ponta suave. As posições da
      máscara são calculadas pra borda andar só sobre a palavra — não sobre o
      canvas inteiro (máscara 260% maior, transição preto→transparente entre
      47% e 50% dela).
    */
    const word = ctx.layer("palavra");
    if (word) {
      const gradient = "linear-gradient(to right, #000 47%, transparent 50%)";
      word.style.setProperty("mask-image", gradient);
      word.style.setProperty("-webkit-mask-image", gradient);
      word.style.setProperty("mask-size", "260% 100%");
      word.style.setProperty("-webkit-mask-size", "260% 100%");
      word.style.setProperty("mask-repeat", "no-repeat");
      word.style.setProperty("-webkit-mask-repeat", "no-repeat");
      const edgeAt = (x: number) => `${((1.3 - x) / 1.6) * 100}% 0%`; // borda transparente em x
      const doneAt = (x: number) => `${((1.222 - x) / 1.6) * 100}% 0%`; // parte opaca já passou de x
      const from = edgeAt(MAJESTIC_BOX.palavra.x0 / 100 - 0.02);
      const to = doneAt(MAJESTIC_BOX.palavra.x1 / 100 + 0.04);
      ctx.animate(
        word,
        [
          { maskPosition: from, webkitMaskPosition: from, opacity: 0 } as Keyframe,
          { opacity: 1, offset: 0.06 },
          { maskPosition: to, webkitMaskPosition: to, opacity: 1 } as Keyframe,
        ],
        { duration: 900, easing: "cubic-bezier(0.45, 0.05, 0.4, 1)" }
      );
    }
    // 2) a faixa se estica a partir da palavra, como tecido sendo puxado
    const ribbon = ctx.layer("faixa");
    if (ribbon) ribbon.style.transformOrigin = `${MAJESTIC_BOX.wordCenter}% 50%`;
    ctx.animate(
      ribbon,
      [
        { transform: "scale(0.28, 0.92)", opacity: 0, easing: "cubic-bezier(0.3, 0.7, 0.3, 1)" },
        { opacity: 1, offset: 0.15 },
        { transform: "scale(1.025, 1)", offset: 0.68, easing: "ease-in-out" },
        { transform: "scale(0.995, 1)", offset: 0.85, easing: "ease-in-out" },
        { transform: "scale(1, 1)", opacity: 1 },
      ],
      { duration: 720, delay: 620, easing: "linear" }
    );
    // 3) detalhes delicados no fim: folhinhas e plumas desabrocham da base
    const bloom = (name: "folhas" | "plumas", delay: number, rotate: number): void => {
      const el = ctx.layer(name);
      const b = MAJESTIC_BOX[name];
      if (el) el.style.transformOrigin = `${(b.x0 + b.x1) / 2}% ${b.y1}%`;
      ctx.animate(el, [{ opacity: 0, transform: `scale(0.5) rotate(${rotate}deg)` }, { opacity: 1, transform: "none" }], {
        duration: 380,
        delay,
        easing: EASE_OUT,
      });
    };
    bloom("folhas", 1100, 0);
    bloom("plumas", 1120, -14);
  },
};

/* ------------------------------------------------------------------------ */
/* Pro Kids — "Manobra": adesivo surge, P R O quicam, KIDS faz um 360 de BMX */
/* ------------------------------------------------------------------------ */

const PROKIDS_BOX: Record<string, { cx: number; cy: number; y1: number }> = {
  "letra-p": { cx: 13.96, cy: 51.3, y1: 85.64 },
  "letra-r": { cx: 31.03, cy: 51.36, y1: 85.15 },
  "letra-o": { cx: 48.15, cy: 50.37, y1: 84.65 },
  kids: { cx: 79.31, cy: 40.04, y1: 64.11 },
};

const PROKIDS: LogoAnimation = {
  width: 2736,
  height: 808,
  layers: fullLayers("pro-kids", ["borda", "fundo", "letra-p", "letra-r", "letra-o", "kids"]),
  play(ctx) {
    // o "adesivo" (borda e fundo) surge primeiro
    for (const name of ["borda", "fundo"]) {
      const el = ctx.layer(name);
      if (el) el.style.transformOrigin = "50% 50%";
      ctx.animate(
        el,
        [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1.05)", offset: 0.6, easing: "ease-in-out" }, { opacity: 1, transform: "scale(1)" }],
        { duration: 420, easing: EASE_OUT }
      );
    }
    // P, R, O caem um a um e quicam como bola (achatam ao tocar o chão)
    ["p", "r", "o"].forEach((c, i) => {
      const name = `letra-${c}`;
      const el = ctx.layer(name);
      const b = PROKIDS_BOX[name];
      if (el) el.style.transformOrigin = `${b.cx}% ${b.y1}%`;
      ctx.animate(
        el,
        [
          { transform: "translateY(-140%) scale(1, 1)", opacity: 0, easing: GRAVITY },
          { opacity: 1, offset: 0.12 },
          { transform: "translateY(0) scale(1.08, 0.88)", offset: 0.45, easing: EASE_OUT },
          { transform: "translateY(-16%) scale(0.97, 1.04)", offset: 0.62, easing: GRAVITY },
          { transform: "translateY(0) scale(1.03, 0.96)", offset: 0.78, easing: EASE_OUT },
          { transform: "translateY(-4%) scale(1, 1)", offset: 0.88, easing: GRAVITY },
          { transform: "translateY(0) scale(1, 1)", opacity: 1 },
        ],
        { duration: 640, delay: 220 + i * 110, easing: "linear" }
      );
    });
    // KIDS: salta em arco de baixo, dá um giro completo no ar e aterrissa quicando
    const kids = ctx.layer("kids");
    if (kids) kids.style.transformOrigin = `${PROKIDS_BOX.kids.cx}% ${PROKIDS_BOX.kids.cy}%`;
    ctx.animate(
      kids,
      [
        { transform: "translate(10%, 75%) rotate(0deg) scale(0.8)", opacity: 0, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)" },
        { opacity: 1, offset: 0.14 },
        { transform: "translate(4%, -40%) rotate(-200deg) scale(1)", offset: 0.48, easing: "cubic-bezier(0.5, 0, 0.8, 0.6)" },
        { transform: "translate(0%, 0%) rotate(-360deg) scale(1.08, 0.9)", offset: 0.76, easing: EASE_OUT },
        { transform: "translate(0%, -6%) rotate(-360deg) scale(1, 1)", offset: 0.88, easing: GRAVITY },
        { transform: "translate(0%, 0%) rotate(-360deg) scale(1, 1)", opacity: 1 },
      ],
      { duration: 820, delay: 680, easing: "linear" }
    );
  },
};

export const BIKE_LOGO_ANIMATIONS: Record<string, LogoAnimation> = {
  oregon: OREGON,
  slim: SLIM,
  street: STREET,
  doble: DOBLE,
  pulse: PULSE,
  majestic: MAJESTIC,
  "pro-kids": PROKIDS,
};
