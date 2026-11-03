import { describe, expect, it } from "vitest";
import * as z from "zod";
import { defineEnv, envName, readEnv, schema } from "../lib/index.ts";
import { toScreamingSnake } from "../lib/vars.ts";

describe("toScreamingSnake", () => {
  it.each([
    ["sessionCookie", "SESSION_COOKIE"],
    ["db", "DB"],
    ["PORT", "PORT"],
    ["kit", "KIT"],
    ["PUBLIC_URL", "PUBLIC_URL"],
    ["accessKeyId", "ACCESS_KEY_ID"],
  ])("%s -> %s", (input, expected) => {
    expect(toScreamingSnake(input)).toBe(expected);
  });
});

describe("schema()", () => {
  it("returns an object exposing the definition", () => {
    const S = schema({ server: { PORT: z.coerce.number() } });
    expect(S.shape.server.PORT).toBeDefined();
  });

  it("throws when a leaf is not a Standard Schema", () => {
    expect(() =>
      // @ts-expect-error invalid leaf
      schema({ server: { PORT: "nope" } }),
    ).toThrow(/Invalid schema/i);
  });

  it("accepts arbitrarily nested definitions", () => {
    const S = schema({
      a: { b: { c: { D: z.string() } } },
    });
    expect(S.shape.a.b.c.D).toBeDefined();
  });

  it("inlines a nested Schema passed as a branch value", () => {
    const Inner = schema({ API_BASE_URL: z.url(), APP_NAME: z.string() });
    const Outer = schema({
      secrets: { DATABASE_URL: z.string() },
      public: Inner,
    });

    expect(Outer.shape.public.API_BASE_URL).toBeDefined();
    expect(Outer.shape.public.APP_NAME).toBeDefined();
    expect(Outer.shape.secrets.DATABASE_URL).toBeDefined();
    // ensure no brand symbol leaked into the normalized shape
    expect("shape" in Outer.shape.public).toBe(false);
  });

  it("defineEnv reads nested Schemas with auto-naming respecting the merged path", () => {
    const Public = schema({ API_BASE_URL: z.url() });
    const All = schema({
      secrets: { DATABASE_URL: z.string() },
      public: Public,
    });
    const env = defineEnv({
      schema: All,
      config: {},
      runtimeEnv: {
        DATABASE_URL: "postgres://x",
        PUBLIC_API_BASE_URL: "https://api.example.com",
      },
      vars: {
        secrets: null,
      },
    });
    expect(env.secrets.DATABASE_URL).toBe("postgres://x");
    expect(env.public.API_BASE_URL).toBe("https://api.example.com");
  });
});

describe("defineEnv() — auto vars (default convention)", () => {
  const S = schema({
    log: { LEVEL: z.string() },
    server: { PORT: z.coerce.number() },
    sessionCookie: { PREFIX: z.string() },
    db: { kit: { LOGGING: z.stringbool() } },
  });

  it("binds leaves using SCREAMING_SNAKE(path) joined with _", () => {
    const env = defineEnv({
      schema: S,
      config: {},
      runtimeEnv: {
        LOG_LEVEL: "info",
        SERVER_PORT: "3000",
        SESSION_COOKIE_PREFIX: "app",
        DB_KIT_LOGGING: "true",
      },
    });

    expect(env.log.LEVEL).toBe("info");
    expect(env.server.PORT).toBe(3000);
    expect(env.sessionCookie.PREFIX).toBe("app");
    expect(env.db.kit.LOGGING).toBe(true);
  });

  it("converts camelCase categories to SNAKE_CASE", () => {
    const T = schema({ sessionCookie: { SAME_SITE: z.string() } });
    const env = defineEnv({
      schema: T,
      config: {},
      runtimeEnv: { SESSION_COOKIE_SAME_SITE: "lax" },
    });
    expect(env.sessionCookie.SAME_SITE).toBe("lax");
  });

  it("top-level leaves use the key as-is (no prefix)", () => {
    const T = schema({ PORT: z.coerce.number() });
    const env = defineEnv({ schema: T, config: {}, runtimeEnv: { PORT: "4000" } });
    expect(env.PORT).toBe(4000);
  });
});

