import {confirm, select} from "../prompts.js";
import store from "../store.js";
import link from "../link.js";
import dependencies from "../dependencies.js";
import {none, svelte, react, vue, htmx} from "../frameworks/exports.js";

const labels = new Map([
  [none, "None (HTML only)"],
  [svelte, "Svelte"],
  [react, "React"],
  [vue, "Vue"],
  [htmx, "HTMX"],
]);

const options = [...labels.entries()].map(([value, label]) => ({value, label}));

export default async () => {
  const configs = [];

  const frontend = await (await select({
    message: "Choose frontend framework",
    options,
  }))();

  if (frontend !== undefined) {
    configs.push(frontend);
  }

  if (await confirm({message: `Add a data store? ${link("store")}`})) {
    configs.push({...await store()});
  }

  if (await confirm({message: `Add user sessions? ${link("session")}`})) {
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
  if (await confirm({message: `Add WebSocket support? ${link("websocket")}`})) {
    configs.push({
      dependencies: {
        "@primate/ws": dependencies["@primate/ws"],
      },
      imports: {
        ws: "@primate/ws",
      },
      modules: {
        ws: "",
      },
    });
  }

  if (await confirm({message: `Enable esbuild? ${link("esbuild")}`})) {
    configs.push({
      dependencies: {
        "@primate/esbuild": dependencies["@primate/esbuild"],
      },
      imports: {
        esbuild: "@primate/esbuild",
      },
      modules: {
        esbuild: "",
      },
    });
  }

  return configs;
};
