import {confirm} from "../prompts.js";
import dependencies from "../dependencies.js";
import link from "../link.js";

export default async () => {
  const liveview = await confirm({
    message: `Add liveview support? ${link("liveview")}`,
  })
    ? {
      dependencies: {
        "@primate/live": dependencies["@primate/liveview"],
      },
      modules: {
        liveview: "",
      },
    }
    : {dependencies: {}, modules: {}};

  return {
    dependencies: {
      "@primate/svelte": dependencies["@primate/svelte"],
      ...liveview.dependencies,
    },
    imports: {
      svelte: "@primatejs/svelte",
    },
    modules: {
      svelte: "",
      ...liveview.modules,
    },
  };
};
