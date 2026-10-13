---
"@variablelab/env": patch
---

Renamed from `@vlandoss/env`. The package now lives at [withvariablelab/env](https://github.com/withvariablelab/env) and is published as `@variablelab/env`; the API is unchanged. To migrate, swap the dependency and update the import specifiers:

```bash
pnpm remove @vlandoss/env && pnpm add @variablelab/env
```

```diff
- import { defineEnv } from "@vlandoss/env";
- import * as e from "@vlandoss/env/zod";
+ import { defineEnv } from "@variablelab/env";
+ import * as e from "@variablelab/env/zod";
```

The same applies to the `/fs`, `/vite` and `/react` entry points. The `@variablelab/env/vite` "no config file found" error message now carries the new package name.
