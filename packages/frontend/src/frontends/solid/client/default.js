import {generateHydrationScript} from "solid-js/web";
import rootname from "./rootname.js";
import liveview from "./liveview.js";

const {groups: {code: hydration_script}} = generateHydrationScript()
  .match(/^<script>(?<code>.*?)<\/script>/u);

export default ({names, data}, options) => `
  import * as components from "app";
  import {hydrate_solid, render_solid} from "app";

  window._$HY = {events: [], completed: new WeakSet(), r: {}};

  ${hydration_script}

  let dispose = hydrate_solid(() => components.${rootname}({
      components: [${names.map(name => `components.${name}`).join(", ")}],
      data: JSON.parse(${JSON.stringify(JSON.stringify(data))}),
    }), globalThis.window.document.body);
  ${options.liveview ? liveview : ""}`;
