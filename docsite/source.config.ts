import tokens from "@variablelab/brand/tokens.json" with { type: "json" };
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import type { ThemeRegistration } from "shiki";

const syntax = {
  text: tokens.syntax.text.value,
  keyword: tokens.syntax.keyword.value,
  function: tokens.syntax.function.value,
  string: tokens.syntax.string.value,
  comment: tokens.syntax.comment.value,
  gutter: tokens.syntax.gutter.value,
};

// "Syntax: soft Vesper" from the brand's color.md, on `surface`. Each rule colors what
// the role table gives its token; everything else, numbers and types included, is `text`.
const softVesper: ThemeRegistration = {
  name: "variablelab-soft-vesper",
  type: "dark",
  colors: {
    "editor.background": tokens.color.surface.value,
    "editor.foreground": syntax.text,
    "editorLineNumber.foreground": syntax.gutter,
  },
  tokenColors: [
    { settings: { foreground: syntax.text, background: tokens.color.surface.value } },
    {
      // `import`, `from`, `const`, `export`, `as`, operators; JSX attributes.
      scope: ["keyword", "storage.type", "storage.modifier", "entity.other.attribute-name"],
      settings: { foreground: syntax.keyword },
    },
    {
      // Function calls and declarations; HTML (and JSX) tags and HTML attributes; the
      // first token of a shell command.
      scope: [
        "entity.name.function",
        "support.function",
        "variable.function",
        "entity.name.tag",
        "support.class.component",
        "text.html entity.other.attribute-name",
        "entity.name.command",
      ],
      settings: { foreground: syntax.function },
    },
    {
      // Strings; the arguments of a shell command.
      scope: ["string", "string.unquoted.argument"],
      settings: { foreground: syntax.string },
    },
    {
      // Flags and template-literal expressions stay `text` inside their strings.
      scope: ["constant.other.option", "meta.template.expression"],
      settings: { foreground: syntax.text },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: syntax.comment },
    },
  ],
};

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      // One theme. `themes` replaces Fumadocs' light/dark pair, and `defaultColor` writes
      // its colors inline.
      themes: { dark: softVesper },
      defaultColor: "dark",
    },
  },
});

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      // Required so `page.data.getText('processed')` returns markdown for /llms-full.txt
      includeProcessedMarkdown: true,
    },
  },
});
