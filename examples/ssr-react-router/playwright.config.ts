import { defineConfig } from "@playwright/test";

const PORT = 3005;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: BASE_URL },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "sh -c 'react-router build && react-router-serve build/server/index.js'",
    url: BASE_URL,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
    env: {
      NODE_ENV: "production",
      PORT: String(PORT),
      DATABASE_URL: "postgres://localhost/prod",
      SESSION_SECRET: "this-is-a-very-long-session-secret-1234567890",
      API_BASE_URL: "https://api.example.com",
      APP_NAME: "rr7-prod-app",
    },
  },
});
