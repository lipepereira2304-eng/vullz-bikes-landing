import "../styles/main.css";
import { fluidBackgroundMarkup } from "../components/fluid-background";
import { catalogCardMarkup } from "../components/catalog-card";
import { bikeIcon, boltIcon } from "../components/icons";
import { initRevealOnScroll } from "./animations";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = /* html */ `
    <div class="relative isolate flex min-h-dvh flex-col overflow-hidden bg-vullz-white">
      ${fluidBackgroundMarkup()}

      <header class="relative z-10 flex justify-center pt-10 sm:pt-14" data-reveal>
        <span class="text-sm font-bold tracking-[0.3em] text-vullz-black">VULLZ</span>
      </header>

      <main class="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16 text-center sm:gap-16 sm:py-20">
        <div class="flex flex-col items-center gap-5" data-reveal style="transition-delay:80ms">
          <h1 class="text-balance text-4xl font-extrabold tracking-tight text-vullz-black sm:text-6xl md:text-7xl">
            Catálogo Digital <span class="text-vullz-yellow-dim">Vullz</span>
          </h1>
          <p class="max-w-md text-balance text-base text-vullz-gray-700 sm:text-lg">
            Explore toda nossa linha de bicicletas e veículos elétricos.
          </p>
        </div>

        <div class="grid w-full max-w-3xl gap-5 sm:grid-cols-2 sm:gap-6">
          ${catalogCardMarkup({
            icon: bikeIcon,
            title: "Bicicletas",
            description: "Conheça toda nossa linha de bicicletas.",
            href: "/catalogos/bicicletas.pdf",
            delayMs: 160,
          })}
          ${catalogCardMarkup({
            icon: boltIcon,
            title: "Elétricos",
            description: "Conheça nossa linha de mobilidade elétrica.",
            href: "/catalogos/eletricos.pdf",
            delayMs: 260,
          })}
        </div>
      </main>

      <footer class="relative z-10 pb-8 text-center text-xs text-vullz-gray-500">
        © ${new Date().getFullYear()} Vullz Bikes. Todos os direitos reservados.
      </footer>
    </div>
  `;
}

initRevealOnScroll();
