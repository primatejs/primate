import {confirm} from "../prompts.js";
import store from "../store.js";
import link from "../link.js";

export default async () => {
  const configs = [];

  if (await confirm({message: `Add a data store? ${link("store")}`})) {
    configs.push({...await store(), modules: ["store"]});
  }

  if (await confirm({message: `Add user sessions? ${link("session")}`})) {
    configs.push({
      dependencies: {
        session: "@primate/session",
      },
      imports: {
        session: "@primate/session",
      },
      modules: {
        session: "",
      },
    });
  }

  return configs;
};
