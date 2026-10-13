# `@variablelab/env` docsite

The Fumadocs-powered docs for [`@variablelab/env`](../package), published at **[env.oss.variable.land](https://env.oss.variable.land)**.

Built with [TanStack Start](https://tanstack.com/start) + [Fumadocs](https://fumadocs.dev) + Tailwind v4, deployed to [Cloudflare Workers](https://developers.cloudflare.com/workers/) via Wrangler.

## Layout

| Path                                  | Purpose                                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`content/docs/`](./content/docs)     | MDX content — `getting-started/`, `concepts/`, `guides/`, `api-reference/`                                                        |
| [`src/routes/`](./src/routes)         | TanStack Router routes — landing (`index.tsx`), docs viewer, `llms.txt` / `llms-full.txt` endpoints                               |
| [`src/components/`](./src/components) | Landing components, MDX overrides, mermaid renderer                                                                               |
| [`src/lib/`](./src/lib)               | Fumadocs source adapter (`source.ts`), shared layout, llms-text builder                                                           |
| [`src/server.ts`](./src/server.ts)    | **Workers entry** — wraps the TanStack Start handler; rewrites `*.mdx` and `Accept: text/markdown` requests to the `/raw/*` route |
| [`public/`](./public)                 | Static assets — favicons, manifest, brand lockup, social cards                                                                    |
| `source.config.ts`                    | Fumadocs MDX config (Shiki themes, processed-markdown for `/llms-full.txt`)                                                       |
| `wrangler.jsonc`                      | Cloudflare Workers config (points `main` at `src/server.ts`)                                                                      |

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
pnpm deploy          # build + wrangler deploy
pnpm test:types      # typechecks
```

`docsite/` lives in the small pnpm workspace alongside [`package/`](../package). It is **not** runtime-isolated like the [`examples/`](../examples) — those each declare their own runtime via mise and use a packed tarball of `@variablelab/env`.

## Notes

- `postinstall` runs `fumadocs-mdx` to generate `.source/` (Fumadocs' MDX index). Commit-ignored.
- `llms.txt` and `llms-full.txt` are emitted from `src/routes/llms[.]txt.ts` and `src/routes/llms-full[.]txt.ts` so LLM agents can ingest the full docs corpus.
- `src/server.ts` makes raw MDX addressable two ways: append `.mdx` to any `/docs/*` URL, or send `Accept: text/markdown`. Both are rewritten to the internal `/raw/*` route (TanStack Router can't express splat-plus-`.mdx` natively, so the rewrite lives at the Worker edge).
