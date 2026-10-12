import { schema } from "@variablelab/env";
import * as z from "zod";

export const PublicEnv = schema({
  API_BASE_URL: z.url(),
  APP_NAME: z.string().min(1),
});
