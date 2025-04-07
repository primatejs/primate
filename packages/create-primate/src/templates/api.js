import { confirm } from "../prompts.js";
import store from "../store.js";
import link from "../link.js";

export default async root => {
  const configs = [];

  if (await confirm({ message: `Add a data store? ${link("store")}` })) {
    configs.push({ ...await store(root), modules: ["store"] });
  }

  return configs;
};
