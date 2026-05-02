import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ Si tu héberges l’app dans un sous-dossier (ex: /cordeslab/),
// change base: '/cordeslab/' avant build.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
