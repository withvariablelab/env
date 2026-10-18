import { defineConfig } from "@playwright/test";

const PORT = 3012;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: BASE_URL },
  // No `projects` — these tests don't drive a browser. The `request` fixture
  // is HTTP-only and ignores `browserName`.
  webServer: {
    command: "bun server.cjs",
    url: `${BASE_URL}/health`,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NODE_ENV: "development",
      DATABASE_URL: "postgres://localhost/dev",
    },
  },
});
