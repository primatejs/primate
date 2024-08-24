import { File } from "rcompat/fs";
import { svelte, markdown, handlebars } from "@primate/frontend";
import { getHighlighter } from "shiki";
import priss from "./module.js";

const highlighter = await getHighlighter({
  themes: ["vitesse-light", "vitesse-dark"],
  langs: [
    // backend
    "javascript",
    "typescript",
    "go",
    "python",
    "ruby",
    // frontend
    "jsx",
    "svelte",
    "vue",
    "angular-ts",
    "html",
    "handlebars",
    "markdown",
    "marko",
    // other
    "shell",
    "json",
    "http",
  ],
});

const master = i => i;

export default {
  http: {
    host: "0.0.0.0",
  },
  logger: {
    trace: true,
  },
  build: {
    excludes: ["*.woff2", "*.jpg"],
  },
  modules: [
    svelte(),
    handlebars(),
    markdown({
      options: {
        hooks: {
          preprocess(html) {
            return html.replaceAll(/%%%(.*?)\n(.*?)%%%/gus, (_, p1, p2) => {
              const t =
              p2
                .split("\n```")
                .filter(p => p !== "" && !p.startsWith("\n"))
                .map((p, i) => `<div${i === 0 ? "" : " class='hidden'"}>

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
            const [lang] = infostring.split(" ");
            const caption = [...infostring
              .matchAll(/caption=(?<caption>.*)/ug)][0]?.groups.caption;
            const top = caption ? `<div class="caption">${caption}</div>` : "";
            const value = highlighter.codeToHtml(code, {
              lang,
              themes: {
                light: "vitesse-light",
                dark: "vitesse-dark",
              },
            });
            const clipboard = `
              <div class="to-clipboard">
                <svg class="copy" width="16" height="16">
                  <use href="#copy" />
                </svg>
                <svg class="check" width="16" height="16">
                  <use href="#check" />
                </svg>
              </div>

            `;
            return `${top}${clipboard}${value}`;
          },
          heading(text, level) {
            const name = text.toLowerCase().replaceAll(/[?{}%]/gu, "")
              .replace(/[^\w]+/gu, "-");
            const href = "%REPO%/edit/master/docs%PATHNAME%.md";
            const edit_this_page = `
              <a href="${href}" class="edit-this-page">
                <svg class="icon" width="16" height="16">
                  <use href="#edit" />
                </svg>
                Edit on GitHub
              </a>
            `;
            const deeplink = `
              <a class="deeplink" href="#${name}">
                <svg class="icon" width="16" height="16">
                  <use href="#anchor" />
                </svg>
              </a>
            `;

            return `
              <h${level}>
                ${text}
                ${level !== 1 ? deeplink : ""}
              </h${level}>
              <a class="anchor" name="${name}"></a>
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
      root: File.join("components", "content"),
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
              errors: ["primate", "primate/store"],
            },
          ],
          modules: [
            { heading: "Modules" },
            "Official",
            "Third-party",
            "Runtime support",
            { heading: "Frontends" },
            "Frontend",
            "Angular",
            "Eta",
            "Handlebars",
            "HTML",
            "HTMX",
            "Markdown",
            "Marko",
            "React",
            "Solid",
            "Svelte",
            "Voby",
            "Vue",
            "Web Components",
            { heading: "Data" },
            "Schema",
            "Store",
            "Drivers",
            { heading: "Backends" },
            "Backend",
            "Go",
            "Python",
            "Ruby",
            "TypeScript",
            { heading: "Others" },
            "Native",
            "Session",
            "I18N",
          ],
        },
        github: "primatejs/primate",
        x: "primatejs",
        chat: "https://discord.gg/RSg4NNwM4f",
        reddit: "r/primatejs",
      }),
    }),
  ],
};
