# @variablelab/env

🌱 Contract-first environment configuration with typed schemas. Define your env once with [Standard Schema](https://github.com/standard-schema/standard-schema) (Zod, Valibot, ArkType…), get a fully typed `env` object that merges per-environment config with your environment variables.

Runtime-agnostic core — Node, Bun, Deno, browser, Workers, Edge. Opt-in entry points: a filesystem-based config loader (works on Node, Bun, and Deno), a Vite plugin, a React `<EnvScript />` helper for hydrating runtime env across SSR or CSR, and a curated set of Zod-based schema primitives.

## Installation

```sh
pnpm add @variablelab/env
```

`@variablelab/env` is agnostic to the schema validator. If you'll use Zod (the docs default, and the validator behind the optional `@variablelab/env/zod` primitives), install it alongside:

```sh
pnpm add zod
```

## Documentation

📚 **[env.oss.variable.land](https://env.oss.variable.land)**

- [Getting started](https://env.oss.variable.land/getting-started/installation)
- [Concepts](https://env.oss.variable.land/concepts/overview) — mental model, resolution order, env-var naming
- [Guides](https://env.oss.variable.land/guides) — recipes for Node, SPA, SSR
- [API reference](https://env.oss.variable.land/api-reference)

## Examples

Runnable apps under [`examples/`](https://github.com/withvariablelab/env/tree/main/examples):

- [`backend-node`](https://github.com/withvariablelab/env/tree/main/examples/backend-node) — Node server with `loadConfig`
- [`backend-bun`](https://github.com/withvariablelab/env/tree/main/examples/backend-bun) — Bun server with `loadConfig`
- [`backend-deno`](https://github.com/withvariablelab/env/tree/main/examples/backend-deno) — Deno server with `loadConfig`
- [`worker-cloudflare`](https://github.com/withvariablelab/env/tree/main/examples/worker-cloudflare) — Cloudflare Worker, `runtimeEnv: c.env` per-request
- [`edge-nextjs`](https://github.com/withvariablelab/env/tree/main/examples/edge-nextjs) — Next.js App Router route handler with `runtime: 'edge'`
- [`spa-vite-dynamic`](https://github.com/withvariablelab/env/tree/main/examples/spa-vite-dynamic) — SPA, dynamic import pattern
- [`spa-vite-plugin`](https://github.com/withvariablelab/env/tree/main/examples/spa-vite-plugin) — SPA, `#config` alias
- [`ssr-react-router`](https://github.com/withvariablelab/env/tree/main/examples/ssr-react-router) — SSR with React Router 7
- [`ssr-tanstack-start`](https://github.com/withvariablelab/env/tree/main/examples/ssr-tanstack-start) — SSR with TanStack Start

## License

MIT
