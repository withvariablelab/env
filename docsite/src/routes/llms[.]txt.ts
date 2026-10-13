import { createFileRoute } from "@tanstack/react-router";
import { llms } from "fumadocs-core/source";
import { prefixMarkdownLinks } from "#src/lib/base-path.ts";
import { source } from "#src/lib/source.ts";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(prefixMarkdownLinks(llms(source).index()), {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
    },
  },
});
