import { describe, expect, it } from "vitest";
import * as z from "zod";
import { defineEnv, schema } from "../lib/index.ts";
import * as e from "../zod.ts";

describe("@variablelab/env/zod — primitives compose with schema()", () => {
  const Env = schema({
    server: { PORT: e.port, HOST: e.host },
    log: { LEVEL: e.logLevel, ENABLED: e.bool },
    api: { BASE_URL: z.url() },
    auth: { SECRET: e.secret },
  });

  it("port coerces and validates range", () => {
    const env = defineEnv({
      schema: Env,
      runtimeEnv: {
        SERVER_PORT: "3000",
        SERVER_HOST: "localhost",
        LOG_LEVEL: "info",
        LOG_ENABLED: "true",
        API_BASE_URL: "https://api.example.com",
        AUTH_SECRET: "this-is-a-very-long-secret-1234567890",
      },
    });
    expect(env.server.PORT).toBe(3000);
  });

  it("port rejects out-of-range", () => {
    expect(() =>
      defineEnv({
        schema: Env,
        runtimeEnv: {
          SERVER_PORT: "99999",
          SERVER_HOST: "x",
          LOG_LEVEL: "info",
          LOG_ENABLED: "true",
          API_BASE_URL: "https://x.example",
          AUTH_SECRET: "this-is-a-very-long-secret-1234567890",
        },
      }),
    ).toThrow(/server\.PORT/);
  });

  it("logLevel only accepts the canonical enum values", () => {
    expect(() =>
      defineEnv({
        schema: Env,
        runtimeEnv: {
          SERVER_PORT: "3000",
          SERVER_HOST: "x",
          LOG_LEVEL: "verbose",
          LOG_ENABLED: "false",
          API_BASE_URL: "https://x.example",
          AUTH_SECRET: "this-is-a-very-long-secret-1234567890",
        },
      }),
    ).toThrow(/log\.LEVEL/);
  });

  it("bool accepts stringbool plus real booleans", () => {
    const env = defineEnv({
      schema: Env,
      runtimeEnv: {
        SERVER_PORT: "3000",
        SERVER_HOST: "x",
        LOG_LEVEL: "info",
        LOG_ENABLED: "false",
        API_BASE_URL: "https://x.example",
        AUTH_SECRET: "this-is-a-very-long-secret-1234567890",
      },
    });
    expect(env.log.ENABLED).toBe(false);
  });

  it("secret enforces minimum length", () => {
    expect(() =>
      defineEnv({
        schema: Env,
        runtimeEnv: {
          SERVER_PORT: "3000",
          SERVER_HOST: "x",
          LOG_LEVEL: "info",
          LOG_ENABLED: "true",
          API_BASE_URL: "https://x.example",
          AUTH_SECRET: "short",
        },
      }),
    ).toThrow(/auth\.SECRET/);
  });
});

describe("json — decodes string env vars and accepts decoded config values", () => {
  const Env = schema({
    rateLimit: {
      CONFIG: e.json(z.object({ windowMs: z.number().int().positive(), max: z.number().int().positive() })),
    },
  });

  it("decodes a JSON-string env var into an object", () => {
    const env = defineEnv({
      schema: Env,
      runtimeEnv: { RATE_LIMIT_CONFIG: '{"windowMs":60000,"max":100}' },
    });
    expect(env.rateLimit.CONFIG).toEqual({ windowMs: 60000, max: 100 });
  });

  it("accepts an already-decoded object from config", () => {
    const env = defineEnv({
      schema: Env,
      config: { rateLimit: { CONFIG: { windowMs: 60000, max: 100 } } },
      runtimeEnv: {},
    });
    expect(env.rateLimit.CONFIG).toEqual({ windowMs: 60000, max: 100 });
  });

  it("throws with the dotpath on invalid JSON", () => {
    expect(() =>
      defineEnv({
        schema: Env,
        runtimeEnv: { RATE_LIMIT_CONFIG: "not json" },
      }),
    ).toThrow(/rateLimit\.CONFIG/);
  });
});
