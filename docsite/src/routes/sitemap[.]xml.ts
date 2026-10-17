import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "#src/lib/site-url.ts";
import { source } from "#src/lib/source.ts";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const paths = ["/", ...source.getPages().map((page) => page.url)];
        const urls = paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
