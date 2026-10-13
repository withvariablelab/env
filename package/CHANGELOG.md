# @variablelab/env

## 0.5.2

### Patch Changes

- [#30](https://github.com/withvariablelab/env/pull/30) [`48a8c42`](https://github.com/withvariablelab/env/commit/48a8c4258b9f68775a6ff324d6fb546206efa421) Thanks [@rqbazan](https://github.com/rqbazan)! - Renamed from `@vlandoss/env`. The package now lives at [withvariablelab/env](https://github.com/withvariablelab/env) and is published as `@variablelab/env`; the API is unchanged. To migrate, swap the dependency and update the import specifiers:

  ```bash
  pnpm remove @vlandoss/env && pnpm add @variablelab/env
  ```

  ```diff
  - import { defineEnv } from "@vlandoss/env";
  - import * as e from "@vlandoss/env/zod";
  + import { defineEnv } from "@variablelab/env";
  + import * as e from "@variablelab/env/zod";
  ```

  The same applies to the `/fs`, `/vite` and `/react` entry points. The `@variablelab/env/vite` "no config file found" error message now carries the new package name.

## 0.5.1

### Patch Changes

- [#28](https://github.com/variableland/env/pull/28) [`8634e59`](https://github.com/variableland/env/commit/8634e597e332a798f752341d04745df74bc5a777) Thanks [@rqbazan](https://github.com/rqbazan)! - Clarify that the `envConfig()` Vite plugin is required for **any** non-development browser build, not just custom modes.

  In the browser, `envName()`'s `readEnv()` only reads `window.__env` — never `process.env` — so a pure SPA can't see `NODE_ENV` / `VITE_ENV`. Without the plugin's `__ENV_NAME__` inject, `envName()` falls back to `"development"` (silently shipping the dev config to every environment), regardless of the `--mode` or `VITE_ENV` used at build time. The docs and the `__ENV_NAME__` JSDoc previously stated the browser would fall back to `"production"`, which is only true on the server.

## 0.5.0

### Minor Changes

- [#26](https://github.com/variableland/env/pull/26) [`d355e6f`](https://github.com/variableland/env/commit/d355e6fc13765c12ae4cdf8b44b18b5ff1968684) Thanks [@rqbazan](https://github.com/rqbazan)! - The `envConfig()` Vite plugin can now select the env from a `VITE_ENV` env var instead of requiring `--mode`.

  The plugin reads `VITE_ENV` from `process.env` **and** your `.env*` files (via Vite's `loadEnv`, so inline/shell values win over file values) and uses it to pick the per-env `#config` file and the `__ENV_NAME__` build constant. When `VITE_ENV` is unset or empty it falls back to Vite's `mode`, so `vite build --mode staging` keeps working unchanged — this is purely additive.

  ```bash
  # These are now equivalent:
  VITE_ENV=staging vite build
  vite build --mode staging
  ```

  The var name is configurable with the new `envVar` option (default `"VITE_ENV"`):

  ```ts
  envConfig({ envVar: "APP_ENV" });
  ```

## 0.4.0

### Minor Changes

- [#24](https://github.com/variableland/env/pull/24) [`e814bfa`](https://github.com/variableland/env/commit/e814bfaf80227a5c4b11fa0341ce3725a7a9ddfc) Thanks [@rqbazan](https://github.com/rqbazan)! - Add `json` primitive to `@vlandoss/env/zod`: `e.json(schema)` decodes a
  JSON-string env var into a validated object and also accepts the decoded
  object from config files / defaults (codec `.or(schema)`, same dual-source
  pattern as `e.bool`).

## 0.3.0

### Minor Changes

- [#22](https://github.com/variableland/env/pull/22) [`fd1f5f8`](https://github.com/variableland/env/commit/fd1f5f837f3bafc2d31b7559674cdfd2b018c422) Thanks [@rqbazan](https://github.com/rqbazan)! - **`loadConfig` (`@vlandoss/env/fs`) is now synchronous.** It loads the config with `require()` and returns `Config<S>` directly instead of a `Promise`, so it works in app code **and** in config files that tooling loads via `require()` or bundles to CJS (where a top-level `await` is rejected).

  **Migration — drop the `await`:**

  ```diff
  - const config = await loadConfig(Env);
  + const config = loadConfig(Env);
  ```

  `await loadConfig(...)` still returns the right value at runtime (awaiting a non-promise yields the value), but the `await` keeps the module asynchronous — so a config file that keeps it still can't be `require()`d. Remove it.

  Auto-discovery now also covers `.cjs` / `.cts` (was: `.ts` `.mts` `.js` `.mjs` `.json`). The options form gains an optional `cwd` so callers can override `process.cwd()` when the working directory isn't the project root.

  Files are loaded with `require()`. Runtime requirements by extension:

  - `.ts` / `.mts` / `.cts` — needs native TS stripping (native in Bun/Deno, **Node ≥22.18**).
  - `.mjs` / `.js` / `.cjs` — needs `require(esm)` (native in Bun/Deno, **Node ≥22.12**).
  - `.json` — works on any supported Node.

  The package's `engines` is **Node ≥22.12** (the `require(esm)` baseline). The `.ts` strip requirement is documented per-extension; consumers using only `.json`/`.mjs`/`.cjs` configs aren't blocked by an over-broad floor.

  CJS configs (`module.exports = {...}`): a CJS exports object that owns a `default` property name is **no longer** silently stripped — `loadConfig` discriminates ESM namespaces by `Symbol.toStringTag === "Module"` and returns CJS exports as-is, so sibling keys survive.

## 0.2.1

### Patch Changes

- [#11](https://github.com/variableland/env/pull/11) [`91534e9`](https://github.com/variableland/env/commit/91534e97f2995602c8b48e36cddb67a76874c73a) Thanks [@rqbazan](https://github.com/rqbazan)! - Drop the `type-fest` dependency. `PartialDeep` is now defined locally in `src/lib/types.ts` with an equivalent shape, so the public surface of `Config<S>` and `Defaults<S>` is unchanged. One fewer transitive dep for consumers.

## 0.2.0

### Minor Changes

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - **BREAKING** Rename `<ClientEnv />` (in `@vlandoss/env/react`) to `<EnvScript />`. The new name stops suggesting client-side use and reflects what the component actually does: emit a `<script>` tag with the server-resolved env so the browser can read it during SSR or SSG hydration. The entrypoint path (`@vlandoss/env/react`) is unchanged. The wire format is also unchanged: the DOM `id="env"` and `window.__env` global stay identical, so HTML served by an older build continues to hydrate correctly.

  Renames included:

  - Component: `ClientEnv` → `EnvScript`
  - Props: `ClientEnvProps` → `EnvScriptProps`
  - Constants: `CLIENT_ENV_SCRIPT_ID` → `ENV_SCRIPT_ID`, `CLIENT_ENV_GLOBAL_ID` → `ENV_GLOBAL_ID`

  Migration: replace `<ClientEnv …>` with `<EnvScript …>`. If you imported the constants from the core entrypoint, update those imports too.

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - **BREAKING** Rename `@vlandoss/env/node` to `@vlandoss/env/fs`. The entrypoint has always been about file-system access on a Node-compatible runtime — the new name reflects that it works on Node, Bun, and Deno (not just Node), and that it does not work on Workers/Edge. The dynamic-import path resolution now uses `pathToFileURL` so Deno can load absolute paths correctly.

  Migration: replace `from "@vlandoss/env/node"` with `from "@vlandoss/env/fs"`.

### Patch Changes

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - Replace `lodash.merge` with [`defu`](https://github.com/unjs/defu) for the internal merge that combines `defaults + config + envOverride`. The precedence (env > config > defaults) is unchanged.

  This fixes a silent shallow-merge regression on V8 isolate runtimes (Cloudflare Workers, Vercel Edge, Next.js Edge): `lodash.merge` relies on `isPlainObject`, which returns `false` when the object originates from a different realm than the merger. The fallback path then assigns by reference instead of deep-merging, which caused leaf values present in `config` (e.g. `db.LOGGING: true`) to be dropped whenever `envOverride` touched the same parent branch.

  defu is realm-agnostic and reliably deep-merges in all the runtimes supported by the core.

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - Polish the package README to match the new docs site language — soften technical references to `process.env`, separate the optional `zod` install, and align the tagline with the rest of the documentation.

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - `readEnv()` no longer throws `ReferenceError` on runtimes where `process` is not defined (e.g. Cloudflare Workers without `nodejs_compat`). It now returns `{}` so callers can supply the environment explicitly via `defineEnv({ runtimeEnv })` — the idiomatic pattern in Worker `fetch(req, env, ctx)` handlers. Behavior on Node, Bun, Deno, browsers, and Edge runtimes that polyfill `process.env` is unchanged.

## 0.1.2

### Patch Changes

- [#4](https://github.com/variableland/env/pull/4) [`4e05752`](https://github.com/variableland/env/commit/4e057523eed79ff2b2228d8e38a3353f811d4fba) Thanks [@rqbazan](https://github.com/rqbazan)! - Slim down package README and move full documentation to the new Fumadocs site

## 0.1.1

### Patch Changes

- [#2](https://github.com/variableland/env/pull/2) [`f2d9b91`](https://github.com/variableland/env/commit/f2d9b9179327dab8d3e1d0e77a7766840244501e) Thanks [@rqbazan](https://github.com/rqbazan)! - - Fix `homepage` URL in `package.json` after flattening the monorepo (`packages/env` → `package`).
  - Add `keywords` to `package.json` for npm discoverability.

## 0.1.0

### Minor Changes

- [`42c6eb7`](https://github.com/variableland/env/commit/42c6eb7ea8f81b3a315bc52235fb52856c893eeb) Thanks [@rqbazan](https://github.com/rqbazan)! - Initial public release of `@vlandoss/env` under the `@vlandoss` scope.

  Contract-first environment configuration with typed schemas:

  - `@vlandoss/env` — runtime-agnostic core (`schema`, `defineEnv`, `envName`, `readEnv`).
  - `@vlandoss/env/node` — `loadConfig` with auto-discovery or `{env}` template.
  - `@vlandoss/env/vite` — `envConfig` Vite plugin (`#config` alias + `__ENV_NAME__` build-time inject).
  - `@vlandoss/env/react` — `<ClientEnv />` for SSR/SSG.
  - `@vlandoss/env/zod` — opt-in opinionated Zod primitives (`port`, `host`, `bool`, `logLevel`, `secret`).
