import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import type * as React from "react";
import { SITE_URL } from "#src/components/landing/data.ts";
import { BASE_PATH } from "#src/lib/base-path.ts";
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
      ...["geist-latin-wght-normal", "geist-latin-wght-italic", "geist-mono-latin-wght-normal"].map((font) => ({
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: `${BASE_PATH}/fonts/${font}.woff2`,
        crossOrigin: "anonymous" as const,
      })),
      ...[16, 32, 48].map((size) => ({
        rel: "icon",
        type: "image/png",
        sizes: `${size}x${size}`,
        href: `${BASE_PATH}/favicon/favicon-${size}.png`,
      })),
      { rel: "apple-touch-icon", sizes: "180x180", href: `${BASE_PATH}/app-icon/apple-touch-icon.png` },
      { rel: "manifest", href: `${BASE_PATH}/manifest.webmanifest` },
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
        <RootProvider search={{ options: { api: `${BASE_PATH}/api/search` } }}>{children}</RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
