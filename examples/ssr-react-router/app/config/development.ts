import type { ServerEnvConfig } from "../env/schema.server.ts";

export default {
  server: { PORT: 3005, HOST: "127.0.0.1" },
  public: {
    API_BASE_URL: "http://localhost:3001/dev-api",
    APP_NAME: "rr7-dev-app",
  },
} satisfies ServerEnvConfig;
