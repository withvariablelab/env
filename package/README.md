<p align="center">
  <img src="https://raw.githubusercontent.com/withvariablelab/env/HEAD/package/brand/sign-readme.svg" width="64" alt="">
</p>

<h1 align="center"><a href="https://lab.variable.land/env">env</a></h1>

<p align="center">Only declared variables, checked at boot.</p>

Contract-first environment configuration. You define the env once with a [Standard Schema](https://github.com/standard-schema/standard-schema) validator, such as Zod, Valibot or ArkType, and get a typed `env` object that merges per-environment config with your environment variables.

The core runs on Node, Bun, Deno, the browser, Workers and Edge. Every other entry point is opt-in.

## Install

```sh
pnpm add @variablelab/env
```

No validator is bundled. To use Zod, the default in the docs and the validator behind `@variablelab/env/zod`, install it beside env:

```sh
pnpm add zod
```

## Usage

```ts
// env.ts
import { defineEnv, schema } from "@variablelab/env";
import * as e from "@variablelab/env/zod";

const Env = schema({
  server: { PORT: e.port, HOST: e.host },
});

export const env = defineEnv({ schema: Env });
```

## Entry points

| Entry point | What it adds |
| --- | --- |
| `@variablelab/env` | `defineEnv` and `schema`: the runtime-agnostic core. |
| `@variablelab/env/fs` | `loadConfig`, which reads config files on Node, Bun and Deno. |
| `@variablelab/env/vite` | `envConfig()`, a Vite plugin. |
| `@variablelab/env/react` | `<EnvScript />`, which hydrates the runtime env across SSR and CSR. |
| `@variablelab/env/zod` | Zod schema primitives, such as `port`, `host` and `secret`. |

## Documentation

All of it is at [lab.variable.land/env/docs](https://lab.variable.land/env/docs):

- [Getting started](https://lab.variable.land/env/docs/getting-started/installation).
- [Concepts](https://lab.variable.land/env/docs/concepts/overview): the mental model, the resolution order and env-var naming.
- [Guides](https://lab.variable.land/env/docs/guides): recipes for Node, SPA and SSR.
- [API reference](https://lab.variable.land/env/docs/api-reference).

Runnable apps for each runtime are in [`examples/`](https://github.com/withvariablelab/env/tree/main/examples).

## License

The code is [MIT](https://github.com/withvariablelab/env/blob/main/LICENSE). The Sign in `brand/` is not: its use is set by [BRAND-USE.md](https://github.com/withvariablelab/brand/blob/main/BRAND-USE.md).

<p align="center">
  <a href="https://lab.variable.land"><img src="https://cdn.jsdelivr.net/gh/withvariablelab/brand@v0.3.1/.github/readme/logo.svg" width="24" alt="" align="absmiddle">&nbsp;Variable Land</a>
</p>
