import type { EnvConfig } from "../env/schema.ts";

export default {
  log: { LEVEL: "info" },
  server: { PORT: 3012, HOST: "0.0.0.0" },
  db: { LOGGING: false },
} satisfies EnvConfig;
