import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// AI food detection plugin kept for future use (see server/foodDetection.js)
// import { foodDetectionPlugin } from './server/foodDetection.js'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
