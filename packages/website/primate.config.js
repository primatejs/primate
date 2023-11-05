import priss from "./module.js";
import esbuild from "@primate/esbuild";
import liveview from "@primate/liveview";
import { svelte, markdown } from "@primate/frontend";
import hljs from "highlight.js/lib/core";

import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import http from "highlight.js/lib/languages/http";
import plaintext from "highlight.js/lib/languages/plaintext";
import md from "highlight.js/lib/languages/markdown";
import handlebars from "highlight.js/lib/languages/handlebars";
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("http", http);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("md", md);
hljs.registerLanguage("hbs", handlebars);

const master = (i) => i;

export default {
  http: {
    host: "0.0.0.0",
  },
  logger: {
    trace: true,
  },
  modules: [
    svelte(),
    esbuild({ ignores: ["woff2", "jpg"] }),
    liveview(),
    markdown({
      directory: "content",
      options: {
        hooks: {
          postprocess(html) {
            return html.replaceAll(/!!!\n(.*?)\n!!!/gus, (_, p1) =>
              `<div class="box">${p1}</div>`);
          },
        },
        renderer: {
          code(code, infostring) {
            const [language] = infostring.split(" ");
            const caption = [...infostring
              .matchAll(/caption=(?<caption>.*)/ug)][0]?.groups.caption;
            const top = caption ? `<div class="caption">${caption}</div>` : "";
            const { value } = hljs.highlight(code, { language });
            return `${top}<pre><code>${value}</code></pre>`;
          },
          heading(text, level) {
            const name = text.toLowerCase().replaceAll(/[?{}%]/gu, "")
              .replace(/[^\w]+/gu, "-");
            const href = "%REPO%/edit/master/docs%PATHNAME%.md";
            const editThisPage = `
              <a href="${href}" class="edit-this-page">
                <svg class="icon" width="16" height="16">
                  <use xlink:href="#edit" />
                </svg>
                Edit this page on GitHub
              </a>
            `;

            return `
              <h${level}>
                ${text}
              </h${level}>
              <a name="${name}" class="anchor" href="#${name}">
                <span class="header-link"></span>
              </a>
              ${level === 1 ? editThisPage : ""}
            `;
          },
        },
      },
    }),
    priss({
      blog: true,
      title: "Primate",
      description: "Expressive, minimal and extensible web framework",
      root: "content",
      theme: master({
        navbar: [
          { label: "Guide", link: "/guide/getting-started" },
          { label: "Modules", link: "/modules/official" },
          { label: "Blog", link: "/blog" },
        ],
        sidebar: {
          guide: [
            { heading: "Introduction" },
            "Getting started",
            "Project structure",
            "Configuration",
            "Use cases",
            { heading: "Concepts" },
            "Routes",
            "Responses",
            "Types",
            "Guards",
            "Components",
            "Layouts",
            "Errors",
            { heading: "Modules" },
            "Extending Primate",
            "Hooks",
            { heading: "Extras" },
            "Logging",
          ],
          reference: [
            { heading: "Errors" },
            {
              errors: ["primate", "primate/store", "primate/ws"],
            },
          ],
          modules: [
            { heading: "Modules" },
            "Official",
            "Third-party",
            { heading: "Handlers" },
            "Frontend",
            "Svelte",
            "React",
            "Solid",
            "Vue",
            "HTMX",
            "Handlebars",
            "Markdown",
            { heading: "Data" },
            "Types",
            "Store",
            "Drivers",
            { heading: "Others" },
            "Liveview",
            "Session",
            "I18N",
            "WebSocket",
            "Build",
          ],
        },
        github: "primatejs/primate",
        x: "primatejs",
        chat: "https://web.libera.chat#primate",
        reddit: "r/primatejs",
      }),
    }),
  ],
};
