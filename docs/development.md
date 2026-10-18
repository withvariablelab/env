# Development

How to set up, work in and ship from the env monorepo. The [contributing guide](contributing.md) covers how a change gets in: branches, commits, changesets and pull requests.

## Layout

```
env/
├── package/             # @variablelab/env library, published to npm
├── docsite/             # Fumadocs site → lab.variable.land/env/docs (Cloudflare Workers)
├── examples/            # Runtime-isolated demos (Node, Bun, Deno, Workers, Edge, Vite, SSR)
├── docs/                # Repository docs (contributing.md, development.md)
├── mise.toml            # Tool versions + task orchestration
├── mise.lock            # Locked tool versions + checksums (each example has its own)
├── pnpm-workspace.yaml  # Workspace for `package` + `docsite` only
├── lefthook.yml         # Git hooks (Biome and the type check on commit, tests on push)
└── biome.json           # Root biome config (excludes examples/**)
```

There are two layers, by design:

- **The pnpm workspace** (`package` + `docsite`): the two are siblings and share the dependency versions in the catalog.
- **The runtime-isolated examples** (`examples/*`): each one declares its own runtime, brings its own package manager (pnpm, bun or deno), has its own lockfile, and consumes `@variablelab/env` from a packed tarball. They are not part of the pnpm workspace: mise orchestrates them.

The split is intentional: the library promises to be runtime-agnostic, and the examples have to prove it. An example that resolves through a shared pnpm workspace doesn't show that the library works in Bun or Deno.

## Setup

### mise

