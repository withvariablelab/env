import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "#src/components/brand-mark.tsx";
import { GithubIcon } from "#src/components/github-icon.tsx";
import { LANDING_META } from "./data.ts";

type NavLink = { label: string; href: string; external?: boolean };

const LINKS: readonly NavLink[] = [
  { label: "Docs", href: "/docs/" },
  { label: "API", href: "/docs/api-reference/" },
  { label: "Guides", href: "/docs/guides/" },
  { label: "Changelog", href: `${LANDING_META.githubUrl}/releases`, external: true },
] as const;

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      data-landing-nav
      data-open={open}
      className="
        relative z-10 flex items-center justify-between
        gap-3 border-b border-landing-border
        px-16 py-6.5
        @max-[1100px]/dirA:px-10 @max-[1100px]/dirA:py-5.5
        @max-[760px]/dirA:px-7 @max-[760px]/dirA:py-4.5
        @max-[480px]/dirA:px-5 @max-[480px]/dirA:py-4
      "
    >
      <div className="flex items-center gap-3">
        <BrandMark size={24} />
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-landing-text">
          @variablelab<span className="mx-px text-landing-dim-2">/</span>env
        </span>
        <a href={LANDING_META.npmUrl} target="_blank" rel="noreferrer">
          <span
            className="ml-1.5 rounded-sm border border-landing-border-strong
            px-1.75 py-0.75 font-landing-mono text-[11px] text-landing-dim transition-colors hover:text-landing-accent
            @max-[480px]/dirA:hidden hover:border-landing-accent"
          >
            {LANDING_META.version}
          </span>
        </a>
      </div>

      <nav
        className="
          flex items-center gap-7
          @max-[760px]/dirA:gap-4.5
          @max-[480px]/dirA:hidden
        "
      >
        {LINKS.map((link, i) => {
          const className = `
              text-sm text-landing-dim no-underline transition-colors hover:text-landing-text
              @max-[760px]/dirA:data-[link-index='2']:hidden
              @max-[760px]/dirA:data-[link-index='3']:hidden
            `;
          return link.external ? (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              data-nav-link
              data-link-index={i}
              className={className}
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.label} to={link.href} data-nav-link data-link-index={i} className={className}>
              {link.label}
            </Link>
          );
        })}
        <a
          href={LANDING_META.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="
            inline-flex items-center gap-2 rounded-md
            border border-landing-border-strong px-3 py-1.5
            text-sm text-landing-dim no-underline transition-colors
            hover:text-landing-text
          "
        >
          <GithubIcon size={14} />
          GitHub
        </a>
      </nav>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="
          hidden size-9.5 items-center justify-center rounded-[7px]
          border border-landing-border-strong bg-transparent text-landing-text
          transition-colors hover:border-landing-dim
          @max-[480px]/dirA:inline-flex
          data-[open=true]:border-landing-accent data-[open=true]:text-landing-accent
        "
        data-open={open || undefined}
      >
        {open ? <X size={16} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
      </button>

      <div
        aria-hidden={!open}
        data-open={open}
        className="
          pointer-events-none absolute inset-x-0 top-full z-10
          hidden -translate-y-2 flex-col bg-landing-bg
          border-b border-landing-border opacity-0 px-5 pb-5 pt-2
          shadow-[0_24px_40px_-20px_rgba(0,0,0,0.6)]
          transition-[opacity,transform] duration-150 ease-out
          data-[open=true]:pointer-events-auto data-[open=true]:translate-y-0 data-[open=true]:opacity-100
          @max-[480px]/dirA:flex
        "
      >
        {LINKS.map((link) => {
          const className = `
              flex items-center justify-between border-b border-landing-border
              px-1 py-4 text-base tracking-[-0.005em] text-landing-text no-underline
              last:border-b-0
            `;
          return link.external ? (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className={className}
            >
              <span>{link.label}</span>
              <span className="text-sm text-landing-dim-2">→</span>
            </a>
          ) : (
            <Link key={link.label} to={link.href} onClick={() => setOpen(false)} className={className}>
              <span>{link.label}</span>
              <span className="text-sm text-landing-dim-2">→</span>
            </Link>
          );
        })}
        <a
          href={LANDING_META.githubUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => setOpen(false)}
          className="
            mt-2 flex items-center justify-between rounded-lg
            border border-landing-border-strong bg-landing-panel
            px-3.5 py-3.5 text-base text-landing-text no-underline
          "
        >
          <span className="inline-flex items-center gap-2.5">
            <GithubIcon size={16} />
            GitHub
          </span>
          <span className="text-sm text-landing-dim-2">→</span>
        </a>
      </div>
    </header>
  );
}