describe("defineEnv() — explicit vars override the convention", () => {
  const S = schema({
    server: { PORT: z.coerce.number(), HOST: z.string() },
    db: { URL: z.string(), LOGGING: z.stringbool() },
  });

  it("leaf-level override wins over auto-naming", () => {
    const env = defineEnv({
      schema: S,
      config: {},
      vars: { db: { URL: "DATABASE_URL" } },
      runtimeEnv: {
        SERVER_PORT: "3000",
        SERVER_HOST: "0.0.0.0",
        DATABASE_URL: "postgres://x",
        DB_LOGGING: "false",
      },
    });
    expect(env.db.URL).toBe("postgres://x");
    expect(env.db.LOGGING).toBe(false);
    expect(env.server.PORT).toBe(3000);
  });

  it("branch-level string prefix applies to all descendants", () => {
    const env = defineEnv({
      schema: S,
      config: {},
      vars: { server: null, db: "DATABASE" },
      runtimeEnv: {
        PORT: "3000",
        HOST: "localhost",
        DATABASE_URL: "x",
        DATABASE_LOGGING: "true",
      },
    });
    expect(env.server.PORT).toBe(3000);
    expect(env.server.HOST).toBe("localhost");
    expect(env.db.URL).toBe("x");
    expect(env.db.LOGGING).toBe(true);
  });

  // Through the async overload, the last one: when no overload matches, TypeScript 7 reports the last overload's error.
  it('rejects empty string `""` as a branch prefix at type level', async () => {
    const env = await defineEnv({
      schema: S,
      config: Promise.resolve({}),
      vars: {
        // @ts-expect-error use `null` for a flat branch, not the empty string
        server: "",
        db: "DATABASE",
      },
      runtimeEnv: { PORT: "3000", HOST: "localhost", DATABASE_URL: "x", DATABASE_LOGGING: "true" },
    });
    // runtime still tolerates "" for back-compat — the rejection is purely at compile time
    expect(env.server.PORT).toBe(3000);
  });

  it("supports `$` for branch prefix combined with leaf overrides", () => {
    const env = defineEnv({
      schema: S,
      config: {},
      vars: { db: { $: "DATABASE", LOGGING: "POSTGRES_LOGGING" } },
      runtimeEnv: {
        SERVER_PORT: "3000",
        SERVER_HOST: "0.0.0.0",
        DATABASE_URL: "x",
        POSTGRES_LOGGING: "true",
      },
    });
    expect(env.db.URL).toBe("x");
    expect(env.db.LOGGING).toBe(true);
  });

  it("nested branches keep parent-derived prefix when unspecified", () => {
    const T = schema({ db: { kit: { LOGGING: z.stringbool() } } });
    const env = defineEnv({
      schema: T,
      config: {},
      vars: { db: "DATABASE" },
      runtimeEnv: { DATABASE_KIT_LOGGING: "true" },
    });
    expect(env.db.kit.LOGGING).toBe(true);
  });
});

describe("defineEnv() — precedence: env > config > defaults", () => {
  const S = schema({ server: { PORT: z.coerce.number(), HOST: z.string() } });

  it("env var beats config", () => {
    const env = defineEnv({
      schema: S,
      config: { server: { PORT: 3000, HOST: "localhost" } },
      runtimeEnv: { SERVER_PORT: "4000" },
    });
    expect(env.server.PORT).toBe(4000);
    expect(env.server.HOST).toBe("localhost");
  });

  it("config beats defaults", () => {
    const env = defineEnv({
      schema: S,
      defaults: { server: { PORT: 1000, HOST: "0.0.0.0" } },
      config: { server: { PORT: 3000 } },
      runtimeEnv: {},
    });
    expect(env.server.PORT).toBe(3000);
    expect(env.server.HOST).toBe("0.0.0.0");
  });

  it("defaults fill leaves missing everywhere else", () => {
    const env = defineEnv({
      schema: S,
      config: {},
      defaults: { server: { PORT: 1000, HOST: "0.0.0.0" } },
      runtimeEnv: {},
    });
    expect(env.server).toEqual({ PORT: 1000, HOST: "0.0.0.0" });
  });

  it("nested config branches merge with nested defaults", () => {
    const T = schema({
      db: { URL: z.string(), kit: { LOGGING: z.stringbool().or(z.boolean()) } },
    });
    const env = defineEnv({
      schema: T,
      defaults: { db: { kit: { LOGGING: true } } },
      config: { db: { URL: "postgres://x" } },
      runtimeEnv: {},
    });
    expect(env.db.URL).toBe("postgres://x");
    expect(env.db.kit.LOGGING).toBe(true);
  });
});

