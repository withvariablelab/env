# env docsite

The Fumadocs-powered docs for [`@variablelab/env`](../package), published at **[lab.variable.land/env](https://lab.variable.land/env)**.

Built with [TanStack Start](https://tanstack.com/start) + [Fumadocs](https://fumadocs.dev) + Tailwind v4, deployed to [Cloudflare Workers](https://developers.cloudflare.com/workers/) via Wrangler.

## Layout

| Path                                  | Purpose                                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`content/docs/`](./content/docs)     | MDX content — `getting-started/`, `concepts/`, `guides/`, `api-reference/`                                                        |
| [`src/routes/`](./src/routes)         | TanStack Router routes — landing (`index.tsx`), docs viewer, `llms.txt` / `llms-full.txt` endpoints                               |
| [`src/components/`](./src/components) | Landing components, MDX overrides, mermaid renderer                                                                               |
| [`src/lib/`](./src/lib)               | Fumadocs source adapter (`source.ts`), shared layout, llms-text builder                                                           |
| [`src/server.ts`](./src/server.ts)    | **Workers entry** — wraps the TanStack Start handler; rewrites `*.mdx` and `Accept: text/markdown` requests to the `/raw/*` route |
| [`public/`](./public)                 | Static assets — fonts, favicons and app icons drawn from the Sign, manifest                                                       |
| `source.config.ts`                    | Fumadocs MDX config (Shiki themes, processed-markdown for `/llms-full.txt`)                                                       |
| `wrangler.jsonc`                      | Cloudflare Workers config — `main` and the `lab.variable.land/env` routes                                                         |

## Running

From the repo root (after `mise install && mise run setup` — see [DEVELOPMENT.md](../docs/DEVELOPMENT.md)):

```sh
mise run docsite     # alias for `pnpm --filter=docsite dev`
```

Or directly inside this workspace:

```sh
pnpm dev             # local dev server
pnpm build           # production build (Vite + Cloudflare adapter)
pnpm preview         # preview the built bundle
pnpm run deploy      # build + wrangler deploy
pnpm test:types      # typechecks
```

`docsite/` lives in the small pnpm workspace alongside [`package/`](../package). It is **not** runtime-isolated like the [`examples/`](../examples) — those each declare their own runtime via mise and use a packed tarball of `@variablelab/env`.

## Deploying

[Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) deploys the `variablelab-env` Worker on every merge to `main`; preview builds are off. Its settings live in the Cloudflare dashboard (_Workers & Pages → variablelab-env → Settings → Build_), not in this repo:

| Setting           | Value                               |
| ----------------- | ----------------------------------- |
| Root directory    | `/docsite`                          |
| Build command     | `pnpm build`                        |
| Deploy command    | `npx wrangler deploy` (the default) |
| Build watch paths | `docsite/**`, `pnpm-lock.yaml`      |

All commands run inside `docsite/`, so they use its pinned wrangler. `pnpm run deploy` is the manual equivalent.

## Notes

- `postinstall` runs `fumadocs-mdx` to generate `.source/` (Fumadocs' MDX index). Commit-ignored.
- `llms.txt` and `llms-full.txt` are emitted from `src/routes/llms[.]txt.ts` and `src/routes/llms-full[.]txt.ts` so LLM agents can ingest the full docs corpus.
- `src/server.ts` makes raw MDX addressable two ways: append `.mdx` to any `/docs/*` URL, or send `Accept: text/markdown`. Both are rewritten to the internal `/raw/*` route (TanStack Router can't express splat-plus-`.mdx` natively, so the rewrite lives at the Worker edge).
- The site lives under `/env` on [lab.variable.land](https://lab.variable.land) (`pnpm dev` / `pnpm preview` too); see `base` in `vite.config.ts` and `src/lib/base-path.ts`. `src/server.ts` 301s the old `env.oss.variable.land` host there.
