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
