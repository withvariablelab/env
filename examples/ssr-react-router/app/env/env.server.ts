import { defineEnv } from "@variablelab/env";
import { loadConfig } from "@variablelab/env/fs";
import { ServerEnv } from "./schema.server.ts";

const config = loadConfig({ schema: ServerEnv, pattern: "app/config/{env}.ts" });

export const env = defineEnv({
  schema: ServerEnv,
  config,
  vars: {
    secrets: {
      DATABASE_URL: "DATABASE_URL",
      SESSION_SECRET: "SESSION_SECRET",
    },
    // PublicEnv lives under the `public` branch in ServerEnv but its env vars
    // are bare (`API_BASE_URL`, `APP_NAME`) so server and client read the same names.
    // `null` declares the branch as flat — no `PUBLIC_` prefix is added.
    public: null,
  },
});
