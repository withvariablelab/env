import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import type * as React from "react";
import { SITE_URL } from "#src/components/landing/data.ts";
import appCss from "#src/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0a0a0b" },
      { title: "@variablelab/env docs" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "@variablelab/env" },
      { property: "og:image", content: `${SITE_URL}/social/og-card.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/social/twitter-card.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/geist-latin-wght-normal.woff2", crossOrigin: "anonymous" },
      { rel: "preload", as: "font", type: "font/woff2", href: "/fonts/geist-latin-wght-italic.woff2", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/geist-mono-latin-wght-normal.woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon/favicon-16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon/favicon-48.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/app-icon/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
