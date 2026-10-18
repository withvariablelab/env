import { expect, test } from "@playwright/test";

test("loads development config via auto-discovery", async ({ request }) => {
  const res = await request.get("/env");

  expect(res.ok()).toBe(true);
  expect(await res.json()).toStrictEqual({
    env: {
      $name: "development",
      IS_DEV: true,
      IS_PROD: false,
      IS_TEST: false,
      log: { LEVEL: "debug" },
      server: { PORT: 3012, HOST: "127.0.0.1" },
      db: { URL: "postgres://localhost/dev", LOGGING: true },
    },
  });
});

test("/health responds with current env name", async ({ request }) => {
  const res = await request.get("/health");

  expect(res.ok()).toBe(true);
  expect(await res.json()).toStrictEqual({ ok: true });
});
