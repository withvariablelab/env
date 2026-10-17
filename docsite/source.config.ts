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

// "Syntax: soft Vesper" from the brand's color.md, on `surface`. Vesper's rules, scope by
// scope, with its colors replaced by the brand's two accents: white is `text`, gray is
// `keyword`, peach is `function`, mint is `string`, and its third accent (red) is `text`.
// The last three rules are the brand's own, for shell commands.
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
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: syntax.comment } },
    {
      scope: ["variable", "string constant.other.placeholder", "constant.other.color", "invalid", "invalid.illegal"],
      settings: { foreground: syntax.text },
    },
    {
      scope: [
        "keyword",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "punctuation.definition.tag",
        "punctuation.section.embedded",
        "keyword.other.template",
        "keyword.other.substitution",
      ],
      settings: { foreground: syntax.keyword },
    },
    {
      scope: [
        "entity.name.tag",
        "meta.tag.sgml",
        "entity.name.function",
        "variable.function",
        "support.function",
        "keyword.other.special-method",
        "constant.numeric",
        "support.constant",
        "constant.character",
        "constant.escape",
        "keyword.other.unit",
        "keyword.other",
        "constant.language.boolean",
      ],
      settings: { foreground: syntax.function },
    },
    { scope: ["string", "constant.other.symbol", "constant.other.key"], settings: { foreground: syntax.string } },
    { scope: ["entity.name", "support.type", "support.class"], settings: { foreground: syntax.function } },
    {
      scope: [
        "source.css support.type.property-name",
        "source.scss support.type.property-name",
        "source.less support.type.property-name",
        "meta.property-name.css",
        "meta.property-value.css",
      ],
      settings: { foreground: syntax.text },
    },
    {
      scope: ["entity.name.module.js", "variable.import.parameter.js", "variable.other.class.js"],
      settings: { foreground: syntax.text },
    },
    { scope: ["variable.language"], settings: { foreground: syntax.keyword } },
    {
      scope: ["entity.name.method.js", "meta.class-method.js entity.name.function.js", "variable.function.constructor"],
      settings: { foreground: syntax.text },
    },
    {
      // JSX attributes.
      scope: ["entity.other.attribute-name", "meta.selector.css", "punctuation.separator.key-value.css"],
      settings: { foreground: syntax.keyword },
    },
    {
      // HTML attributes, CSS classes and ids.
      scope: ["text.html entity.other.attribute-name", "entity.other.attribute-name.class", "entity.other.attribute-name.id"],
      settings: { foreground: syntax.function },
    },
    { scope: ["markup.inserted"], settings: { foreground: syntax.string } },
    { scope: ["markup.deleted"], settings: { foreground: syntax.text } },
    { scope: ["markup.changed", "string.regexp", "constant.character.escape"], settings: { foreground: syntax.keyword } },
    { scope: ["source.js constant.other.object.key.js string.unquoted.label.js"], settings: { foreground: syntax.text } },
    { scope: ["support.type.property-name.json"], settings: { foreground: syntax.function } },
    { scope: ["markup.heading", "markdown.heading"], settings: { foreground: syntax.function } },
    // The first token of a shell command, its arguments, and what stays `text` inside a
    // string: flags and template-literal expressions.
    { scope: ["entity.name.command"], settings: { foreground: syntax.function } },
    { scope: ["string.unquoted.argument"], settings: { foreground: syntax.string } },
    { scope: ["constant.other.option", "meta.template.expression"], settings: { foreground: syntax.text } },
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
