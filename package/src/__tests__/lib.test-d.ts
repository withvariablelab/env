import { assertType, describe, expectTypeOf, test } from "vitest";
import * as z from "zod";
import type { AssertEnvVarNames, Config, Defaults, Env, Vars } from "../lib/index.ts";
import { defineEnv, schema } from "../lib/index.ts";

const S = schema({
  server: { PORT: z.coerce.number(), HOST: z.string() },
  db: { URL: z.string() },
});

type Def = (typeof S)["shape"];

describe("Config<S>", () => {
  type C = Config<typeof S>;

  test("accepts a complete config", () => {
    assertType<C>({ server: { PORT: 3000, HOST: "localhost" }, db: { URL: "x" } });
  });

  test("accepts a partial config (branches and leaves both optional)", () => {
    assertType<C>({});
    assertType<C>({ server: { PORT: 3000 } });
  });

  test("rejects wrong leaf types", () => {
    // @ts-expect-error PORT must be number
    assertType<C>({ server: { PORT: "3000" } });
  });

  test("rejects unknown leaves under a known branch", () => {
    // @ts-expect-error UNKNOWN is not in the schema
    assertType<C>({ server: { UNKNOWN: 1 } });
  });

  test("rejects unknown branches", () => {
    // @ts-expect-error 'cache' is not in the schema
    assertType<C>({ cache: { TTL: 60 } });
  });

  test("leaves use InferOutput (post-coerce)", () => {
    expectTypeOf<NonNullable<NonNullable<C["server"]>["PORT"]>>().toEqualTypeOf<number>();
    expectTypeOf<NonNullable<NonNullable<C["server"]>["HOST"]>>().toEqualTypeOf<string>();
  });
});

describe("Vars<Def> shape (Note Vars 1)", () => {
  type V = Vars<Def>;

  test("accepts a well-shaped vars object", () => {
    assertType<V>({ server: { PORT: "PORT" }, db: "DATABASE" });
  });

  test("rejects unknown branches", () => {
    // @ts-expect-error 'cache' is not in the schema
    assertType<V>({ cache: { TTL: "CACHE_TTL" } });
  });

  test("rejects unknown leaves under a known branch", () => {
    // @ts-expect-error UNKNOWN is not a leaf of server
    assertType<V>({ server: { UNKNOWN: "X" } });
  });

  test("rejects non-string values", () => {
    // @ts-expect-error vars values must be string env-var names
    assertType<V>({ server: { PORT: 123 } });
  });
});

describe("Vars uppercase constraint (via AssertEnvVarNames)", () => {
  // DefineEnvOptions intersects V with AssertEnvVarNames<V>; this mirrors the call-site check.
  type Check<V extends Vars<Def>> = V & AssertEnvVarNames<V>;

  test("accepts uppercase env var names", () => {
    type V = { server: { PORT: "PORT" } };
    expectTypeOf<V>().toExtend<Check<V>>();
  });

  test("rejects lowercase literal env var names", () => {
    type V = { server: { PORT: "port" } };
    expectTypeOf<V>().not.toExtend<Check<V>>();
  });
});

describe("Defaults<S> shape (Note Defaults 1, 3)", () => {
  type D = Defaults<typeof S>;

  test("accepts a well-shaped defaults object", () => {
    assertType<D>({ server: { PORT: 3000, HOST: "localhost" }, db: { URL: "x" } });
  });

  test("rejects unknown branches", () => {
    // @ts-expect-error 'cache' is not in the schema
    assertType<D>({ cache: { TTL: 60 } });
  });

  test("rejects unknown leaves under a known branch", () => {
    // @ts-expect-error UNKNOWN is not a leaf of server
    assertType<D>({ server: { UNKNOWN: 1 } });
  });

  test("rejects wrong leaf types", () => {
    // @ts-expect-error PORT default must be number (post-coerce InferOutput)
    assertType<D>({ server: { PORT: "3000" } });
  });
});

describe("defineEnv() return type overloads", () => {
  test("config: plain object -> sync return Env<S>", () => {
    const env = defineEnv({ schema: S, config: { server: { PORT: 3000, HOST: "x" } } });
    expectTypeOf(env).toEqualTypeOf<Env<typeof S>>();
  });

  test("config omitted -> sync return Env<S>", () => {
    const env = defineEnv({ schema: S });
    expectTypeOf(env).toEqualTypeOf<Env<typeof S>>();
  });

  test("config: module namespace (from `await import(...)`) -> sync return Env<S>", () => {
    const moduleNamespace = {
      default: { server: { PORT: 3000, HOST: "x" } },
    } as { default: { server: { PORT: number; HOST: string } }; readonly [Symbol.toStringTag]: "Module" };
    const env = defineEnv({ schema: S, config: moduleNamespace });
    expectTypeOf(env).toEqualTypeOf<Env<typeof S>>();
  });

  test("config: Promise -> async return Promise<Env<S>>", () => {
    const env = defineEnv({
      schema: S,
      config: Promise.resolve({ server: { PORT: 3000, HOST: "x" } }),
    });
    expectTypeOf(env).toEqualTypeOf<Promise<Env<typeof S>>>();
  });

  test("rejects string config at compile time (use @variablelab/env/fs loadConfig instead)", () => {
    // @ts-expect-error config must be an object, module namespace, or Promise
    defineEnv({ schema: S, config: "src/config/*.ts" });
  });
});
