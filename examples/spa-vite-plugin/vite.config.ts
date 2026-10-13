import { envConfig } from "@variablelab/env/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), envConfig()],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
