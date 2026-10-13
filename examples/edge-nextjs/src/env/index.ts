import { defineEnv } from "@variablelab/env";
import development from "../config/development.ts";
import production from "../config/production.ts";
import { Env } from "./schema.ts";

// No `loadConfig` here — Edge runtime doesn't have FS. Static imports get
// inlined by the bundler so the config is part of the worker bundle.
const config = process.env.NODE_ENV === "production" ? production : development;

export const env = defineEnv({
  schema: Env,
  config,
  vars: {
    db: { URL: "DATABASE_URL" },
  },
});
