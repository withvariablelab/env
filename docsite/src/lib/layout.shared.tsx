import { Link } from "@tanstack/react-router";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BrandMark } from "#src/components/brand-mark.tsx";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      url: "/docs",
      title: ({ href, className }) => (
        <div className={className}>
          <Link to="/" aria-label="@variablelab/env home">
            <BrandMark />
          </Link>
          <Link to={href ?? "/docs"}>@variablelab/env</Link>
        </div>
      ),
    },
    githubUrl: "https://github.com/withvariablelab/env",
  };
}
