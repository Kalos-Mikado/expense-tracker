import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative assets work on localhost and GitHub Pages repository subpaths.
  base: './',
  server: { allowedHosts: ['terminal.local'] },
})
