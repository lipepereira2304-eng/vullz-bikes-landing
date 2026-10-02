import type { AssetMap } from "./types";

/*
  Resolução de fotos e logos por CONVENÇÃO DE NOME, não por lista em código:
  qualquer arquivo em <pasta-do-catálogo>/<model-id>/<color-id>.{jpg,jpeg,png,webp}
  é encontrado automaticamente. Adicionar arte nova não exige tocar em código —
  ver src/assets/bikes/README.md para o padrão completo (canvas 1800×1320, fundo
  transparente, WebP q~90).

  As chamadas de import.meta.glob ficam nos scripts de página, não aqui: o Vite
  precisa de um caminho literal em tempo de build, então o glob não pode ser
  parametrizado. O que sobe pra cá é só a busca dentro do mapa já pronto.
*/

const PHOTO_EXTENSION = /\.(jpe?g|png|webp)$/i;

function folderOf(path: string): string {
  const segments = path.split("/");
  return segments[segments.length - 2];
}

function fileNameOf(path: string): string {
  const segments = path.split("/");
  return segments[segments.length - 1];
}

export function findPhoto(photos: AssetMap, modelId: string, colorId: string): string | undefined {
  for (const path in photos) {
    if (folderOf(path) !== modelId) continue;
    if (fileNameOf(path).replace(PHOTO_EXTENSION, "") === colorId) return photos[path];
  }
  return undefined;
}

export function findLogo(logos: AssetMap, modelId: string): string | undefined {
  for (const path in logos) {
    if (folderOf(path) === modelId) return logos[path];
  }
  return undefined;
}

const ICON_EXTENSION = /\.(svg|png|webp)$/i;

/*
  Ícone de um destaque da ficha técnica, por nome de arquivo em
  src/assets/icons/ — mesma ideia das fotos: o dado guarda só o NOME, e quem
  resolve para uma URL é o glob do script de página.

  Devolver `undefined` quando o arquivo ainda não existe é o comportamento
  esperado, não um erro: o cartão reserva o espaço e mostra vazio até o arquivo
  aparecer.
*/
export function findSpecIcon(icons: AssetMap, iconId: string): string | undefined {
  for (const path in icons) {
    if (fileNameOf(path).replace(ICON_EXTENSION, "") === iconId) return icons[path];
  }
  return undefined;
}

/*
  Fotos de DETALHE de uma cor (closes: guidão, quadro, traseira...), em
  <pasta-do-catálogo>/<model-id>/detalhes/<color-id>-<n>.{jpg,jpeg,png,webp}.
  Mesma ideia das fotos principais — larga o arquivo com o nome certo e ele
  aparece — só que numa subpasta, pra não se misturar com o glob das fotos
  principais (que só olha um nível abaixo do modelo).

  Devolve na ordem do número do arquivo (-1, -2, -3), não na ordem em que o
  glob listou. Lista vazia = essa cor não tem detalhes, e a galeria nem aparece.
*/
export function findDetails(details: AssetMap, modelId: string, colorId: string): string[] {
  const pattern = new RegExp(`^${colorId}-(\\d+)$`);
  const found: { n: number; url: string }[] = [];

  for (const path in details) {
    const segments = path.split("/");
    if (segments[segments.length - 3] !== modelId) continue;
    const match = fileNameOf(path).replace(PHOTO_EXTENSION, "").match(pattern);
    if (match) found.push({ n: Number(match[1]), url: details[path] });
  }

  return found.sort((a, b) => a.n - b.n).map((d) => d.url);
}

/*
  Sem isto, o navegador só baixa a foto de um modelo/cor na primeira vez que ela
  aparece na tela — daí aquele delayzinho perceptível na primeira troca (depois
  fica em cache e é instantâneo). Disparando o download de todas em segundo
  plano assim que a página carrega, a primeira troca já vem rápida também.
  `new Image()` sem inserir no DOM só existe pra forçar o fetch.
*/
export function preloadAll(...maps: AssetMap[]): void {
  for (const map of maps) {
    for (const url of Object.values(map)) {
      const img = new Image();
      img.src = url;
    }
  }
}
