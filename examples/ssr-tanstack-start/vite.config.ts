import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { envConfig } from "@variablelab/env/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tanstackStart(), react(), envConfig()],
  server: { port: 3006, strictPort: true },
});
