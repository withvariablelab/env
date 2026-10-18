# Contributing

env takes bug reports, fixes, features, docs and examples. The docs live in [`docsite/content/docs/`](../docsite/content/docs), and a correction as short as one paragraph is welcome. A new example covers a runtime or framework the others don't: see [Adding a new example](#adding-a-new-example). To set up the repo and run its checks, see the [development guide](development.md).

## Issues

- **Report a bug.** Open an issue with a minimal repro and the actual and expected behavior. Include the runtime (Node, Bun, Deno, Workers or Edge), the `@variablelab/env` version and the schema validator you use.
- **Propose a feature.** Open an issue first, so the scope is agreed before you spend time on a pull request. env favors small, composable APIs.

A typo fix, dead-code removal or a single-file bug fix can go straight to a pull request. Anything that adds API, changes behavior or touches public types starts as an issue.

## Pull requests

### Branch names

Branch from `main` with a short prefix that mirrors the change type:

- `feat/<short-slug>`: a new feature or new public API.
- `fix/<short-slug>`: a bug fix.
- `docs/<short-slug>`: a docs-only change.
- `chore/<short-slug>`: tooling, CI, dependencies, or a refactor with no behavior change.
- `test/<short-slug>`: a test-only change.

The `feat/` and `fix/` prefixes also publish a preview release (see [Preview releases](#preview-releases)).

### Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/), kept terse:

```
feat(zod): add zEnum primitive for case-insensitive enums
fix(react): EnvScript no longer double-encodes the JSON payload
docs: clarify resolution order for runtimeEnv
chore(ci): bump jdx/mise-action to v2
```

The pull request title takes the same form, because it becomes the squash-merge commit.

### Checklist

- [ ] The branch is named `feat/*`, `fix/*`, `docs/*`, `chore/*` or `test/*`, and is up to date with `main`.
- [ ] The pull request title follows Conventional Commits.
- [ ] Tests cover the change: unit tests in `package/src/__tests__/`, and e2e tests in `examples/<name>/test/e2e/` when relevant.
- [ ] `mise run lib:test` and `mise run check` pass locally.
- [ ] `mise run test:e2e` passes locally, at least for the examples the change touches.
- [ ] A changeset is added, if the published `@variablelab/env` changed. See [Changesets](#changesets).
- [ ] The docs are updated, if public API or behavior changed.

### Merging

Every check on the pull request has to pass. The [development guide](development.md#ci) lists the workflows that run. A maintainer squash-merges.

### Preview releases

A pull request from a `feat/*` or `fix/*` branch, or with the `preview` label, publishes a preview build of `@variablelab/env` to npm under the `pr-<number>` dist-tag, so reviewers can install the unmerged version:

```sh
pnpm install @variablelab/env@pr-123
```

Every push to the pull request publishes the preview again.

## Changesets

Versions and releases go through [Changesets](https://github.com/changesets/changesets). Every pull request that changes what ships to npm needs a changeset. Add one as part of the pull request:

```sh
pnpm changeset
```

The command asks for:

1. The packages that changed, almost always just `@variablelab/env`.
2. The bump: `patch` for a bug fix, `minor` for a backwards-compatible feature, `major` for a breaking change.
3. A description for the people who use env, which lands in the changelog.

It writes a markdown file under `.changeset/`. Commit it with the rest of the change.

A pull request needs no changeset when:

- only `docsite/`, `examples/`, CI files or other unpublished files changed;
- it is a `chore/*` change that doesn't touch `package/src/`.

Nobody bumps versions or edits `CHANGELOG.md` by hand: Changesets does both during a release.

## Releases

When pull requests with changesets land on `main`, the release job in [`ci.yml`](../.github/workflows/ci.yml) (`changesets/action`, running as `vland-bot`) opens or updates a "chore: update versions" pull request. A maintainer merges it, and that runs the release job again, which publishes the new version to npm and tags the release on GitHub.

## Adding a new example

Examples are runtime-isolated demos. Each one installs the packed `@variablelab/env` tarball, as an outside consumer would, with its own lockfile and outside the pnpm workspace. To add one:

1. Create the directory under `examples/<name>/` with the source for the demo, and give it ports no other example uses (see [Ports](../examples/README.md#ports)).
2. Add a `package.json` that consumes `@variablelab/env` from the local tarball:
   ```jsonc
   "@variablelab/env": "file:../../package/.local/variablelab-env.tgz"
   ```
3. Add a `mise.toml` with the runtime tools (`node`, `bun`, `deno` or `pnpm`) and the standard tasks (`setup`, `start`, `test:e2e`, `check`). Use the existing example with the closest runtime as a template.
4. Add a `biome.json` extending `@rrlab/biome-config`, except in a Deno-only example.
5. Add the path to `[monorepo].config_roots` in the root [`mise.toml`](../mise.toml).
6. Add a row to the matrix in [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml).
7. Update the table in [`examples/README.md`](../examples/README.md).
8. Run the install and the e2e suite, and commit the generated lockfile.
9. From the new directory, run `mise lock -p linux-x64,linux-x64-musl,linux-arm64,linux-arm64-musl,macos-x64,macos-arm64,windows-x64` and commit its `mise.lock`. CI installs tools with `--locked`, so an example without one fails E2E.

The setup mechanics, such as which package manager fits which runtime, why Deno needs `nodeModulesDir: "manual"` and the rule to depend on `//:env:pack`, are in the [development guide](development.md#working-on-the-examples-examples).

## Code review

- A first review usually comes within a few business days. If none comes within a week, ping the pull request.
- Reviews look at correctness, type safety at API boundaries, test coverage of failure modes, runtime portability (whether the change breaks Deno or Workers) and docs alignment.
- New public API is added with care. Small, composable additions land more easily than new namespaces.

## Code of conduct

Be kind and assume good faith. There is no formal code of conduct yet: if something wouldn't be said in a respectful workplace, don't post it here.

For a question, open an [issue](https://github.com/withvariablelab/env/issues) or ask in your pull request.
