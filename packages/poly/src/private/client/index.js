import spa from "./spa.js";

export default ({ names, data, context, request }, options) => `
  import * as components from "app";

  let root = new components.root_poly({
    target: document.body,
    hydrate: ${options.ssr ? "true" : "false"},
    props: {
      components: [${names.map(name => `components.${name}`).join(", ")}],
      data: ${JSON.stringify(data)},
      context: ${JSON.stringify(context)},
      request: {
        ...${JSON.stringify(request)},
        url: new URL(location.href),
      },
    },
  });
  ${options.spa ? spa : ""}`;
