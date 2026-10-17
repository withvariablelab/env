# Contributing to `@variablelab/env`

Thanks for taking the time to contribute. This document covers the conventions we follow so your PR can land smoothly. For local setup, the per-task reference, and how the monorepo is wired, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## Ways to contribute

- **Report a bug.** Open an issue with a minimal repro and the actual vs. expected behavior. Include runtime (Node / Bun / Deno / Workers / Edge), `@variablelab/env` version, and the schema validator you use.
- **Propose a feature.** Open an issue first so we can align on scope before you spend time on a PR. We bias toward small, composable APIs.
- **Improve the docs.** Even one-paragraph corrections are welcome. Docs live in [`docsite/content/docs/`](../docsite/content/docs).
- **Add an example.** Demos that exercise a runtime or framework we don't cover yet are great PRs. See [adding a new example](#adding-a-new-example) below.
- **Send a fix or feature PR.** Read the rest of this document first.

## Before you open a PR

1. **An issue exists for non-trivial changes.** For typo fixes, dead-code removal, or a single-file bug fix, just open the PR. For anything that adds API, changes behavior, or touches public types, open an issue first.
2. **Your branch is up to date with `main`.**
3. **`mise run test:e2e` passes locally** (or at least the suites your change touches).
4. **You added a changeset** if the change affects the published `@variablelab/env`. See [Changesets](#changesets).

## Branch and commit conventions

### Branch names

Use a short prefix that mirrors the change type:

- `feat/<short-slug>` — new feature or new public API
- `fix/<short-slug>` — bug fix
- `docs/<short-slug>` — docs-only changes
- `chore/<short-slug>` — tooling, CI, dependencies, refactors with no behavior change
- `test/<short-slug>` — test-only changes

The CI release workflow uses the `feat/*` and `fix/*` prefixes to publish preview releases under the `pr-<number>` dist-tag (see [Preview releases](#preview-releases)).

### Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/), kept terse:

```
feat(zod): add zEnum primitive for case-insensitive enums
fix(react): EnvScript no longer double-encodes the JSON payload
docs: clarify resolution order for runtimeEnv
chore(ci): bump jdx/mise-action to v2
```

The PR title follows the same format — that title becomes the squash-merge commit.

## Changesets

We version and release with [Changesets](https://github.com/changesets/changesets). Every PR that affects what gets shipped to npm needs a changeset.

Add one as part of your PR:

```sh
pnpm changeset
```

That command walks you through:

1. Which packages changed (almost always just `@variablelab/env`).
2. The bump type — `patch` (bug fix), `minor` (new feature, backwards-compatible), `major` (breaking change).
3. A user-facing description (it lands in the changelog).

It writes a markdown file under `.changeset/` — commit it with the rest of your changes.

**You don't need a changeset when:**

- Only `docsite/`, `examples/`, CI files, or other non-published files changed.
- The PR is a pure `chore/*` that doesn't touch `package/src/`.

Don't bump versions or edit `CHANGELOG.md` by hand — Changesets does both during release.

## Pull request checklist

- [ ] Branch named `feat/*`, `fix/*`, `docs/*`, `chore/*`, or `test/*`
- [ ] PR title follows Conventional Commits
- [ ] Tests cover the change (unit in `package/src/__tests__/`, e2e in `examples/<name>/test/e2e/` if relevant)
- [ ] `mise run lib:test` and `mise run check` pass locally (JS & TS check)
- [ ] `mise run test:e2e` passes locally for affected examples
- [ ] Changeset added (if the published `@variablelab/env` changed)
- [ ] Docs updated (if public API or behavior changed)

## CI

Two workflows run on every PR:

- **CI** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) — static checks, unit tests, and library build inside the small pnpm workspace (`package` + `docsite`).
- **E2E** ([`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml)) — a matrix job per example, each provisioning its own runtime via [`jdx/mise-action`](https://github.com/jdx/mise-action).

Both must be green to merge.

## Adding a new example

Examples are runtime-isolated demos. Each one is a real consumer of the published `@variablelab/env` tarball — no shared lockfile, no workspace cheating. To add one:

1. Create the directory under `examples/<name>/` with the source for the demo.
2. Add a `package.json` that consumes `@variablelab/env` from the local tarball:
   ```jsonc
   "@variablelab/env": "file:../../package/.local/variablelab-env.tgz"
   ```
3. Add a `mise.toml` with the runtime tools (`node` / `bun` / `deno` / `pnpm`) and the standard tasks (`setup`, `start`, `test:e2e`, `check`). Use any of the existing examples as a template — pick the one with the closest runtime.
4. Add a `biome.json` extending `@rrlab/biome-config` (skip this for Deno-only examples).
5. Add the path to `[monorepo].config_roots` in the root [`mise.toml`](../mise.toml).
6. Add a row to the matrix in [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml).
7. Update the table in [`examples/README.md`](../examples/README.md).
8. Run the install + e2e and commit the generated lockfile.
9. From the new directory, run `mise lock -p linux-x64,linux-x64-musl,linux-arm64,linux-arm64-musl,macos-x64,macos-arm64,windows-x64` and commit its `mise.lock`. CI installs tools with `--locked`, so an example without one fails E2E.

The detailed setup mechanics — which package manager fits which runtime, why Deno needs `nodeModulesDir: "manual"`, the depends-on-`//:env:pack` rule — are documented in [DEVELOPMENT.md](./DEVELOPMENT.md#working-on-the-examples-examples).

## Preview releases

PRs from branches named `feat/*` or `fix/*` publish a preview build of `@variablelab/env` to npm under the `pr-<PR_NUMBER>` dist-tag, so reviewers can install the unmerged version:

```sh
pnpm install @variablelab/env@pr-123
```

The preview is republished on every push to the PR.

## Release flow

When PRs with changesets land on `main`, the [Changesets bot](https://github.com/changesets/bot) opens a "Version Packages" PR. Merging that PR triggers the [release job](../.github/workflows/ci.yml) to publish the new versions to npm and tag the release on GitHub.

Maintainers don't need to manually bump versions or edit `CHANGELOG.md` — both are generated.

## Code review expectations

- We aim to leave a first review within a few business days. If you don't hear back in a week, ping the PR.
- Reviews focus on: correctness, type safety at API boundaries, test coverage of failure modes, runtime portability (does this break Deno / Workers?), and docs alignment.
- We're conservative about new public surface area. Smaller, composable additions are easier to land than big new namespaces.

## Code of conduct

Be kind and assume good faith. We don't have a formal CoC document yet — if your interaction wouldn't fly in a respectful workplace, don't post it here.

---

Questions? Open a [discussion](https://github.com/withvariablelab/env/discussions) or ping us in the PR.