You need [mise](https://mise.jdx.dev) 2026.6.6 or later, the `min_version` in [`mise.toml`](../mise.toml). It installs and pins everything else: Node and pnpm at the root, and bun or deno in the examples that use them.

```sh
curl https://mise.run | sh
# or: brew install mise / pacman -S mise / etc.
```

mise activates through a hook in your shell rc: follow the [mise install docs](https://mise.jdx.dev/getting-started.html). Once it is active, each tool resolves to the version pinned in the relevant `mise.toml`.

The first time you `cd` into an example, mise asks you to trust its `mise.toml`. Run `mise trust` when it asks.

### From scratch

```sh
git clone git@github.com:withvariablelab/env.git
cd env
mise install        # node + pnpm
mise run setup      # ↓ runs the bootstrap chain
```

`mise run setup` runs these steps in order:

1. `mise install`: installs the root tools.
2. `for d in examples/*/; do mise install -C "$d"; done`: installs each example's runtime (bun, deno and so on). `mise install` doesn't accept monorepo globs, so the loop stays.
3. `pnpm install`: the workspace dependencies for `package` + `docsite`.
4. `mise run "//examples/...:setup"`: runs each example's `setup` task in parallel, resolved through `[monorepo].config_roots`. Each `setup` declares `depends = ["//:env:pack"]`, so mise runs `env:pack` once before the examples install.
5. `mise run playwright:install`: fetches Chromium for the SPA and SSR e2e suites.

At the end, every example has its own `node_modules/`, its own lockfile, and a fresh copy of `@variablelab/env` extracted from the tarball.

## Tasks

The everyday commands:

```sh
mise run docsite     # docs site dev server
mise run lib:test    # unit tests for @variablelab/env
mise run lib:build   # build @variablelab/env
mise run check       # JS & TS check across package + docsite
mise run test:e2e    # the e2e suite of every example
```

Run `mise tasks` from anywhere in the repo to see the full list.

### Root tasks (in [`mise.toml`](../mise.toml))

| Task                        | What it does                                                                  |
| --------------------------- | ----------------------------------------------------------------------------- |
| `setup`                     | Bootstrap everything (tools, root deps, tarball, examples, Playwright).       |
| `env:pack`                  | Build `@variablelab/env` and pack it into a tarball in `package/.local/`.     |
| `env:watch`                 | Watch `package/src/`, repack on change, reinstall in every example.           |
| `playwright:install`        | Install Chromium for Playwright (one-time, idempotent).                       |
| `docsite`                   | Start the docs site dev server.                                               |
| `lib:test`                  | Unit tests for `@variablelab/env`.                                            |
| `lib:build`                 | Build `@variablelab/env`.                                                     |
| `check`                     | JS & TS check across the workspace (`package` + `docsite`).                   |
| `test:e2e`                  | Run e2e for every example.                                                    |
| `examples:check`            | JS & TS check across every example.                                           |
| `examples:bump`             | `reinstall` the tarball in every example.                                     |

### Per-example tasks (the same in every `examples/*/mise.toml`)

| Task          | What it does                                                                         |
| ------------- | ------------------------------------------------------------------------------------ |
| `setup`       | Pack env and install deps with the example's own package manager (depends on `//:env:pack`). |
| `reinstall`   | Force-reinstall the env tarball.                                                     |
| `start`       | Run the server (or `dev`, `build` and `preview` in the Vite-based ones).             |
| `test:e2e`    | Playwright.                                                                          |
| `check`       | JS & TS check.                                                                       |

### Why mise is the only API

The root `package.json` carries no scripts. Every operation that crosses the repo, such as a workspace check, packing the library, installing every example or running the e2e matrix, is a `mise run <task>`. Two reasons:

1. **One way to do each thing.** With `pnpm setup` and `mise run setup` doing the same thing, people had to remember which to type, and the docs had to mention both.
2. **CI and people share one contract.** What you type locally is what CI runs (`mise run lib:test`, `mise run test:e2e` and so on). There is no drift between `package.json` scripts and a separate list of CI commands.

The `package/` and `docsite/` workspaces still have plain scripts in their own `package.json`, such as `pnpm test` or `pnpm dev`, and the mise tasks run the same commands: `docsite` runs `pnpm --filter=docsite dev`, and `lib:test` runs `vitest run`, as `pnpm test` does in `package/`. Those scripts are internal to each subproject: you only use them after you `cd` into it. That is the right API at that scope.

The same goes for each example's `mise.toml`: inside `examples/<name>`, the API is `mise run <task>`, with no `pnpm` scripts that repeat it.

## CI

### Workflows

On every pull request to `main`:

- **CI** ([`ci.yml`](../.github/workflows/ci.yml)): the library and docs pipeline, inside the pnpm workspace (`package` + `docsite`). It runs `mise run check`, `mise run lib:test` and `mise run lib:build`. On `main`, it also runs the Changesets release job, and for a `feat/*` or `fix/*` branch, or a pull request with the `preview` label, it publishes a [preview release](contributing.md#preview-releases).
- **E2E** ([`e2e.yml`](../.github/workflows/e2e.yml)): a matrix job per example, when the pull request touches `examples/`, `package/`, the workflow itself, the pnpm lockfile or workspace, or the root mise files. Each job sets up its own runtime with `jdx/mise-action` v4.3.0 (with `working_directory: examples/<name>`), packs the library with `mise run env:pack`, and runs `mise run //examples/<name>:test:e2e`.
- **Workflow audit** ([`workflow-audit.yml`](../.github/workflows/workflow-audit.yml)): zizmor on the workflows in `.github/`.

CI and E2E use the experimental mise monorepo feature (`MISE_EXPERIMENTAL=1`).

Outside pull requests:

- **Dependency audit** ([`dependency-audit.yml`](../.github/workflows/dependency-audit.yml)): every Monday, an audit of every lockfile in the repo. It keeps an issue labeled `dependency-audit` open while it finds known vulnerabilities.
- **Docsite** ([`docsite.yml`](../.github/workflows/docsite.yml)): a Lighthouse SEO audit of the docs site, run by hand.

### Git hooks

[`lefthook.yml`](../lefthook.yml) runs:

- **pre-commit**, in parallel:
  - `pnpm rr jscheck --fix-staged`: Biome on the staged files.
  - `pnpm rr tsc`: the type check, only when staged files match `{package,docsite}/**/*.{ts,tsx}` or `{package,docsite}/tsconfig.json`.
- **pre-push**: `pnpm --filter=@variablelab/env test`.

The hooks skip the examples on purpose: they take long enough that only CI runs them.

## Working on the library (`package/`)

The library uses [tsdown](https://tsdown.dev) for the build and [vitest](https://vitest.dev) for unit tests.

```sh
mise run lib:test       # unit tests
mise run lib:build      # emits dist/
mise run check          # JS & TS check across package + docsite
```

Inside `package/`, the library's own `package.json` has the same commands as scripts: `pnpm test` runs `vitest run`, as `mise run lib:test` does, and `prepublishOnly` runs `rr pack`, as `mise run lib:build` does.

### Iterating with the examples

When you change `package/src/`, the examples need to see the new code:

```sh
mise run env:pack              # rebuild + repack the tarball
mise run examples:bump         # reinstall the tarball in every example
```

Each example's `setup` task declares `depends = ["//:env:pack"]`, with `sources` and `outputs` declared on `env:pack` itself, so any of these pulls in the latest tarball:

```sh
mise run //examples/backend-node:test:e2e
mise run //examples/backend-bun:start
```

For an edit loop that rebuilds on every save and pushes to all examples:

```sh
mise run env:watch
# in another terminal
mise run //examples/backend-node:start
```

`env:watch` runs chokidar on `package/src/`, which calls `env:pack` and then `examples:bump` on every change.

## Working on the docs (`docsite/`)

The docs are a [TanStack Start](https://tanstack.com/start) + [Fumadocs](https://fumadocs.dev) app deployed to Cloudflare Workers.

```sh
mise run docsite        # local dev server
```

Anything beyond dev, such as the production build, the deploy or the preview, is a `pnpm` script inside `docsite/package.json`: `cd docsite && pnpm build`, `pnpm run deploy` or `pnpm preview`. They are mise tasks only if they cross the repo, and these don't.

Content lives in `docsite/content/docs/` as MDX. [`docsite/README.md`](../docsite/README.md) has the full layout: routes, the `llms.txt` endpoints, the `*.mdx` content negotiation and more.

## Working on the examples (`examples/*`)

Every example has the same task names, so you can `cd` into any of them and run:

```sh
mise run setup          # pack env + install deps (uses the example's native PM)
mise run reinstall      # force-reinstall the env tarball
mise run start          # run the server / dev server
mise run test:e2e       # Playwright
mise run check          # JS & TS check
```

Or run them from the repo root with the `//path:task` syntax:

```sh
mise run //examples/spa-vite-plugin:dev
mise run //examples/worker-cloudflare:test:e2e
```

### How the examples consume the library

Every example declares the dependency as a local file tarball:

```jsonc
"@variablelab/env": "file:../../package/.local/variablelab-env.tgz"
```

`mise run env:pack` generates the tarball, with `pnpm pack` inside `package/`. So each example consumes the package as published: the same `files`, the same `publishConfig.exports` and the same peer dependencies.

### The examples

Each item names the runtime, the package manager and what the example shows. [`examples/README.md`](../examples/README.md) lists the entry points each one exercises.

- [`backend-node`](../examples/backend-node): Node 24, with pnpm. A plain Node server.
- [`backend-bun`](../examples/backend-bun): Bun 1.2.4, with bun. A native Bun consumer.
- [`backend-deno`](../examples/backend-deno): Deno 2 for the server and Node 24 for the test runner, with bun. Deno can't extract `file:` tarballs natively, so `bun install` hydrates `node_modules/` (flat layout) and Deno reads it through `nodeModulesDir: "manual"`.
- [`backend-node-cjs`](../examples/backend-node-cjs): Node 24, with pnpm. `loadConfig` (sync), with the server booted from a CommonJS `require()` entry.
- [`backend-bun-cjs`](../examples/backend-bun-cjs): Bun 1.2.4, with bun. `loadConfig` (sync) under a Bun CommonJS `require()` entry.
- [`backend-deno-cjs`](../examples/backend-deno-cjs): Deno 2 for the server and Node 24 for the test runner, with bun. `loadConfig` (sync) under a Deno CommonJS `require()` entry.
- [`worker-cloudflare`](../examples/worker-cloudflare): Cloudflare Workers, with pnpm. It checks `runtimeEnv: c.env` per request, without the `nodejs_compat` flag.
- [`edge-nextjs`](../examples/edge-nextjs): Next.js Edge, with pnpm. It checks the Edge runtime path.
- [`spa-vite-plugin`](../examples/spa-vite-plugin): Vite and React, with pnpm. The `envConfig()` plugin and the `#config` alias.
- [`spa-vite-dynamic`](../examples/spa-vite-dynamic): Vite and React, with pnpm. The dynamic `import()` pattern.
- [`ssr-react-router`](../examples/ssr-react-router): React Router 7, with pnpm. `<EnvScript />` for SSR and hydration.
- [`ssr-tanstack-start`](../examples/ssr-tanstack-start): TanStack Start, with pnpm. `<EnvScript />` through TanStack Start.

The `backend-*`, `worker-*` and `edge-nextjs` examples drive Playwright in HTTP-only mode (the `request` fixture). The SPA and SSR examples drive a real Chromium browser, so they need `mise run playwright:install` first, which `setup` already runs.

### Adding a new example

The full step-by-step is in the [contributing guide](contributing.md#adding-a-new-example). The shape is:

1. A new directory under `examples/<name>/`.
2. A `package.json` with `"@variablelab/env": "file:../../package/.local/variablelab-env.tgz"` and the runtime's own devDependencies, such as `@types/bun` for Bun or `@types/deno` for Deno.
3. A `mise.toml` with `[tools]` and the standard tasks, copied from the closest existing example.
4. A `biome.json` extending `@rrlab/biome-config`, except in a Deno-only example.
5. The path in `[monorepo].config_roots` in the root [`mise.toml`](../mise.toml).
6. A row in the matrix in [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml).
7. A row in the table in [`examples/README.md`](../examples/README.md).
8. `mise run setup` from the new directory, and a commit of the generated lockfile.
9. `mise lock` for every platform from the new directory, and a commit of its `mise.lock` (CI installs tools with `--locked`).

## Troubleshooting

### `mise ERROR Config files in ... are not trusted`

The first time you `cd` into a new example, mise won't run its tasks until you trust the file. Run:

```sh
mise trust path/to/mise.toml
```

### `task not found: env:pack`

Inside the monorepo task execution context, root tasks are namespaced as `//:env:pack`, with the `//` prefix. The `setup` and `reinstall` tasks of each example already use it:

```toml
depends = ["//:env:pack"]
```

If you write a new task and hit this error, use the `//:` prefix.

### Fanning out a task across every example

Use mise's monorepo glob. It resolves against `[monorepo].config_roots` and runs in parallel, as many at once as `MISE_JOBS` allows:

```toml
run = "mise run \"//examples/...:test:e2e\""
```

Avoid `for d in examples/*/; do ...; done`: it runs one example at a time and predates this feature. A bash loop still makes sense only for `mise install -C "$d"`, the per-example tool installs (bun, deno and so on), since `mise install` doesn't accept the monorepo glob.

### pnpm tries to install across the whole monorepo from inside an example

The example directories sit inside the same tree as `pnpm-workspace.yaml`, so pnpm takes them for workspace members. They aren't, but pnpm needs an explicit `--ignore-workspace` to honor that. The pnpm-based examples already pass it in their `setup` tasks, and a new pnpm-based example has to do the same. `--ignore-workspace` also skips the cooldown in `pnpm-workspace.yaml`, so each pnpm-based example has an `.npmrc` with the same settings, and a new one copies it.

### Deno can't import the library from the tarball

Deno's own package manager (`deno install`, `deno add`) doesn't extract local `file:` tarballs: both `nodeModulesDir: "auto"` and `"manual"` leave `node_modules/@variablelab/env` as a dangling symlink to the `.tgz` file. So the Deno examples use `bun install` to hydrate `node_modules/`, because bun extracts the tarball into a flat layout that Deno's `nodeModulesDir: "manual"` can walk. Deno still owns the runtime: bun only does what `deno install` doesn't yet do for local tarballs. See [`examples/backend-deno/deno.jsonc`](../examples/backend-deno/deno.jsonc) and the comment inside.

### `package/.local/variablelab-env.tgz` is missing

Run `mise run env:pack`, or `mise run setup` from a fresh clone. The directory is gitignored, so it doesn't exist on a fresh clone until the pack task runs.

### My change to `package/src/` isn't visible in an example

The example caches the install based on `sources`, which include the tarball. Force a refresh:

```sh
mise run //examples/<name>:reinstall
# or, for everything at once:
mise run examples:bump
```

### CI passes but local fails (or the reverse)

Make sure your local mise is current (`mise self-update`), and that you ran `mise install` from the root and from the example. CI uses `jdx/mise-action` v4.3.0 with `working_directory: examples/<name>` to provision both layers.
