import { type Config, schema } from "@variablelab/env";
import * as e from "@variablelab/env/zod";
import * as z from "zod";

export const Env = schema({
  log: { LEVEL: e.logLevel },
  server: { PORT: e.port, HOST: e.host },
  db: {
    URL: z.url(),
    LOGGING: e.bool.default(false),
  },
});

export type EnvConfig = Config<typeof Env>;
