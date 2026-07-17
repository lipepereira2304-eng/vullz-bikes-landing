import { resolve } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: "es2020",
    cssMinify: true,
    // Vite só empacota index.html por padrão; páginas extras (raiz do projeto)
    // precisam ser listadas aqui pra entrar no build de produção.
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        eletricos: resolve(__dirname, "eletricos.html"),
      },
    },
  },
});
