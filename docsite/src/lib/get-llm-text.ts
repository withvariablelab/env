import { BASE_PATH } from "#src/lib/base-path.ts";
import type { source } from "#src/lib/source.ts";

export async function getLLMText(page: ReturnType<(typeof source)["getPage"]> & object) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${BASE_PATH}${page.url})

${processed}`;
}
