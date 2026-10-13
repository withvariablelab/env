# docsite — agent notes

Workspace-specific guidance. The general project layout and run commands live in [README.md](./README.md).

## SEO audit (Lighthouse CI)

`@lhci/cli` is **not** in `package.json` — it would add ~30 MB to every dev install just for the audit. It is pulled on-demand via `pnpm dlx` inside the `check:seo` script:

```
pnpm --filter docsite check:seo
```

Same command runs locally and in CI ([`.github/workflows/docsite.yml`](../.github/workflows/docsite.yml)). `lhci autorun` handles the full lifecycle natively: starts the preview server via `startServerCommand`, runs Lighthouse against each URL, asserts against budgets, and stops the server cleanly.

The pinned `@lhci/cli@X.Y.Z` version lives in two places that **must be kept in sync**:

1. The `pnpm dlx` invocation in `package.json` (`@lhci/cli@X.Y.Z`).
2. The cache key in [`docsite.yml`](../.github/workflows/docsite.yml) (`pnpm-dlx-...-lhci-X.Y.Z`).

When bumping the version, update both — otherwise CI keeps restoring the old `~/.cache/pnpm/dlx` and the new bin is re-downloaded every run, defeating the cache.

URLs and budgets live in [`.lighthouserc.cjs`](./.lighthouserc.cjs). The URL list is parsed from `dist/client/env/sitemap.xml` (produced by prerendering [`src/routes/sitemap[.]xml.ts`](./src/routes/sitemap[.]xml.ts) during `vite build`) — new docs are picked up automatically. Budgets: SEO and best-practices pinned at 100 (`error`); accessibility ≥90 and performance ≥50 (`warn`). Any regression in `meta-description`, `document-title`, `is-crawlable`, etc. fails the PR.

**Why Lighthouse CI instead of Unlighthouse:** an earlier version of this workflow used Unlighthouse. It worked but `unlighthouse-ci` leaks Chrome process handles after a successful scan and never exits cleanly — under GitHub Actions the step would hang several minutes after the audit finished. LHCI handles process cleanup correctly and is the more battle-tested CI primitive.
