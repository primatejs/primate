import spa from "./spa.js";

export default ({ names, data, context, request }, options) => `
  import * as components from "app";
  import { hydrate, mount } from "app";

  const root = ${options.ssr ? "hydrate" : "mount"}(components.root_svelte, {
    target: document.body,
    props: {
      p: {
        components: [${names.map(name => `components.${name}`).join(", ")}],
        data: ${JSON.stringify(data)},
        context: ${JSON.stringify(context)},
        request: {
          ...${JSON.stringify(request)},
          url: new URL(location.href),
        },
        update: () => undefined,
      },
    },
  });
  ${options.spa ? spa : ""}`;
