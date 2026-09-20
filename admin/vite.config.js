import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// dev এ root (/), production build এ /admin/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/admin/" : "/",
  plugins: [react(), tailwindcss()],
  server: { port: 5176, strictPort: true },
}));
