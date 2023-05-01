import priss from "priss";
//import blog from "@priss/blog";
//import {master} from "@priss/themes";
const master = i => i;
const blog = () => undefined;

export default {
  http: {
    host: "0.0.0.0",
  },
  modules: [priss({
    title: "Primate",
    description: "Expressive, minimal and extensible web framework",
    root: "content",
    theme: master({
      navbar: [
        {label: "Guide", link: "/guide/getting-started"},
        {label: "Modules", link: "/modules/official"},
        /*{label: "Blog", link: "/blog"},*/
      ],
      sidebar: {
        guide: [
          {heading: "Introduction"},
          "Getting started",
          "Project structure",
          "Configuration",
          "Use cases",
          {heading: "Basics"},
          "Handling requests",
          "Routing",
          "Components",
          {heading: "Module system"},
          "Extending Primate",
          "Hooks",
          {heading: "Advanced"},
          "Security",
        ],
        reference: [],
        modules: [
          {heading: "Modules"},
          "Official",
          "Third-party",
          {heading: "Frontend"},
          "Frameworks",
          "Svelte",
          "React",
          "Vue",
          "HTMX",
          {heading: "Data"},
          "Stores",
          "JSON",
          "File",
          "MongoDB",
          "PostgreSQL",
          {heading: "Others"},
          "Sessions",
          "esbuild",
        ],
      },
      github: "primatejs/primate",
    }),
    uses: [blog()],
  })],
};
