// @ts-ignore
import hljs from "highlight.js";
// @ts-ignore
import MarkdownIt from "markdown-it";
// @ts-ignore
import markMiddleware from "markdown-it-mark";
// @ts-ignore
import markdownItTocAndAnchor from "markdown-it-toc-and-anchor";
import { logger } from "onefx/lib/integrated-gateways/logger";

export const mdit = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {
        logger.error("failed to highlight hljs.getLanguage", err);
      }
    }

    return ""; // use external default escaping
  }
})
  .use(markMiddleware)
  .use(markdownItTocAndAnchor, {
    anchorLinkBefore: false,
    anchorLinkSymbol: "",
    anchorLinkSymbolClassName: "markdownIt-Link-Anchor"
  });
