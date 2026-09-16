import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// অ্যাডমিন প্যানেল ৫১৭৫ পোর্টে (client ৫১৭৩, affiliate ৫১৭৪)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5176,
    strictPort: true,
  },
});
