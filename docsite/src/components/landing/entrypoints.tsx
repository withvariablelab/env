import { ENTRYPOINTS, VALIDATORS } from "./data.ts";
import { SectionHead } from "./section-head.tsx";

export function Entrypoints() {
  return (
    <section
      className="
        px-16 pb-10
        @max-[1100px]/dirA:px-10
        @max-[760px]/dirA:px-7
        @max-[480px]/dirA:px-5
      "
    >
      <SectionHead num="02" title="Five entrypoints. Import only what you run.">
        The core stays portable. Filesystem, bundlers, and browser hydration live in opt-in adapters with their own peer
        dependencies.
      </SectionHead>

      <div
        className="
          grid gap-[18px]
          grid-cols-3
          @max-[1100px]/dirA:grid-cols-2
          @max-[480px]/dirA:grid-cols-1 @max-[480px]/dirA:gap-3
        "
      >
        {ENTRYPOINTS.map((e, i) => (
          <article
            key={e.pkg}
            data-featured={i === 0 || undefined}
            className="
              relative flex min-h-[220px] flex-col gap-3.5 overflow-hidden rounded-xl
              border border-landing-border bg-landing-panel p-6
              transition-colors hover:border-landing-border-strong
              data-featured:border-landing-accent-dim
              data-featured:bg-[radial-gradient(ellipse_100%_80%_at_0%_0%,rgba(52,211,153,0.08),transparent_60%),var(--color-landing-panel)]
              @max-[1100px]/dirA:data-featured:col-span-2
              @max-[480px]/dirA:data-featured:col-span-1
              @max-[480px]/dirA:min-h-0 @max-[480px]/dirA:p-5 @max-[480px]/dirA:gap-3
            "
          >
            <header className="flex items-center justify-between">
              <span
                className="
                  font-landing-mono text-[10.5px] uppercase tracking-[0.08em] text-landing-dim
                "
              >
                {e.runtime}
              </span>
              <div className="flex items-center gap-1.5">
                {e.tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                      rounded-[3px] border border-landing-accent-dim
                      px-[7px] py-0.5 font-landing-mono text-[10.5px] tracking-wider text-landing-accent
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            <div
              className="
                flex items-baseline font-landing-mono text-lg font-medium
                tracking-[-0.01em]
                @max-[480px]/dirA:break-all @max-[480px]/dirA:text-base
              "
            >
              <span className="text-landing-dim">@variablelab/</span>
              <span className="text-landing-text">{e.name}</span>
            </div>

            <p className="m-0 flex-1 text-sm leading-normal text-landing-dim">{e.desc}</p>

            <div
              className="
                flex flex-wrap items-center gap-2 border-t border-landing-border
                pt-3.5 font-landing-mono text-[11px] text-landing-dim-2
                @max-[480px]/dirA:text-[10.5px]
              "
            >
              <span>import from</span>
              <code className="text-landing-text">"{e.pkg}"</code>
            </div>
          </article>
        ))}
      </div>

      <div
        className="
          mt-10 flex items-center gap-6 rounded-xl
          border border-dashed border-landing-border-strong
          bg-white/1 px-7 py-6
          @max-[760px]/dirA:flex-col @max-[760px]/dirA:items-start @max-[760px]/dirA:gap-3.5 @max-[760px]/dirA:px-[22px] @max-[760px]/dirA:py-5
          @max-[480px]/dirA:px-[18px] @max-[480px]/dirA:py-[18px]
        "
      >
        <span
          className="
            font-landing-mono text-xs text-landing-dim
            @max-[480px]/dirA:text-[11.5px]
          "
        >
          works with any Standard Schema validator
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          {VALIDATORS.map((v) => (
            <span
              key={v}
              className="
                rounded-md border border-landing-border bg-landing-bg-2
                px-3 py-1.5 text-xs text-landing-text
                @max-[480px]/dirA:px-2.5 @max-[480px]/dirA:py-[5px] @max-[480px]/dirA:text-[11.5px]
              "
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
