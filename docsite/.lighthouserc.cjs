const fs = require("node:fs");
const path = require("node:path");

const SITE = "http://127.0.0.1:4173";
// vite.config.ts nests the client output under the `/env/` base.
const SITEMAP = path.join(__dirname, "dist/client/env/sitemap.xml");

const xml = fs.readFileSync(SITEMAP, "utf8");
const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1].replace(/^https?:\/\/[^/]+/, SITE));

module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort",
      url: urls,
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:seo": ["error", { minScore: 1.0 }],
        "categories:best-practices": ["error", { minScore: 1.0 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.5 }],
      },
    },
  },
};
