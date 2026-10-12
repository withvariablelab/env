import { defineEnv, envName } from "@variablelab/env";
import { Env } from "./schema.ts";

export const env = await defineEnv({
  schema: Env,
  config: import(`../config/${envName()}.ts`),
});
