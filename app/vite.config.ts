import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress dynamic import chunking warnings
        if (warning.message.includes('dynamic import will not move module into another chunk')) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          ui: ['lucide-react', '@radix-ui/react-slot', 'clsx', 'tailwind-merge'],
          supabase: ['@supabase/supabase-js', '@supabase/ssr']
        }
      }
    }
  }
});
