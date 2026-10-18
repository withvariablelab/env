<p align="center">
  <img src="https://raw.githubusercontent.com/withvariablelab/env/HEAD/package/brand/sign-readme.svg" width="64" alt="">
</p>

<h1 align="center"><a href="https://lab.variable.land/env">env</a></h1>

<p align="center">Only declared variables, checked at boot.</p>

This repository holds env: the `@variablelab/env` library, its docs site and its examples.

```sh
pnpm add @variablelab/env
```

Usage and the entry points are in the library's [README](package/README.md), and everything else is in the [docs](https://lab.variable.land/env/docs/getting-started/installation).

## Repository

- [`package/`](package): the `@variablelab/env` library, published to npm.
- [`docsite/`](docsite): the docs at [lab.variable.land/env/docs](https://lab.variable.land/env/docs), built with Fumadocs and served by Cloudflare Workers.
- [`examples/`](examples): runtime-isolated apps for Node, Bun, Deno, Workers, Edge, a Vite SPA and SSR. Each one installs the packed library, as an outside consumer would.

## Contributing

The [contributing guide](docs/contributing.md) covers issues, pull requests and releases, and the [development guide](docs/development.md) covers setting up the repo and running its checks.

## License

The code is [MIT](LICENSE). The Sign in `package/brand/` is not: its use is set by [BRAND-USE.md](https://github.com/withvariablelab/brand/blob/main/BRAND-USE.md).

<p align="center">
  <a href="https://lab.variable.land"><img src="https://cdn.jsdelivr.net/gh/withvariablelab/brand@v0.3.1/.github/readme/logo.svg" width="24" alt="" align="absmiddle">&nbsp;Variable Land</a>
</p>
