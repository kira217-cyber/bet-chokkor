import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// ক্লায়েন্ট সাইট ৫১৭৩ পোর্টে (affiliate ৫১৭৪, admin ৫১৭৫)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
