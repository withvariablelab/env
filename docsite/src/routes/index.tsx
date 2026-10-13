import { createFileRoute } from "@tanstack/react-router";
import { getLandingSnippets } from "#src/components/landing/highlight.ts";
import { Landing } from "#src/components/landing/landing.tsx";

export const Route = createFileRoute("/")({
  component: LandingRoute,
  loader: () => getLandingSnippets(),
  head: () => ({
    meta: [
      {
        title: "@variablelab/env — contract-first environment configuration",
      },
      {
        name: "description",
        content:
          "Declare every environment variable once with any Standard Schema validator. Validate at boot, before user code runs. Runs in Node, Bun, Deno, browsers, Workers, and Edge.",
      },
    ],
  }),
});

function LandingRoute() {
  const snippets = Route.useLoaderData();
  return <Landing snippets={snippets} />;
}
