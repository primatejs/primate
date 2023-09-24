import { confirm } from "./prompts.js";
import link from "./link.js";
import dependencies from "./dependencies.js";
import { svelte, react, solid } from "./frameworks/exports.js";

const active = [svelte, react, solid];
const message = `Add liveview support? ${link("liveview")}`;
const check = framework => [active].includes(framework) && confirm({ message });

export default async framework => await check(framework)
  ? {
      dependencies: {
        "@primate/liveview": dependencies["@primate/liveview"],
      },
      imports: {
        liveview: "@primate/liveview",
      },
      modules: {
        liveview: "",
      },
    }
  : {};
