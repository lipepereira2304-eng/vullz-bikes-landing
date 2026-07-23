import "../styles/main.css";
import { fluidBackgroundMarkup } from "../components/fluid-background";
import { catalogCardMarkup } from "../components/catalog-card";
import { socialButtonsMarkup } from "../components/social-buttons";
import { initRevealOnScroll } from "./animations";
import vullzLogo from "../assets/images/vullz-logo.png";

/*
  Este caminho é a URL pública do catálogo e também o nome que o cliente vê ao
  baixar, então vale ser descritivo e versionado por ano. Trocar o caminho a cada
  edição nova não é detalhe: um PDF não tem <head>, então o ícone daquela aba só
  pode vir do /favicon.ico da raiz — e o navegador guarda, por URL, qual ícone já
  viu. Numa URL nova ele é obrigado a rebuscar (pegando o ícone atual) e a baixar
  o PDF novo, em vez de reaproveitar o que tinha guardado da URL antiga.
*/
const CATALOGO_BICICLETAS = "/catalogos/catalogo-bicicletas-2026.pdf";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = /* html */ `
    <div class="relative isolate flex min-h-dvh flex-col overflow-hidden bg-vullz-graphite">
      ${fluidBackgroundMarkup()}

      <header class="relative z-10 flex justify-center pt-10 sm:pt-14" data-reveal>
        <img
          src="${vullzLogo}"
          alt="Vullz"
          width="960"
          height="492"
          class="h-10 w-auto sm:h-12"
        />
      </header>

      <main class="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16 text-center sm:gap-16 sm:py-20">
        <!--
          A partir daqui cada bloco entra um passo (--stagger) depois do
          anterior: logo (0), título (1), os três cards (2, 3, 4) e os dois
          botões sociais (5, 6). O índice é a única coisa declarada no markup —
          o intervalo mora no tema, então mudar o ritmo da página inteira é
          mudar um número em main.css.
        -->
        <div class="flex flex-col items-center gap-5" style="transition-delay:calc(var(--stagger) * 1)" data-reveal>
          <h1 class="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
            Catálogos Digitais
          </h1>
          <p class="max-w-md text-balance text-base text-white/60 sm:text-lg">
            Explore toda nossa linha de bicicletas e veículos elétricos.
          </p>
        </div>

        <div class="grid w-full max-w-5xl gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          ${catalogCardMarkup({
            title: "Bicicletas",
            href: CATALOGO_BICICLETAS,
            revealStep: 2,
          })}
          ${catalogCardMarkup({
            title: "Catálogo Interativo",
            href: "/catalogo-interativo.html",
            newTab: false,
            linkLabel: "Explorar modelos",
            revealStep: 3,
          })}
          ${catalogCardMarkup({
            title: "Elétricos",
            href: "/catalogo-eletricos.html",
            newTab: false,
            linkLabel: "Explorar modelos",
            revealStep: 4,
          })}
        </div>

        ${socialButtonsMarkup({
          whatsappNumber: "45998604743",
          instagramHandle: "vullzbikes",
          revealStep: 5,
        })}
      </main>

      <!-- white/50 é o menor passo que atinge contraste AA (5.24:1) em 12px sobre o grafite. -->
      <footer class="relative z-10 pb-8 text-center text-xs text-white/50">
        © ${new Date().getFullYear()} Vullz Bikes. Todos os direitos reservados.
      </footer>
    </div>
  `;
}

initRevealOnScroll();
