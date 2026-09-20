import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// dev এ root (/), production build এ /partner/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/partner/" : "/",
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true },
}));
