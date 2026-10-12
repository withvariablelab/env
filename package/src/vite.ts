import { statSync } from "node:fs";
import path from "node:path";
import { loadEnv, type Plugin } from "vite";
import { BUILD_TIME_ENV_NAME_ID } from "./lib/const.ts";

const EXTENSIONS = [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs", ".json"];
const DIRS = ["config", "src/config"];

/** Env var the resolved env name is read from before falling back to Vite's `mode`. */
const DEFAULT_ENV_VAR = "VITE_ENV";

/**
 * Rollup virtual-module id (the leading `\0` prevents other plugins from
 * trying to read it from disk) used as a placeholder when no config file
 * matches the current env. The error is deferred until something actually
 * imports `#config` — see `load()` below.
 */
const VIRTUAL_MISSING_ID = "\0variableland-env-config:missing";

function findConfigFile(env: string, cwd: string): string | undefined {
  for (const ext of EXTENSIONS) {
    for (const dir of DIRS) {
      const candidate = path.join(cwd, dir, `${env}${ext}`);
      try {
        if (statSync(candidate).isFile()) return candidate;
      } catch {
        // not found, continue
      }
    }
  }
  return undefined;
}

/**
 * Resolve the env name the plugin keys off. Reads `envVar` (default `VITE_ENV`)
 * from `process.env` **and** the `.env*` files under `cwd` — Vite's `loadEnv`
 * merges both, with inline/shell values taking precedence — and falls back to
 * Vite's `mode` when the var is unset or empty. Passing the full var name as
 * the prefix scopes the file scan to just that one key.
 */
function resolveEnvName(envVar: string, mode: string, cwd: string): string {
  return loadEnv(mode, cwd, envVar)[envVar] || mode;
}

export type EnvConfigOptions = {
  /** Alias the per-env config file is exposed as. Default: `"#config"`. */
  alias?: string;
  /** Base directory for the discovery search. Default: `process.cwd()`. */
  cwd?: string;
  /**
   * Env var that selects the env name, read from `process.env` and `.env*`
   * files. When unset (or empty) the plugin falls back to Vite's `mode`, so
   * `--mode` keeps working unchanged. Default: `"VITE_ENV"`.
   */
  envVar?: string;
};

/**
 * Vite plugin that:
 *
 * 1. Resolves an alias (`#config` by default) to the config file matching the
 *    current env name. The env name comes from `VITE_ENV` (configurable via
 *    `envVar`), falling back to Vite's `mode` — so `VITE_ENV=staging vite build`
 *    and `vite build --mode staging` are equivalent, and you no longer have to
 *    thread `--mode` through every command. Discovery is
 *    `[src/]config/<env>.{ts,mts,cts,js,mjs,cjs,json}` — same algorithm as
 *    `loadConfig` in `@variablelab/env/fs`. Only the matched file enters the bundle.
 * 2. Injects `define: { __ENV_NAME__: JSON.stringify(env) }`. The core's
 *    `envName()` reads this identifier so dynamic-import and alias patterns
 *    alike return the correct env in the browser — including custom envs
 *    like `staging` or `qa`, which Vite forces `NODE_ENV="production"` for.
 *
 * When no config file matches the current env, the plugin still registers
 * everything correctly (the `__ENV_NAME__` inject keeps working for the
 * dynamic-import pattern that doesn't use `#config`). The alias resolves to
 * a virtual module that throws a descriptive error **only when imported** —
 * so tools that load the Vite config without touching `#config` (Vitest's
 * IDE-driven discovery, third-party plugins introspecting the config) don't
 * trip over a config-time error.
 *
 * @example
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { envConfig } from "@variablelab/env/vite";
 *
 * export default defineConfig({ plugins: [envConfig()] });
 *
 * // Pick the env without --mode:
 * //   VITE_ENV=staging vite build
 *
 * // src/env/index.ts
 * import config from "#config";
 * import { defineEnv } from "@variablelab/env";
 * import { Env } from "./schema";
 *
 * export const env = defineEnv({ schema: Env, config });
 */
export function envConfig(options: EnvConfigOptions = {}): Plugin {
  const alias = options.alias ?? "#config";
  const cwd = options.cwd ?? process.cwd();
  const envVar = options.envVar ?? DEFAULT_ENV_VAR;
  let resolvedEnv = "";

  return {
    name: "variableland-env-config",
    config(_userConfig, { mode }) {
      resolvedEnv = resolveEnvName(envVar, mode, cwd);
      const file = findConfigFile(resolvedEnv, cwd);
      return {
        resolve: {
          alias: {
            [alias]: file ?? VIRTUAL_MISSING_ID,
          },
        },
        define: {
          [BUILD_TIME_ENV_NAME_ID]: JSON.stringify(resolvedEnv),
        },
      };
    },
    resolveId(id) {
      if (id === VIRTUAL_MISSING_ID) return VIRTUAL_MISSING_ID;
      return undefined;
    },
    load(id) {
      if (id === VIRTUAL_MISSING_ID) {
        throw new Error(
          `@variablelab/env/vite: no config file found for env "${resolvedEnv}" — searched [src/]config/${resolvedEnv}.{ts,mts,cts,js,mjs,cjs,json} under ${cwd}`,
        );
      }
      return undefined;
    },
  };
}
