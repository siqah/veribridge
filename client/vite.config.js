import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Supabase client
          supabase: ["@supabase/supabase-js"],
          // PDF and utility libraries
          "pdf-utils": ["jspdf", "qrcode", "tesseract.js"],
          // UI components
          "ui-libs": ["lucide-react"],
        },
      },
    },
    // Increase chunk size warning limit to 600KB (current size)
    // We'll reduce this after implementing lazy loading
    chunkSizeWarningLimit: 600,
  },
});
