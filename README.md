<p align="center">
  <img src="https://raw.githubusercontent.com/withvariablelab/env/HEAD/package/brand/sign-readme.svg" width="64" height="64" alt="">
</p>

<h1 align="center">env</h1>

<p align="center">Only declared variables, checked at boot.</p>

[![npm version](https://img.shields.io/npm/v/@variablelab/env?label=%40variablelab%2Fenv&color=blue)](https://www.npmjs.com/package/@variablelab/env)
[![CI](https://github.com/withvariablelab/env/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/withvariablelab/env/actions/workflows/ci.yml)
[![changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3.svg)](https://github.com/changesets/changesets)

Contract-first environment configuration with typed schemas — runtime-agnostic core (Node, Bun, Deno, browser, Workers, Edge) with opt-in adapters for Node, Vite, and React (SSR).

```bash
pnpm add @variablelab/env
```

**[lab.variable.land/env/docs](https://lab.variable.land/env/docs)** — full docs

## Repository

This is the monorepo. Three things live here:

| Path                      | What it is                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`package/`](./package)   | The [`@variablelab/env`](./package) library — published to npm                                                                     |
| [`docsite/`](./docsite)   | The Fumadocs site behind [lab.variable.land/env/docs](https://lab.variable.land/env/docs), on Cloudflare Workers                |
| [`examples/`](./examples) | 9 runtime-isolated demos (Node, Bun, Deno, Workers, Edge, Vite SPA, SSR) — each one is a real consumer of the published tarball |

## Working on it

The whole thing is orchestrated with [mise](https://mise.jdx.dev). Get the runtimes, install, run the e2e suites:

```bash
mise install        # installs node + pnpm; bun/deno added on demand by examples
mise run setup      # root deps + pack the library + install every example + Playwright browsers
mise run test:e2e   # runs the e2e suite of every example
```

Day-to-day:

```bash
mise run docsite     # docs site dev server
mise run lib:test    # unit tests for @variablelab/env
mise run lib:build   # build @variablelab/env
mise run check       # JS & TS check across package + docsite
```

Run `mise tasks` for the full list.

For everything else — the per-task reference, the per-example layout, how to iterate on the library while seeing changes in the examples, troubleshooting — see [DEVELOPMENT.md](./docs/DEVELOPMENT.md).

## Contributing

Issues, ideas, and PRs welcome. Read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) before opening a PR — it covers the branch / commit / changeset conventions and the release flow.

## License

[MIT](./LICENSE) © [Variable Land](https://variable.land)
