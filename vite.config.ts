import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  // Expose both VITE_ and standard Vercel/Supabase environment variables
  envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_SUPABASE_'],
  server: {
    // Ensure all routes fallback to index.html — fixes "new tab" navigation in SPA
    historyApiFallback: true,
  },
})