describe("defineEnv() — validation", () => {
  it("throws naming the dot-path when a required leaf is missing", () => {
    expect(() =>
      defineEnv({
        schema: schema({ server: { PORT: z.coerce.number() } }),
        config: {},
        runtimeEnv: {},
      }),
    ).toThrow(/server\.PORT/);
  });

  it("throws naming the dot-path when a value fails the zod schema", () => {
    expect(() =>
      defineEnv({
        schema: schema({ server: { PORT: z.coerce.number().int().positive() } }),
        config: {},
        runtimeEnv: { SERVER_PORT: "-1" },
      }),
    ).toThrow(/server\.PORT/);
  });
});

describe("defineEnv() — shorthands", () => {
  it("attaches $name, IS_DEV, IS_TEST, IS_PROD", () => {
    const S = schema({});
    const env = defineEnv({ schema: S, config: {}, runtimeEnv: { ENV: "production" } });
    expect(env.$name).toBe("production");
    expect(env.IS_PROD).toBe(true);
    expect(env.IS_DEV).toBe(false);
    expect(env.IS_TEST).toBe(false);
  });

  it("falls back to 'development' when no env name is present", () => {
    const env = defineEnv({ schema: schema({}), config: {}, runtimeEnv: {} });
    expect(env.$name).toBe("development");
    expect(env.IS_DEV).toBe(true);
  });
});

describe("readEnv() — defensive fallback", () => {
  it("returns process.env when process is available", () => {
    process.env.__VLANDOSS_ENV_TEST__ = "1";
    try {
      expect(readEnv().__VLANDOSS_ENV_TEST__).toBe("1");
    } finally {
      delete process.env.__VLANDOSS_ENV_TEST__;
    }
  });

  it("returns {} when process exists but process.env is missing", () => {
    const original = process.env;
    // @ts-expect-error simulating a runtime where process exists but env doesn't
    process.env = undefined;
    try {
      expect(readEnv()).toEqual({});
    } finally {
      process.env = original;
    }
  });

  it("returns {} when process is undefined (Workers-like runtime)", () => {
    const original = globalThis.process;
    // @ts-expect-error simulating a runtime without process (Cloudflare Workers)
    delete globalThis.process;
    try {
      expect(readEnv()).toEqual({});
    } finally {
      globalThis.process = original;
    }
  });

  it("defineEnv still works when process is undefined as long as runtimeEnv is passed", () => {
    const original = globalThis.process;
    // @ts-expect-error simulating a Worker `fetch(req, env)` handler scenario
    delete globalThis.process;
    try {
      const env = defineEnv({
        schema: schema({ server: { PORT: z.coerce.number() } }),
        config: {},
        runtimeEnv: { SERVER_PORT: "8787" },
      });
      expect(env.server.PORT).toBe(8787);
    } finally {
      globalThis.process = original;
    }
  });
});

describe("envName()", () => {
  it.each([
    [{ ENV: "test" }, "test"],
    [{ NODE_ENV: "production" }, "production"],
    [{ VITE_ENV: "staging" }, "staging"],
    [{}, "development"],
  ])("resolves %j -> %s", (env, expected) => {
    expect(envName(env)).toBe(expected);
  });

  it("prefers ENV over NODE_ENV", () => {
    expect(envName({ ENV: "test", NODE_ENV: "production" })).toBe("test");
  });

  it("falls back to __ENV_NAME__ (build-time inject) when present, beating NODE_ENV", () => {
    // simulate Vite's `define` substitution by assigning to globalThis
    // biome-ignore lint/suspicious/noExplicitAny: simulating Vite's `define` substitution
    (globalThis as any).__ENV_NAME__ = "staging";
    try {
      // NODE_ENV is "production" (Vite forces this) but the build-time literal is "staging" — staging wins
      expect(envName({ NODE_ENV: "production" })).toBe("staging");
      // ENV still beats build-time inject (explicit runtime override always wins)
      expect(envName({ ENV: "qa", NODE_ENV: "production" })).toBe("qa");
    } finally {
      // biome-ignore lint/suspicious/noExplicitAny: cleanup
      delete (globalThis as any).__ENV_NAME__;
    }
  });
});

