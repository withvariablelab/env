import { EnvScript } from "@variablelab/env/react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import { env as serverEnv } from "./env/env.server.ts";

export const loader = () => ({
  runtimeEnv: {
    ENV: serverEnv.$name,
    API_BASE_URL: serverEnv.public.API_BASE_URL,
    APP_NAME: serverEnv.public.APP_NAME,
  },
});

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { runtimeEnv } = useLoaderData<typeof loader>();
  return (
    <>
      <EnvScript runtimeEnv={runtimeEnv} />
      <Outlet />
    </>
  );
}
