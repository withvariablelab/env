import { Link } from "@tanstack/react-router";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Sign } from "#src/components/sign.tsx";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      url: "/docs",
      // The Sign and the name are one link; the package name is metadata beside it.
      title: ({ href, className }) => (
        <div className={className}>
          <Link to={href ?? "/docs"} className="inline-flex items-center gap-2.5 text-[13px] font-medium text-fd-foreground">
            <Sign className="shrink-0" />
            env
          </Link>
          <span className="font-mono text-xs font-normal text-fd-muted-foreground">@variablelab/env</span>
        </div>
      ),
    },
    themeSwitch: { enabled: false },
    githubUrl: "https://github.com/withvariablelab/env",
  };
}
