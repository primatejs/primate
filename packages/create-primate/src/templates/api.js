import {confirm} from "../prompts.js";
import store from "../store.js";
import link from "../link.js";

export default async () => {
  const confs = [];

  if (await confirm({message: `Add a data store? ${link("store")}`})) {
    confs.push({...await store(), modules: ["store"]});
  }

  if (await confirm({message: `Add user sessions? ${link("session")}`})) {
    confs.push({
      dependencies: {
        session: "@primate/session",
      },
      modules: {
        session: "",
      },
    });
  }

  return confs;
};
