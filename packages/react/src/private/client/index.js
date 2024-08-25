import spa from "./spa.js";

export default ({ names, data, subscribers = [], context, request }, options) => `
  import * as components from "app";
  import { make_root, createElement, ReactHead } from "app";

  const { body } = globalThis.window.document;

  ReactHead.clear();
  const root = make_root.${options.ssr ? "ssr" : "csr"}(body,
    createElement(components.root_react, {
      components: [${names.map(name => `components.${name}`).join(", ")}],
      subscribers: ${JSON.stringify(subscribers)},
      data: ${JSON.stringify(data)},
      context: ${JSON.stringify(context)},
      request: {
        ...${JSON.stringify(request)},
        url: new URL(location.href),
      },
    })
  );
  ${options.spa ? spa : ""}`;
