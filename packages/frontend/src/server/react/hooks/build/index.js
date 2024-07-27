import build from "@primate/frontend/base/build";
import create_root from "@primate/frontend/react/client/create-root";
import expose from "@primate/frontend/react/client/expose";
import { name } from "@primate/frontend/react/common";
import * as compile from "./compile.js";
import publish from "./publish.js";

export default extension => build({
  create_root,
  extension,
  name,
  actions: { compile, expose, publish },
});
