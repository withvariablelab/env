// TanStack Start v1.167+ outputs a Web-standard fetch handler (`dist/server/server.js`),
// not a runnable server. This file bridges it to a Node HTTP listener via srvx —
// the same adapter TanStack Start uses internally — so `node serve.js` brings the
// app up on the requested port.
import { serve } from "srvx/node";
import handler from "./dist/server/server.js";

const port = Number(process.env.PORT) || 3006;
serve({ fetch: handler.fetch, port });
console.log(`tss-prod-app listening on http://127.0.0.1:${port}`);
