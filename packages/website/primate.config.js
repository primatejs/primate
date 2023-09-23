import priss from "priss";
//import {master} from "@priss/themes";
const master = i => i;

export default {
  http: {
    host: "0.0.0.0",
  },
  modules: [priss({
    blog: true,
    title: "Primate",
    description: "Expressive, minimal and extensible web framework",
    root: "content",
    theme: master({
      navbar: [
        {label: "Guide", link: "/guide/getting-started"},
        {label: "Modules", link: "/modules/official"},
        {label: "Blog", link: "/blog"},
      ],
      sidebar: {
        guide: [
          {heading: "Introduction"},
          "Getting started",
          "Project structure",
          "Configuration",
          "Use cases",
          {heading: "Concepts"},
          "Routes",
          "Responses",
          "Types",
          "Guards",
          "Components",
          "Layouts",
          "Errors",
          {heading: "Modules"},
          "Extending Primate",
          "Hooks",
          {heading: "Extras"},
          "Logging",
        ],
        reference: [
          {heading: "Errors"},
          {
            errors: [
              "primate",
              "primate/store",
              "primate/ws",
            ],
          },
        ],
        modules: [
          {heading: "Modules"},
          "Official",
          "Third-party",
          {heading: "Handlers"},
          "Frontend",
          "Svelte",
          "React",
          "Solid",
          "Vue",
          "HTMX",
          "Handlebars",
          "Markdown",
          {heading: "Data"},
          "Types",
          "Store",
          "Drivers",
          {heading: "Others"},
          "Liveview",
          "Session",
          "WebSocket",
          "esbuild",
        ],
      },
      github: "primatejs/primate",
      x: "primatejs",
      chat: "https://web.libera.chat#primate",
    }),
  })],
};
