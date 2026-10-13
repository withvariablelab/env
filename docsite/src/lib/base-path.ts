// Vite's `base` without the trailing slash (`/env/` → `/env`). Router `Link`s add it on
// their own; prefix it wherever a path leaves the router: raw `<a href>`, `fetch()`, `<head>`
// assets, text endpoints and the Worker entry.
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
