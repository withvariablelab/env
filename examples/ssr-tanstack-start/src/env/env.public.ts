import { defineEnv } from "@variablelab/env";
import { PublicEnv } from "./schema.public.ts";

export const env = defineEnv({ schema: PublicEnv });
