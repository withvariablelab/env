/**
 * DOM `id` attribute of the `<script type="application/json">` tag that
 * `<EnvScript />` (from `@variablelab/env/react`) writes during SSR. On the
 * browser side, `readEnv()` queries the document for this id, parses the
 * tag's `textContent` as JSON, and returns it as the runtime env.
 *
 * Treat as a wire-format constant: changing it is a breaking change for any
 * page that already served HTML from an older server build.
 */
export const ENV_SCRIPT_ID = "env";

/**
 * Property on `window` that `readEnv()` checks first when running in the
 * browser. Two ways it gets populated:
 *
 * 1. After `readEnv()` parses the `<script id="env">` tag once, the resulting
 *    plain object is cached here so subsequent reads skip the parse.
 * 2. Hosts that don't use `<EnvScript />` (pure SPAs, embedded widgets) can
 *    assign `window.__env = {...}` themselves before any app code runs to
 *    seed the env directly.
 *
 * Always a plain object — `readEnv()` rejects anything else.
 */
export const ENV_GLOBAL_ID = "__env";

/**
 * Identifier that the `envConfig()` Vite plugin replaces at build time with
 * the literal `mode` string (e.g. `"production"`, `"staging"`). `envName()`
 * reads it as a fallback so dynamic-import and `#config`-alias patterns alike
 * return the right env name in the browser without manual `runtimeEnv` plumbing.
 *
 * Sits **between** `env.ENV` (explicit runtime override) and `env.NODE_ENV` in
 * `envName()`'s precedence chain. In the browser it's the only source `envName()`
 * has: `readEnv()` reads `window.__env`, never `process.env`, so a pure SPA sees
 * no `NODE_ENV` / `VITE_ENV` and falls back to `"development"` without this inject.
 * That's why the plugin is required for any non-development browser build — not
 * just custom modes like `staging` / `qa` (which Vite would otherwise flatten by
 * forcing `NODE_ENV="production"` regardless of `--mode`).
 */
export const BUILD_TIME_ENV_NAME_ID = "__ENV_NAME__";
