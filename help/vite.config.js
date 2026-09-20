import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// dev এ root (/), production build এ /help/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/help/" : "/",
  plugins: [react(), tailwindcss()],
  server: { port: 5175, strictPort: true },
}));
