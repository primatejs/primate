import rootname from "./rootname.js";
import liveview from "./liveview.js";

export default ({ names, data, context, request }, options) => `
  import * as components from "app";
  import { hydrateRoot, createElement, ReactHead } from "app";

  ReactHead.clear();
  const root = hydrateRoot(globalThis.window.document.body,
    createElement(components.${rootname}, {
      components: [${names.map(name => `components.${name}`).join(", ")}],
      data: JSON.parse(${JSON.stringify(JSON.stringify(data))}),
      context: JSON.parse(${JSON.stringify(JSON.stringify(context))}),
      request: {
        ...JSON.parse(${JSON.stringify(JSON.stringify(request))}),
        url: new URL(location.href),
      },
    })
  );
  ${options.liveview ? liveview : ""}`;
