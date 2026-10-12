import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { EnvScript } from "@variablelab/env/react";

const getPublicEnv = createServerFn({ method: "GET" }).handler(async () => {
  const { env } = await import("../env/env.server.ts");
  return {
    ENV: env.$name,
    API_BASE_URL: env.public.API_BASE_URL,
    APP_NAME: env.public.APP_NAME,
  };
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ssr-tanstack-start" },
    ],
  }),
  loader: () => getPublicEnv(),
  component: RootComponent,
});

function RootComponent() {
  const runtimeEnv = Route.useLoaderData();
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <EnvScript runtimeEnv={runtimeEnv} />
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
