import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { LANDING_META, RUNTIMES } from "./data.ts";
import { HeroCodeCard } from "./hero-code-card.tsx";

type Snippets = {
  schemaHtml: string;
  wireHtml: string;
};

const INSTALL_CMD = "pnpm add @variablelab/env";

export function Hero({ snippets }: { snippets: Snippets }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      className="
        relative grid items-center
        grid-cols-[1fr_1.05fr] gap-[72px]
        px-16 pb-[120px] pt-24
        @max-[1100px]/dirA:grid-cols-[minmax(0,1fr)]
        @max-[1100px]/dirA:gap-14 @max-[1100px]/dirA:px-10 @max-[1100px]/dirA:pb-24 @max-[1100px]/dirA:pt-[72px]
        @max-[760px]/dirA:px-7 @max-[760px]/dirA:pb-20 @max-[760px]/dirA:pt-14 @max-[760px]/dirA:gap-11
        @max-[480px]/dirA:px-5 @max-[480px]/dirA:pb-16 @max-[480px]/dirA:pt-10 @max-[480px]/dirA:gap-8
      "
    >
      <div className="min-w-0">
        <div
          className="
            mb-8 inline-flex items-center gap-2.5
            text-[11.5px] uppercase tracking-[0.12em] text-landing-accent
            @max-[480px]/dirA:mb-5 @max-[480px]/dirA:text-[10.5px]
          "
        >
          <span
            className="
              inline-block h-[7px] w-[7px] rounded-full bg-landing-accent
              shadow-[0_0_0_3px_rgba(52,211,153,0.15)]
            "
            aria-hidden
          />
          contract-first environment configuration
        </div>

        <h1
          className="
            mb-8 text-[64px] font-medium leading-[1.02] tracking-[-0.035em]
            text-pretty
            @max-[1100px]/dirA:text-[56px]
            @max-[760px]/dirA:text-5xl @max-[760px]/dirA:tracking-[-0.03em]
            @max-[480px]/dirA:mb-[22px] @max-[480px]/dirA:text-[36px] @max-[480px]/dirA:leading-[1.04] @max-[480px]/dirA:tracking-tight
          "
        >
          Your env, declared <br className="@max-[480px]/dirA:hidden" />
          <span className="font-medium italic text-landing-accent">once</span> and validated{" "}
          <br className="@max-[480px]/dirA:hidden" />
          before user code runs.
        </h1>

        <p
          className="
            mb-9 max-w-[56ch] text-[17px] leading-[1.55] text-pretty text-landing-dim
            @max-[760px]/dirA:text-base
            @max-[480px]/dirA:mb-7 @max-[480px]/dirA:text-[15px]
          "
        >
          Describe every variable in a single Standard Schema contract — Zod, Valibot, ArkType. Resolve it against per-environment
          config files and your environment variables at boot. Missing or malformed values fail the process before user code ever
          reads them.
        </p>

        <div
          className="
            mb-8 flex flex-wrap items-center gap-3
            @max-[760px]/dirA:flex-col @max-[760px]/dirA:items-stretch
          "
        >
          <Link
            to={LANDING_META.docsHref}
            className="
              group inline-flex items-center justify-center gap-2.5
              rounded-lg border border-landing-accent bg-landing-accent
              px-[18px] py-[11px] text-sm font-medium text-[#06231b] no-underline
              transition-colors hover:bg-[#4ce0a8]
            "
          >
            Read the docs
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={onCopy}
            className="
              inline-flex items-center justify-center gap-2.5
              rounded-lg border border-landing-border-strong bg-transparent
              px-[18px] py-[11px] font-landing-mono text-[13px] text-landing-text
              transition-colors hover:border-landing-dim hover:bg-landing-panel
              @max-[760px]/dirA:text-[12.5px]
            "
          >
            <span className="text-landing-dim-2">$</span>
            {INSTALL_CMD}
            <span className="ml-2 inline-flex items-center text-landing-dim-2">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </span>
          </button>
        </div>

        <div
          className="
            flex flex-wrap items-center gap-2
            @max-[480px]/dirA:gap-1.5
          "
        >
          <span
            className="
              mr-1 font-landing-mono text-[11px] tracking-wider text-landing-dim-2
            "
          >
            runtime-agnostic ·
          </span>
          {RUNTIMES.map((r) => (
            <span
              key={r}
              className="
                rounded-[4px] border border-landing-border-strong
                px-[9px] py-1 font-landing-mono text-[11px] text-landing-dim
                @max-[480px]/dirA:px-2 @max-[480px]/dirA:py-[3px] @max-[480px]/dirA:text-[10.5px]
              "
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="relative min-w-0">
        <HeroCodeCard snippets={snippets} />
        <div
          className="
            absolute bottom-[-22px] right-[38px]
            inline-flex items-center gap-2.5
            rounded-lg border border-landing-border-strong bg-landing-bg
            px-3.5 py-2 font-landing-mono text-xs
            shadow-[0_12px_24px_-12px_rgba(0,0,0,0.6)]
            @max-[760px]/dirA:right-3 @max-[760px]/dirA:-bottom-4 @max-[760px]/dirA:px-2.5 @max-[760px]/dirA:py-[7px] @max-[760px]/dirA:text-[11px]
            @max-[480px]/dirA:hidden
          "
        >
          <span className="text-landing-dim-2">env.server.PORT</span>
          <span className="text-landing-dim-2">→</span>
          <span className="text-landing-accent">number</span>
        </div>
      </div>
    </section>
  );
}
