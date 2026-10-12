import { defineEnv } from "@variablelab/env";
import config from "#config";
import { ServerEnv } from "./schema.server.ts";

export const env = defineEnv({
  schema: ServerEnv,
  config,
  vars: {
    secrets: {
      DATABASE_URL: "DATABASE_URL",
      SESSION_SECRET: "SESSION_SECRET",
    },
    // PublicEnv leaves are bare (`API_BASE_URL`, `APP_NAME`) — `null` keeps them flat.
    public: null,
  },
});
