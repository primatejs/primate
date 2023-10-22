import rootname from "./rootname.js";
import liveview from "./liveview.js";

export default ({ names, data, context, request }, options) => `
  import * as components from "app";
  let root = new components.${rootname}({
    target: document.body,
    hydrate: true,
    props: {
      components: [${names.map(name => `components.${name}`).join(", ")}],
      data: JSON.parse(${JSON.stringify(JSON.stringify(data))}),
      context: JSON.parse(${JSON.stringify(JSON.stringify(context))}),
      request: {
        ...JSON.parse(${JSON.stringify(JSON.stringify(request))}),
        url: new URL(location.href),
      },
    },
  });
  ${options.liveview ? liveview : ""}`;
