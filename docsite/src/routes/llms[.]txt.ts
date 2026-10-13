import { createFileRoute } from "@tanstack/react-router";
import { llms } from "fumadocs-core/source";
import { BASE_PATH } from "#src/lib/base-path.ts";
import { source } from "#src/lib/source.ts";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        // `llms()` links to router-relative page URLs (`/docs/...`) and has no base option.
        new Response(llms(source).index().replaceAll("](/", `](${BASE_PATH}/`), {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
    },
  },
});
