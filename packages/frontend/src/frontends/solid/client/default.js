import { generateHydrationScript } from "solid-js/web";
import rootname from "./rootname.js";
import spa from "./spa.js";

const { groups: { code: hydration_script } } = generateHydrationScript()
  .match(/^<script>(?<code>.*?)<\/script>/u);

export default ({ names, data, context, request }, options) => `
  import * as components from "app";
  import { hydrate_solid, render_solid, SolidHead } from "app";

  window._$HY = { events: [], completed: new WeakSet(), r: {} };

  ${hydration_script}

  SolidHead.clear();
  let dispose = hydrate_solid(() => components.${rootname}({
      components: [${names.map(name => `components.${name}`).join(", ")}],
      data: ${JSON.stringify(data)},
      context: ${JSON.stringify(context)},
      request: {
        ...${JSON.stringify(request)},
        url: new URL(location.href),
      },
    }), globalThis.window.document.body);
  ${options.spa ? spa : ""}`;
