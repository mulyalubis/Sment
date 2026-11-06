import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // folder convex/ ada di root repo, di luar web/
      "@convex": fileURLToPath(new URL("../convex", import.meta.url)),
    },
  },
  server: {
    fs: { allow: [".."] }, // izinkan Vite membaca ../convex
  },
});