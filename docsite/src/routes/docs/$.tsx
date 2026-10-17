import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { Suspense } from "react";
import browserCollections from "#collections/browser.ts";
import { LLMCopyButton, ViewOptions } from "#src/components/ai/page-actions.tsx";
import { useMDXComponents } from "#src/components/mdx.tsx";
import { Signature } from "#src/components/signature.tsx";
import { BASE_PATH } from "#src/lib/base-path.ts";
import { baseOptions } from "#src/lib/layout.shared.tsx";
import { source } from "#src/lib/source.ts";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — env docs` },
          ...(loaderData.description ? [{ name: "description", content: loaderData.description }] : []),
        ]
      : [],
  }),
});

const serverLoader = createServerFn({ method: "GET" })
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MDX }, props: { url: string }) {
    const slug = props.url === "/docs" ? "/index" : props.url.replace(/^\/docs/, "");
    const markdownUrl = `${BASE_PATH}${props.url}.mdx`;
    const githubUrl = `https://github.com/withvariablelab/env/blob/main/docsite/content/docs${slug}.mdx`;

    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        {/* The paragraph under a title is secondary prose: ink-muted, not dim. */}
        <DocsDescription className="text-(--vlab-ink-muted)">{frontmatter.description}</DocsDescription>
        <div className="flex flex-row items-center justify-end gap-1 border-b pb-4 md:justify-start md:gap-2">
          <LLMCopyButton markdownUrl={markdownUrl} />
          <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
        </div>
        <DocsBody>
          <MDX components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData());

  // The Signature goes in the sidebar footer: the foot of the sidebar on desktop and of
  // the menu on phones, on every docs page and away from env's Sign at the top.
  return (
    <DocsLayout {...baseOptions()} tree={data.pageTree} sidebar={{ footer: <Signature /> }}>
      <Suspense>{clientLoader.useContent(data.path, { url: data.url })}</Suspense>
    </DocsLayout>
  );
}
