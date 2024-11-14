import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // استفاده از IPv4 به جای ::1
    port: 3000, // می‌توانید پورت دلخواه را مشخص کنید
  },
})
