import type { EnvConfig } from "../env/schema.ts";

export default {
  log: { LEVEL: "debug" },
  server: { PORT: 3012, HOST: "127.0.0.1" },
  db: { URL: "postgres://localhost/dev", LOGGING: true },
} satisfies EnvConfig;
