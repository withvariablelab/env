import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { BASE_PATH } from "#src/lib/base-path.ts";
import { SITE_URL } from "#src/lib/site-url.ts";

// The docs used to live at the root of this host. Old URLs never start with `BASE_PATH`,
// where the static assets live, so they reach the Worker and get redirected.
const LEGACY_HOST = "env.oss.variable.land";

// env's Project page, which Variable Lab's site serves at `/env` itself. It reads like
// `SITE_URL`, but this Worker serves only what is under `/env/`.
const PROJECT_URL = "https://lab.variable.land/env";

// `/env/` was env's landing; the Project page replaces it. There is no prerendered
// `env/index.html`, so the static assets miss and these requests reach the Worker.
const LANDING_PATHS = new Set([BASE_PATH, `${BASE_PATH}/`, `${BASE_PATH}/index.html`]);

// Public `/docs/foo.mdx` URLs and `Accept: text/markdown` requests on `/docs/*`
// both serve raw markdown via the internal `/raw/{slug}` route. We rewrite here
// so the route tree stays a vanilla splat (TanStack Router has no documented
// pattern that combines `$` splat with a literal `.mdx` suffix).
const { rewrite: stripMdxSuffix } = rewritePath(`${BASE_PATH}/docs{/*path}.mdx`, `${BASE_PATH}/raw{/*path}`);
const { rewrite: rewriteToRaw } = rewritePath(`${BASE_PATH}/docs{/*path}`, `${BASE_PATH}/raw{/*path}`);

export default createServerEntry({
  fetch(request) {
    const url = new URL(request.url);

    if (LANDING_PATHS.has(url.pathname)) {
      return Response.redirect(`${PROJECT_URL}${url.search}`, 301);
    }

    if (url.hostname === LEGACY_HOST) {
      // The old root was env's home: send it to the Project page in one hop.
      const target = url.pathname === "/" ? PROJECT_URL : `${SITE_URL}${url.pathname}`;
      return Response.redirect(`${target}${url.search}`, 301);
    }

    const explicitMdx = stripMdxSuffix(url.pathname);
    if (explicitMdx) {
      const rewritten = new Request(new URL(explicitMdx, url), request);
      return handler.fetch(rewritten);
    }

    if (isMarkdownPreferred(request)) {
      const negotiated = rewriteToRaw(url.pathname);
      if (negotiated) {
        const rewritten = new Request(new URL(negotiated, url), request);
        return handler.fetch(rewritten);
      }
    }

    return handler.fetch(request);
  },
});
