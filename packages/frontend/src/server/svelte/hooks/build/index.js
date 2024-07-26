import build from "@primate/frontend/base/build";
import create_root from "@primate/frontend/svelte/client/create-root";
import expose from "@primate/frontend/svelte/client/expose";
import { dependencies, name } from "@primate/frontend/svelte/common";
import * as compile from "./compile.js";
import publish from "./publish.js";

export default extension => build({
  create_root,
  extension,
  dependencies,
  name,
  actions: { compile, expose, publish },
});