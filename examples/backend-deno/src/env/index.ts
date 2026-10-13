import { defineEnv } from "@variablelab/env";
import { loadConfig } from "@variablelab/env/fs";
import { Env } from "./schema.ts";

const config = loadConfig(Env);

export const env = defineEnv({
  schema: Env,
  config,
  vars: {
    db: { URL: "DATABASE_URL" },
  },
});
