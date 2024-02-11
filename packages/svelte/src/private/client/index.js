import spa from "./spa.js";

export default ({ names, data, subscribers = [], context, request }, options) => `
  import * as components from "app";
  let root = new components.root_svelte({
    target: document.body,
    hydrate: ${options.ssr ? "true" : "false"},
    props: {
      components: [${names.map(name => `components.${name}`).join(", ")}],
      data: ${JSON.stringify(data)},
      subscribers: ${JSON.stringify(subscribers)},
      context: ${JSON.stringify(context)},
      request: {
        ...${JSON.stringify(request)},
        url: new URL(location.href),
      },
    },
  });
  ${options.spa ? spa : ""}`;
