import { confirm, select } from "../prompts.js";
import store from "../store.js";
import link from "../link.js";
import dependencies from "../dependencies.js";
import * as framework from "../frameworks/exports.js";

const labels = new Map([
  [framework.none, "None (HTML only)"],
  [framework.svelte, "Svelte"],
  [framework.react, "React"],
  [framework.solid, "Solid"],
  [framework.vue, "Vue"],
  [framework.htmx, "HTMX"],
  [framework.markdown, "Markdown"],
]);

const options = [...labels.entries()].map(([value, label]) => ({ value, label }));

export default async root => {
  const configs = [];

  const selected = await select({
    message: "Choose frontend framework",
    options,
  });

  const frontend = await selected();

  if (frontend !== undefined) {
    configs.push(frontend);
  }

  if (await confirm({ message: `Add a data store? ${link("store")}` })) {
    configs.push({ ...await store(root) });
  }

  if (await confirm({ message: `Add user sessions? ${link("session")}` })) {
    configs.push({
      dependencies: {
        "@primate/session": dependencies["@primate/session"],
      },
      imports: {
        session: "@primate/session",
      },
      modules: {
        session: "",
      },
    });
  }

  if (await confirm({ message: `Enable bundling? ${link("build")}` })) {
    configs.push({
      dependencies: {
        "@primate/build": dependencies["@primate/build"],
      },
      imports: {
        "{ esbuild }": "@primate/build",
      },
      modules: {
        esbuild: "",
      },
    });
  }

  return configs;
};
