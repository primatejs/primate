import { confirm, select } from "../prompts.js";
import store from "../store.js";
import link from "../link.js";
import dependencies from "../dependencies.js";
import * as framework from "../frameworks/exports.js";

const labels = new Map([
  [framework.none, "None"],
  [framework.angular, "Angular"],
  [framework.eta, "Eta"],
  [framework.handlebars, "Handlebars"],
  [framework.html, "HTML"],
  [framework.htmx, "HTMX"],
  [framework.markdown, "Markdown"],
  [framework.marko, "Marko"],
  [framework.react, "React"],
  [framework.solid, "Solid"],
  [framework.svelte, "Svelte"],
  [framework.voby, "Voby"],
  [framework.vue, "Vue"],
  [framework.webc, "Web Components"],
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

  return configs;
};
