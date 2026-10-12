import { defineEnv } from "@variablelab/env";
import { loadConfig } from "@variablelab/env/fs";
import { Env } from "./schema.ts";

export const env = defineEnv({
  schema: Env,
  config: loadConfig(Env),
  vars: {
    db: { URL: "DATABASE_URL" },
  },
});
