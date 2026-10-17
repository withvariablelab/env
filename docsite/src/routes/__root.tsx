import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import type * as React from "react";
import { BASE_PATH } from "#src/lib/base-path.ts";
import appCss from "#src/styles/app.css?url";

// env's card, served by lab.variable.land (1200x630).
const OG_IMAGE = "https://lab.variable.land/og/env.png";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "dark" },
      { name: "theme-color", content: "#14120e" },
      { title: "env docs" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Variable Land" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // The faces every docs page sets above the fold; Plex Mono 500 loads when a page uses it.
      ...["ibm-plex-sans-latin-400-normal", "ibm-plex-sans-latin-500-normal", "ibm-plex-mono-latin-400-normal"].map((font) => ({
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: `${BASE_PATH}/fonts/${font}.woff2`,
        crossOrigin: "anonymous" as const,
      })),
      // env's Sign in ink on a ground square.
      { rel: "icon", type: "image/svg+xml", href: `${BASE_PATH}/favicon.svg` },
      ...[16, 32, 48].map((size) => ({
        rel: "icon",
        type: "image/png",
        sizes: `${size}x${size}`,
        href: `${BASE_PATH}/favicon-${size}.png`,
      })),
      { rel: "apple-touch-icon", sizes: "180x180", href: `${BASE_PATH}/apple-touch-icon.png` },
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
        <RootProvider
          search={{ options: { api: `${BASE_PATH}/api/search` } }}
          // The brand has one palette, and it is dark.
          theme={{ forcedTheme: "dark", defaultTheme: "dark", enableSystem: false }}
        >
          {children}
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
