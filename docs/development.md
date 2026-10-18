# Development

How to set up, work in, and ship from this monorepo. For contribution conventions (branches, commits, changesets, PR flow), see [contributing.md](./contributing.md).

## What's in here

```
env/
├── package/             # @variablelab/env library — published to npm
├── docsite/             # Fumadocs site → lab.variable.land/env/docs (Cloudflare Workers)
├── examples/            # 12 runtime-isolated demos (Node, Bun, Deno, Workers, Edge, Vite, SSR)
├── docs/                # Repository docs (contributing.md, development.md)
├── mise.toml            # Tool versions + task orchestration
├── mise.lock            # Locked tool versions + checksums (each example has its own)
├── pnpm-workspace.yaml  # Workspace for `package` + `docsite` only
├── lefthook.yml         # Git hooks (jscheck on commit, tests on push)
└── biome.json           # Root biome config (excludes examples/**)
```

There are two layers, by design:

- **The pnpm workspace** (`package` + `docsite`) — these two are siblings and share the catalog'd dependency versions.
- **The runtime-isolated examples** (`examples/*`) — each one declares its own runtime, brings its own package manager (pnpm / bun / deno), has its own lockfile, and consumes `@variablelab/env` from a packed tarball. They are **not** part of the pnpm workspace; they're orchestrated by mise.

This split is intentional: the library promises runtime-agnosticism, and the examples have to prove that. An example that secretly resolves through a shared pnpm workspace doesn't actually demonstrate it works in Bun or Deno.

## Prerequisites

