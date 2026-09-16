import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Help-VIP সাইট — আলাদা অ্যাপ, ৫১৭৫ পোর্টে
// (client 5173, affiliate 5174, admin 5175, white-label admin 5176)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5175, strictPort: true },
});
