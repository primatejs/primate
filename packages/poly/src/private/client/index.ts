import type Dictionary from "@rcompat/record/Dictionary";
import spa from "./spa.js";

type Init = {
  names: string[],
  data: Dictionary[],
  request: Dictionary,
};

type Options = {
  spa: boolean,
  ssr: boolean,
};

export default ({ names, data, request }: Init, options: Options) => `
  import * as components from "app";

  let root = new components.root_poly({
    target: document.body,
    hydrate: ${options.ssr ? "true" : "false"},
    props: {
      components: [${names.map(name => `components.${name}`).join(", ")}],
      data: ${JSON.stringify(data)},
      request: {
        ...${JSON.stringify(request)},
        url: new URL(location.href),
      },
    },
  });
  ${options.spa ? spa : ""}`;
