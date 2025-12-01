// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,        // allow external access (for ngrok)
    allowedHosts: true // allow all hosts, including *.ngrok-free.dev
  }
});
