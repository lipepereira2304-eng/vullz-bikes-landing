import "../styles/main.css";
import { fluidBackgroundMarkup } from "../components/fluid-background";
import { catalogCardMarkup } from "../components/catalog-card";
import { initRevealOnScroll } from "./animations";
import vullzLogo from "../assets/images/vullz-logo.png";

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
        <div class="flex flex-col items-center gap-5 delay-[40ms]" data-reveal>
          <h1 class="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
            Catálogos Digitais
          </h1>
          <p class="max-w-md text-balance text-base text-white/60 sm:text-lg">
            Explore toda nossa linha de bicicletas e veículos elétricos.
          </p>
        </div>

        <div class="grid w-full max-w-3xl gap-5 sm:grid-cols-2 sm:gap-6">
          ${catalogCardMarkup({
            title: "Bicicletas",
            href: "/catalogos/bicicletas.pdf",
            delayMs: 80,
          })}
          ${catalogCardMarkup({
            title: "Elétricos",
            href: "/catalogos/eletricos.pdf",
            delayMs: 130,
          })}
        </div>
      </main>

      <footer class="relative z-10 pb-8 text-center text-xs text-white/35">
        © ${new Date().getFullYear()} Vullz Bikes. Todos os direitos reservados.
      </footer>
    </div>
  `;
}

initRevealOnScroll();
