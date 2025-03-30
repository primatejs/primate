import type Dictionary from "@rcompat/record/Dictionary";
import { generateHydrationScript } from "solid-js/web";
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

const hydration_script = generateHydrationScript()
  .match(/^<script>(?<code>.*?)<\/script>/u)?.groups?.code ?? "";

export default ({ names, data, request }: Init, options: Options) => `
  import * as components from "app";
  import { hydrate_solid, render_solid, SolidHead } from "app";

  window._$HY = { events: [], completed: new WeakSet(), r: {} };

  ${hydration_script}

  SolidHead.clear();
  let dispose = hydrate_solid(() => components.root_solid({
      components: [${names.map(name => `components.${name}`).join(", ")}],
      data: ${JSON.stringify(data)},
      request: {
        ...${JSON.stringify(request)},
        url: new URL(location.href),
      },
    }), globalThis.window.document.body);
  ${options.spa ? spa : ""}`;
