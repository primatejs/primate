import { handlebars, markdown, svelte } from "@primate/frontend";
import join from "@rcompat/fs/join";
import { getHighlighter } from "shiki";
import priss from "./module.js";

const theme = "nord";
const highlighter = await getHighlighter({
  themes: [theme],
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

const install = module => `{% tabs %}

\`\`\`sh#npm
npm install ${module}
\`\`\`

\`\`\`sh#pnpm
pnpm install ${module}
\`\`\`

\`\`\`sh#Yarn
yarn add ${module}
\`\`\`

\`\`\`sh#Deno
deno install ${module}
\`\`\`

\`\`\`sh#Bun
bun install ${module}
\`\`\`

{% /tabs %}`;

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
            return html
              .replaceAll(/\{% install=(.*?) %\}/gus, (_, p1) => install(p1))
              .replaceAll(/\{% tabs %\}(.*?)\{% \/tabs %\}/gus, (_, p1) => {
                const captions = [];
                const t = p1
                  .split("\n```")
                  .filter(p => p !== "" && !p.startsWith("\n"))
                  .map((p, i) => {
                    const [first, ...rest] = p.split("\n");
                    const [lang, caption] = first.split("#");
                    captions.push(caption);
                    return `<div${i === 0 ? "" : " class='hidden'"}>

\`\`\`${[lang, ...rest].join("\n")}
\`\`\`

</div>`;
                  }).join("");
                return `<div class="tabbed"><span class="captions">${
                  captions.map((caption, i) => `<span${i === 0 ? " class='active'" : ""}>${caption}</span>`).join("")
                }</span><span class="tabs">${t}</span></div>`;
              });
          },
          postprocess(html) {
            return html.replaceAll(/!!!\n(.*?)\n!!!/gus, (_, p1) =>
              `<div class="info">${p1}</div>`);
          },
        },
        renderer: {
          code(code, infostring) {
            const [lang, caption] = infostring.split("#");
            const top = caption ? `<div class="caption">${caption}</div>` : "";
            const value = highlighter.codeToHtml(code, {
              lang,
              themes: {
                light: theme,
                dark: theme,
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
      root: join("components", "content"),
      theme: master({
        navbar: [
          { label: "Docs", link: "/docs/why-primate" },
          { label: "Guides", link: "/guides/official" },
          { label: "Blog", link: "/blog" },
        ],
        sidebar: {
          docs: [
            { heading: "Intro" },
            "Why Primate?",
            "Getting started",
            "Project structure",
            "Configuration",
            "Use cases",
            { heading: "Concepts" },
            "Backends",
            "Routes",
            "Responses",
            "Types",
            "Guards",
            "Frontends",
            "Components",
            "Layouts",
            "Errors",
            "Targets",
            { heading: "Modules" },
            "Extending Primate",
            "Hooks",
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
            { heading: "Extras" },
            "Logging",
          ],
          errors: [
            { heading: "Errors" },
            "Core",
            "Frontend",
            "Go",
            "HTMX",
            "I18N",
            "Store",
            "WebC",
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
