export const SCHEMA_CODE = `import { schema, type Config } from "@variablelab/env";
import * as z from "zod";

export const Env = schema({
  server: {
    HOST: z.string(),
    PORT: z.coerce.number().int().positive()
  },
  db: {
    URL: z.string()
  },
});

export type EnvConfig = Config<typeof Env>;`;

export const WIRE_CODE = `import { defineEnv } from "@variablelab/env";
import { loadConfig } from "@variablelab/env/fs";
import { Env } from "./schema.ts";

const config = loadConfig(Env);

export const env = defineEnv({
  schema: Env,
  config,
});`;

export const OVERRIDE_CODE = `defineEnv({
  schema: Env,
  vars: {
    db: { URL: "DATABASE_URL" },
    public: {
      $: null,                   // flat branch
      APP_NAME: "PUBLIC_APP_NAME"
    },
  },
});`;

export const HERO_TABS = [
  {
    id: "schema",
    file: "src/env/schema.ts",
    code: SCHEMA_CODE,
    foot: "contract validated · 2 branches · 3 leaves",
  },
  {
    id: "wire",
    file: "src/env/index.ts",
    code: WIRE_CODE,
    foot: "wiring resolved · process.env merged · typed env emitted",
  },
] as const;

export const ENTRYPOINTS = [
  {
    pkg: "@variablelab/env",
    name: "env",
    runtime: "Any",
    tags: ["core"],
    desc: "Declare a schema. Resolve a typed env at boot.",
  },
  {
    pkg: "@variablelab/env/fs",
    name: "env/fs",
    runtime: "Node / Bun / Deno",
    tags: ["fs"],
    desc: "Discover & load per-environment config files from disk.",
  },
  {
    pkg: "@variablelab/env/vite",
    name: "env/vite",
    runtime: "Build time",
    tags: ["plugin"],
    desc: "Vite plugin: alias #config, inject envName into the bundle.",
  },
  {
    pkg: "@variablelab/env/react",
    name: "env/react",
    runtime: "SSR / SSG",
    tags: ["react"],
    desc: "<EnvScript /> ships the server-resolved env to the browser.",
  },
  {
    pkg: "@variablelab/env/zod",
    name: "env/zod",
    runtime: "Any",
    tags: ["zod"],
    desc: "Opinionated Zod primitives: port, host, bool, secret…",
  },
] as const;

export const NAMING_ROWS = [
  ["server.PORT", "SERVER_PORT"],
  ["db.URL", "DB_URL"],
  ["sessionCookie.PREFIX", "SESSION_COOKIE_PREFIX"],
  ["db.kit.LOGGING", "DB_KIT_LOGGING"],
  ["PORT", "PORT"],
] as const;

export const VALIDATORS = ["Zod", "Valibot", "ArkType", "Standard Schema"] as const;

export const RUNTIMES = ["Node", "Bun", "Deno", "Browsers", "Workers", "Edge"] as const;

export const WHY_POINTS = [
  {
    bad: ".env files duplicated per environment, secrets and defaults tangled.",
    good: "A versioned config file per environment. Secrets stay in your env vars.",
  },
  {
    bad: "process.env.PORT is a string. process.env.MISSING is undefined. Silent.",
    good: "env.server.PORT is number. Missing values throw at boot, with the dot-path.",
  },
  {
    bad: "Locked to one validator. Locked to one runtime. Locked to one bundler.",
    good: "Standard Schema in. Any runtime out. Opt-in adapters for Node, Vite, React.",
  },
] as const;

export const LANDING_META = {
  version: "v0.5.0",
  vlandUrl: "https://variable.land",
  githubUrl: "https://github.com/withvariablelab/env",
  npmUrl: "https://www.npmjs.com/package/@variablelab/env",
  docsHref: "/docs/" as string,
  publishDate: "2026",
} as const;

export const SITE_URL = "https://env.oss.variable.land";
