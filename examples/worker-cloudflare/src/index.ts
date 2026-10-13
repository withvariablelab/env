import { defineEnv } from "@variablelab/env";
import { Hono } from "hono";
import { Env, type EnvBindings } from "./env/schema.ts";

// `defineEnv` runs *inside* the handler — Worker bindings (`c.env`) are
// per-request, not module-scope. The same `Env` schema validates them.
const app = new Hono<{ Bindings: EnvBindings }>()
  .get("/health", (c) => c.json({ ok: true }))
  .get("/env", (c) => {
    const env = defineEnv({
      schema: Env,
      runtimeEnv: c.env,
      vars: { db: { URL: "DATABASE_URL" } },
    });
    return c.json({ env });
  });

export default app;