You need [**mise**](https://mise.jdx.dev) (≥ 2025.5.0). It bootstraps everything else — Node, pnpm, bun, deno are all installed and pinned by mise.

```sh
curl https://mise.run | sh
# or: brew install mise / pacman -S mise / etc.
```

> **First time using mise?** It activates by adding a hook to your shell rc. Follow the [mise install docs](https://mise.jdx.dev/getting-started.html) — once activated, every project tool magically resolves to the version pinned in the relevant `mise.toml`.

You'll also be prompted by mise to "trust" the per-example `mise.toml` files the first time you `cd` into them. Run `mise trust` when it asks.

## Setup from scratch

```sh
git clone git@github.com:withvariablelab/env.git
cd env
mise install        # node + pnpm
mise run setup      # ↓ runs the bootstrap chain
```

`mise run setup` runs the following steps in order:

1. `mise install` — installs the root tools.
2. `for d in examples/*/; do mise install -C "$d"; done` — installs each example's runtime (bun, deno, etc.). `mise install` doesn't accept monorepo globs, so the loop stays.
3. `pnpm install` — workspace deps for `package` + `docsite`.
4. `mise run "//examples/...:setup"` — runs each example's `setup` task in parallel (resolved via `[monorepo].config_roots`). Each `setup` declares `depends = ["//:env:pack"]`, so mise dedupes `env:pack` to a single execution before the example installs.
5. `mise run playwright:install` — fetches Chromium for the SPA / SSR e2e suites.

End state: every example has its own `node_modules/`, its own lockfile, and a freshly installed copy of `@variablelab/env` extracted from the tarball.

## Working on the library (`package/`)

The library uses [tsdown](https://tsdown.dev) for the build and [vitest](https://vitest.dev) for unit tests.

```sh
mise run lib:test       # unit tests
mise run lib:build      # emits dist/
mise run check          # JS & TS check across package + docsite
```

If you're hacking inside `package/`, the library's own `package.json` exposes the underlying scripts — those are what `mise run lib:*` and `mise run check` ultimately call.

### Iterating with the examples

When you change `package/src/`, the examples need to see the new code. The flow:

```sh
mise run env:pack              # rebuild + repack the tarball
mise run examples:bump         # reinstall the tarball in every example
```

Each example's `setup` task declares `depends = ["//:env:pack"]` (with `sources` / `outputs` declared on `env:pack` itself), so any of these will pull in the latest tarball automatically:

```sh
mise run //examples/backend-node:test:e2e
mise run //examples/backend-bun:start
```

For an active edit loop (rebuild on every save, push to all examples):

```sh
mise run env:watch
# in another terminal
mise run //examples/backend-node:start
```

`env:watch` runs `tsdown --watch` plus a chokidar that pipes into `env:pack` + `examples:bump`.

## Working on the docs (`docsite/`)

The docs are a [TanStack Start](https://tanstack.com/start) + [Fumadocs](https://fumadocs.dev) app deployed to Cloudflare Workers.

```sh
mise run docsite        # local dev server
```

Anything beyond dev (production build, deploy, preview) lives as `pnpm` scripts inside `docsite/package.json` — `cd docsite && pnpm build` / `pnpm deploy` / `pnpm preview`. Those are docs-specific deployment workflows; we haven't promoted them to mise tasks because they don't cross repo boundaries.

Content lives in `docsite/content/docs/` as MDX. Read [`docsite/README.md`](../docsite/README.md) for the full layout (routes, llms.txt endpoints, the `*.mdx` content negotiation trick, etc.).

## Working on the examples (`examples/*`)

Every example has the same task vocabulary, so you can `cd` into any of them and run:

```sh
mise run setup          # pack env + install deps (uses the example's native PM)
mise run reinstall      # force-reinstall the env tarball
mise run start          # run the server / dev server
mise run test:e2e       # Playwright
mise run check          # JS & TS check
```

Or invoke from the repo root with the `//path:task` syntax:

```sh
mise run //examples/spa-vite-plugin:dev
mise run //examples/worker-cloudflare:test:e2e
```

### How `@variablelab/env` is consumed

Every example declares the dependency as a local file tarball:

```jsonc
"@variablelab/env": "file:../../package/.local/variablelab-env.tgz"
```

The tarball is generated by `mise run env:pack` (which calls `pnpm pack` inside `package/`). This guarantees each example consumes the package **as published** — same `files`, same `publishConfig.exports`, same peerDeps.

### The 12 examples

| Example                                                  | Runtime                                  | PM   | Why                                                                |
| -------------------------------------------------------- | ---------------------------------------- | ---- | ------------------------------------------------------------------ |
| [`backend-node`](../examples/backend-node)                | Node 24                                  | pnpm | Plain Node server                                                  |
| [`backend-bun`](../examples/backend-bun)                  | Bun 1.2.4                                | bun  | Native Bun consumer                                                |
| [`backend-deno`](../examples/backend-deno)                | Deno 2 (server) + Node 24 (test runner)  | bun  | Deno can't extract `file:` tarballs natively — we use `bun install` to hydrate `node_modules/` (flat layout) and let Deno read it via `nodeModulesDir: "manual"` |
| [`backend-node-cjs`](../examples/backend-node-cjs)        | Node 24                                  | pnpm | `loadConfig` (sync) — server booted from a CommonJS `require()` entry |
| [`backend-bun-cjs`](../examples/backend-bun-cjs)          | Bun 1.2.4                                | bun  | `loadConfig` (sync) under a Bun CommonJS `require()` entry          |
| [`backend-deno-cjs`](../examples/backend-deno-cjs)        | Deno 2 (server) + Node 24 (test runner)  | bun  | `loadConfig` (sync) under a Deno CommonJS `require()` entry         |
| [`worker-cloudflare`](../examples/worker-cloudflare)      | Cloudflare Workers                       | pnpm | Validates `runtimeEnv: c.env` per-request; no `nodejs_compat` flag |
| [`edge-nextjs`](../examples/edge-nextjs)                  | Next.js Edge                             | pnpm | Validates the Edge runtime path                                    |
| [`spa-vite-plugin`](../examples/spa-vite-plugin)          | Vite + React                             | pnpm | `envConfig()` plugin + `#config` alias                             |
| [`spa-vite-dynamic`](../examples/spa-vite-dynamic)        | Vite + React                             | pnpm | Dynamic `import()` pattern                                         |
| [`ssr-react-router`](../examples/ssr-react-router)        | React Router 7                           | pnpm | `<EnvScript />` SSR / hydration                                    |
| [`ssr-tanstack-start`](../examples/ssr-tanstack-start)    | TanStack Start                           | pnpm | `<EnvScript />` via TanStack Start                                 |

The `backend-*`, `worker-*`, and `edge-nextjs` examples drive Playwright in HTTP-only mode (the `request` fixture). The 4 SPA / SSR examples drive a real Chromium browser — they need `mise run playwright:install` first (already part of `setup`).

### Adding a new example

The full step-by-step is in [contributing.md](./contributing.md#adding-a-new-example). The shape is:

1. New dir under `examples/<name>/`.
2. `package.json` with `"@variablelab/env": "file:../../package/.local/variablelab-env.tgz"` and the runtime's flavor of devDeps (e.g. `@types/bun` for Bun, `@types/deno` for Deno).
3. `mise.toml` with `[tools]` and the standard tasks. Copy from the closest existing example.
4. `biome.json` extending `@rrlab/biome-config` (skip for Deno-only).
5. Add the path to `[monorepo].config_roots` in the root [`mise.toml`](../mise.toml).
6. Add a row to the matrix in [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml).
7. Update the table in [`examples/README.md`](../examples/README.md).
8. `mise run setup` from the new dir — commit the generated lockfile.
9. `mise lock` for every platform from the new dir — commit its `mise.lock` (CI installs tools with `--locked`).

## mise tasks reference

Run `mise tasks` from anywhere in the repo to see what's available. The core ones:

### Root tasks (in [`mise.toml`](../mise.toml))

| Task                        | What it does                                                                  |
| --------------------------- | ----------------------------------------------------------------------------- |
| `setup`                     | Bootstrap everything (tools, root deps, tarball, examples, Playwright).       |
| `env:pack`                  | Build `@variablelab/env` and pack it into `package/.local/variablelab-env.tgz`.     |
| `env:watch`                 | Watch `package/src/`, repack on change, reinstall in every example.           |
| `playwright:install`        | Install Chromium for Playwright (one-time, idempotent).                       |
| `lib:test`                  | Unit tests for `@variablelab/env`.                                               |
| `lib:build`                 | Build `@variablelab/env`.                                                        |
| `check`                     | JS & TS check across the workspace (`package` + `docsite`).                   |
| `test:e2e`                  | Run e2e for every example.                                                    |
| `examples:check`            | JS & TS check across every example.                                           |
| `examples:bump`             | `reinstall` the tarball in every example.                                     |

### Per-example tasks (uniform across every `examples/*/mise.toml`)

| Task          | What it does                                                              |
| ------------- | ------------------------------------------------------------------------- |
| `setup`       | Pack env + install deps with the example's native PM (depends on `//:env:pack`).            |
| `reinstall`   | Force-reinstall the env tarball.                                            |
| `start`       | Run the server (or `dev` / `build` / `preview` for the Vite-based ones).    |
| `test:e2e`    | Playwright.                                                                 |
| `check`       | JS & TS check.                                                              |

## Why mise is the only API

The root `package.json` carries no scripts. Every operation that crosses repo boundaries — running a workspace check, packing the lib, installing every example, running the e2e matrix — is a `mise run <task>`. Two reasons:

1. **One way to do each thing.** `pnpm setup` and `mise run setup` doing the same thing was just noise — devs had to remember which to type, and the docs had to mention both.
2. **CI and devs share a single contract.** What you type locally is the same thing CI runs (`mise run lib:test`, `mise run test:e2e`, …). No drift between `package.json` scripts and a separate CI command list.

The `package/` and `docsite/` workspaces still expose plain `pnpm test` / `pnpm dev` / etc. inside their own `package.json` — those scripts are what the mise tasks ultimately delegate to. They're internal to each subproject; you only see them if you `cd` into the subproject and run `pnpm <script>` directly. That's fine — it's the right API at that scope.

Same for the per-example `mise.toml`: when you `cd` into `examples/<name>`, the right API is `mise run <task>` (no `pnpm` script duplicates).

## Git hooks (lefthook)

[`lefthook.yml`](../lefthook.yml) runs:

- **pre-commit** (parallel):
  - `pnpm rr jscheck --fix-staged` — biome on staged files
  - `pnpm --filter=@variablelab/env test:types` — only when staged files match `package/**/*.{ts,tsx}` or `package/tsconfig.json`
- **pre-push**: `pnpm --filter=@variablelab/env test`

These hooks intentionally skip the examples — they take long enough that we only run them in CI.

## CI

Two GitHub Actions workflows:

- [`ci.yml`](../.github/workflows/ci.yml) — the lib + docs pipeline. Static checks, unit tests, build. Also runs the Changesets release job on `main`.
- [`e2e.yml`](../.github/workflows/e2e.yml) — a matrix job per example. Each job sets up its own runtime via `jdx/mise-action` v4.3.0 (with `working_directory: examples/<name>`) and runs `mise run //examples/<name>:test:e2e`.

Both use the experimental mise monorepo feature (`MISE_EXPERIMENTAL=1`).

## Troubleshooting

### `mise ERROR Config files in ... are not trusted`

The first time you `cd` into a new example, mise won't run its tasks until you trust the file. Run:

```sh
mise trust path/to/mise.toml
```

### `task not found: env:pack`

Inside the monorepo task execution context, root tasks are namespaced as `//:env:pack` (with the `//` prefix). The per-example `install` tasks already use this prefix:

```toml
depends = ["//:env:pack"]
```

If you're writing a new task and hit this error, use the `//:` prefix.

### Fanning out a task across every example

Use mise's monorepo glob — it resolves against `[monorepo].config_roots` and runs in parallel (controlled by `MISE_JOBS`):

```toml
run = "mise run \"//examples/...:test:e2e\""
```

Avoid `for d in examples/*/; do ...; done` — it's sequential and predates this feature. The one place a bash loop still makes sense is `mise install -C "$d"` for per-example tool installs (bun, deno, etc.), since `mise install` doesn't accept the monorepo glob.

### pnpm tries to install across the whole monorepo from inside an example

Because the example dirs sit *inside* the same directory tree as `pnpm-workspace.yaml`, pnpm thinks they're workspace members. They're not — but pnpm needs an explicit `--ignore-workspace` to honor that. The 6 pnpm-based examples already pass it in their `setup` tasks; if you're adding a new pnpm-based example, do the same.

### Deno can't import `@variablelab/env` from the tarball

Deno's own package manager (`deno install`, `deno add`) doesn't extract local `file:` tarballs — both `nodeModulesDir: "auto"` and `"manual"` modes leave `node_modules/@variablelab/env` as a dangling symlink to the `.tgz` file. So we use `bun install` to hydrate `node_modules/` (bun extracts the tarball into a flat layout that Deno's `nodeModulesDir: "manual"` can walk). Deno still owns the runtime — bun is only there to do what `deno install` doesn't yet do for local tarballs. See [`examples/backend-deno/deno.jsonc`](../examples/backend-deno/deno.jsonc) and the comment inside.

### `package/.local/variablelab-env.tgz` is missing

Run `mise run env:pack` (or `mise run setup` from cold). The directory is gitignored so it doesn't exist on a fresh clone until you run the pack task.

### My change to `package/src/` isn't visible in an example

The example caches the install based on `sources` (including the tarball). Force a refresh:

```sh
mise run //examples/<name>:reinstall
# or, for everything at once:
mise run examples:bump
```

### CI passes but local fails (or vice versa)

Make sure your local mise version is current (`mise self-update`) and that you ran `mise install` from the root **and** the example. CI uses `jdx/mise-action` v4.3.0 with `working_directory: examples/<name>` to ensure both layers are provisioned.
