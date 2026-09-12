import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// অ্যাফিলিয়েট সাইট ৫১৭৪ পোর্টে চলে (client ৫১৭৩)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
  },
});
