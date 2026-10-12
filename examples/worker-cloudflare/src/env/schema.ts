import { type Config, schema } from "@variablelab/env";
import * as e from "@variablelab/env/zod";
import * as z from "zod";

// No `server.PORT` / `server.HOST` here — Workers handle networking. Everything
// else is the same shape as the Node and Bun examples.
export const Env = schema({
  log: { LEVEL: e.logLevel },
  db: {
    URL: z.url(),
    LOGGING: e.bool.default(false),
  },
});

export type EnvConfig = Config<typeof Env>;
export type EnvBindings = {
  LOG_LEVEL: string;
  DATABASE_URL: string;
  DB_LOGGING: string;
};
