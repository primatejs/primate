import { Path } from "rcompat/fs";
import { esbuild } from "@primate/build";
import liveview from "@primate/liveview";
import { svelte, markdown, handlebars } from "@primate/frontend";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";

import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import http from "highlight.js/lib/languages/http";
import plaintext from "highlight.js/lib/languages/plaintext";
import md from "highlight.js/lib/languages/markdown";
import hbs from "highlight.js/lib/languages/handlebars";
import go from "highlight.js/lib/languages/go";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import priss from "./module.js";

hljs.registerLanguage("js", js);
hljs.registerLanguage("ts", ts);
hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("http", http);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("md", md);
hljs.registerLanguage("hbs", hbs);
hljs.registerLanguage("go", go);
hljs.registerLanguage("py", python);
hljs.registerLanguage("rb", ruby);

const master = i => i;

export default {
  http: {
    host: "0.0.0.0",
  },
  logger: {
    trace: true,
  },
  modules: [
    svelte(),
    handlebars(),
    esbuild({ ignores: ["woff2", "jpg"] }),
    liveview(),
    markdown({
      options: {
        hooks: {
          preprocess(html) {
            return html.replaceAll(/%%%(.*?)\n(.*?)%%%/gus, (_, p1, p2) => {
              const t =
              p2
                .split("\n```")
                .filter(p => p !== "" && !p.startsWith("\n"))
                .map((p, i) => `<div${i !== 0 ? " class='hidden'" : ""}>

\`\`\`${p}
\`\`\`

</div>`).join("");
              return `<div class="tabbed"><span class="captions">${
                p1.split(",").map((caption, i) => `<span${i === 0 ? " class='active'" : ""}>${caption}</span>`).join("")
              }</span><span class="tabs">${t}</span></div>`;
            });
          },
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
            const edit_this_page = `
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
              ${level === 1 ? edit_this_page : ""}
            `;
          },
        },
      },
    }),
    priss({
      blog: true,
      title: "Primate",
      description: "Polymorphic development platform",
      root: new Path("components", "content"),
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
            { heading: "Frontends" },
            "Frontend",
            "Svelte",
            "React",
            "Solid",
            "Vue",
            "Web Components",
            "HTMX",
            "Handlebars",
            "Markdown",
            { heading: "Data" },
            "Types",
            "Store",
            "Drivers",
            { heading: "Bindings" },
            "Binding",
            "TypeScript",
            "Go",
            "Python",
            "Ruby",
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