describe("vars / defaults — runtime acceptance", () => {
  const S = schema({
    server: { PORT: z.coerce.number(), HOST: z.string() },
    db: { URL: z.string() },
  });

  it("accepts a well-shaped vars object", () => {
    const env = defineEnv({
      schema: S,
      config: {},
      vars: { server: { PORT: "PORT" }, db: "DATABASE" },
      runtimeEnv: { PORT: "3000", SERVER_HOST: "x", DATABASE_URL: "y" },
    });
    expect(env.server.PORT).toBe(3000);
  });

  it("accepts a well-shaped defaults object", () => {
    const env = defineEnv({
      schema: S,
      config: {},
      defaults: { server: { PORT: 3000, HOST: "localhost" }, db: { URL: "postgres://x" } },
      runtimeEnv: {},
    });
    expect(env.server.PORT).toBe(3000);
  });
});

describe("defineEnv() — config input shapes", () => {
  const S = schema({
    server: { PORT: z.coerce.number().int(), HOST: z.string() },
  });

  it("accepts a plain object", () => {
    const env = defineEnv({
      schema: S,
      config: { server: { PORT: 3000, HOST: "localhost" } },
      runtimeEnv: {},
    });
    expect(env.server.PORT).toBe(3000);
  });

  it("unwraps an ESM module namespace via Symbol.toStringTag", () => {
    // Synthesize the shape returned by `await import("...")`
    const moduleNamespace = Object.assign(Object.create(null), {
      default: { server: { PORT: 4242, HOST: "from-module" } },
      [Symbol.toStringTag]: "Module",
    });
    const env = defineEnv({
      schema: S,
      config: moduleNamespace,
      runtimeEnv: {},
    });
    expect(env.server.PORT).toBe(4242);
    expect(env.server.HOST).toBe("from-module");
  });

  it("unwraps a transpiled __esModule namespace", () => {
    const cjsModule = {
      __esModule: true,
      default: { server: { PORT: 5555, HOST: "cjs" } },
    };
    const env = defineEnv({
      schema: S,
      config: cjsModule,
      runtimeEnv: {},
    });
    expect(env.server.PORT).toBe(5555);
  });

  it("does NOT unwrap a plain object that just happens to have a 'default' key", () => {
    // No Symbol.toStringTag, no __esModule — treat as plain config that the user
    // genuinely shaped this way (rare, but allowed).
    const looksLikeModule = {
      default: { server: { PORT: 6666, HOST: "wrong" } },
      // user's actual config keys at top level
      server: { PORT: 7777, HOST: "right" },
    };
    const env = defineEnv({
      schema: S,
      config: looksLikeModule as never,
      runtimeEnv: {},
    });
    expect(env.server.PORT).toBe(7777);
    expect(env.server.HOST).toBe("right");
  });

  it("awaits a Promise that resolves to a plain object", async () => {
    const env = await defineEnv({
      schema: S,
      config: Promise.resolve({ server: { PORT: 8888, HOST: "async" } }),
      runtimeEnv: {},
    });
    expect(env.server.PORT).toBe(8888);
  });

  it("awaits a Promise that resolves to a module namespace and unwraps it", async () => {
    const moduleNamespace = Object.assign(Object.create(null), {
      default: { server: { PORT: 9999, HOST: "async-module" } },
      [Symbol.toStringTag]: "Module",
    });
    const env = await defineEnv({
      schema: S,
      config: Promise.resolve(moduleNamespace),
      runtimeEnv: {},
    });
    expect(env.server.PORT).toBe(9999);
    expect(env.server.HOST).toBe("async-module");
  });
});
