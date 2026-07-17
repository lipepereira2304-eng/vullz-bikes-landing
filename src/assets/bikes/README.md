# Fotos das bikes — convenção de pastas

Cada modelo tem sua própria pasta aqui dentro, e cada foto de cor vai direto
nessa pasta com o **nome exato do id da cor** (sem espaço, sem acento, tudo
minúsculo, separado por hífen). O sistema (`src/scripts/catalogo-interativo.ts`)
carrega qualquer arquivo `.jpg`, `.jpeg`, `.png` ou `.webp` que siga esse
caminho automaticamente — não precisa avisar, nem mexer em código.

```
src/assets/bikes/<id-do-modelo>/<id-da-cor>.jpg
```

## Oregon (já configurado)

Pasta: `src/assets/bikes/oregon/`

| Arquivo                                  | Cor                              |
| ----------------------------------------- | --------------------------------- |
| `quadro-preto-azul-dourado.jpg`           | Quadro Preto (Azul + Dourado)     |
| `quadro-branco-azul-dourado.jpg`          | Quadro Branco (Azul + Dourado)    |
| `branco.jpg`                              | Branco                            |
| `rosa.jpg`                                | Rosa                              |
| `verde.jpg`                               | Verde                             |
| `laranja.jpg`                             | Laranja                           |

## Outros modelos

Ainda usam uma paleta genérica de placeholder (preto/branco/vermelho/azul/
amarelo) até você me passar as cores reais de cada um — aí eu crio a pasta e
a lista de ids certinha, do mesmo jeito que fiz com a Oregon:

```
src/assets/bikes/slim/...
src/assets/bikes/street/...
src/assets/bikes/doble/...
src/assets/bikes/pulse/...
src/assets/bikes/majestic/...
src/assets/bikes/pro-kids/...
src/assets/bikes/love-kids/...
```

## Recomendações da foto

- Fundo branco puro (ou o mais próximo disso), a mesma pose/ângulo em todas as
  cores de um mesmo modelo — é o que faz a troca de cor parecer só uma troca
  de cor, sem a bike "pular" de posição.
- Tamanho generoso (pelo menos ~1600px no lado maior); a página redimensiona
  pra caber, então maior é sempre mais seguro que menor.
