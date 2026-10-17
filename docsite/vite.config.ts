import { mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig, type Plugin } from "vite";

// Workers static assets map URL paths straight onto the assets directory, and
// `assets.base_path` is not enabled on our account yet. Once TanStack Start has
// prerendered into `dist/client`, move it under the base (`env/`) so `/env/docs/` finds
// `dist/client/env/docs/index.html`. Dotfiles (`.assetsignore`) and `_headers` /
// `_redirects` must stay at the root.
function nestClientUnderBase(): Plugin {
  return {
    name: "docsite:nest-client-under-base",
    enforce: "post",
    buildApp: {
      order: "post",
      async handler(builder) {
        const client = builder.environments.client;
        if (!client) throw new Error("No client environment to nest under the base path");
        const outDir = path.resolve(builder.config.root, client.config.build.outDir);
        const target = path.join(outDir, builder.config.base);
        const entries = (await readdir(outDir)).filter((name) => !/^[._]/.test(name));
        await mkdir(target, { recursive: true });
        await Promise.all(entries.map((name) => rename(path.join(outDir, name), path.join(target, name))));
      },
    },
  };
}

export default defineConfig({
  // Served under lab.variable.land/env/ (see the routes in wrangler.jsonc).
  base: "/env/",
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    mdx(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        // Discovery always adds `/`, which has no route: the docs live under /docs.
        autoStaticPathsDiscovery: false,
        filter: (page) => !page.path.startsWith("/api/") && !page.path.includes("#"),
      },
      // The crawl starts at the docs index and follows its links to every docs page.
      pages: [{ path: "/docs" }, { path: "/sitemap.xml" }, { path: "/llms.txt" }, { path: "/llms-full.txt" }],
    }),
    react(),
    // Must run after TanStack Start's post-build prerender, which is also a `post` buildApp hook.
    nestClientUnderBase(),
  ],
});
