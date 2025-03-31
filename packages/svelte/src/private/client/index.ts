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
  import { hydrate, mount } from "app";

  const root = ${options.ssr ? "hydrate" : "mount"}(components.root_svelte, {
    target: document.body,
    props: {
      p: {
        components: [${names.map(name => `components.${name}`).join(", ")}],
        data: ${JSON.stringify(data)},
        request: {
          ...${JSON.stringify(request)},
          url: new URL(location.href),
        },
        update: () => undefined,
      },
    },
  });
  ${options.spa ? spa : ""}`;
