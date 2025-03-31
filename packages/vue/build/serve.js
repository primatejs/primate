
import serve from "primate/serve";
import config from "./primate.config.js";
const files = {};
import routes from "./b19fc207/routes.js";
     files.routes = routes;
import components from "./b19fc207/components.js";
import target from "./target.js";

await serve(import.meta.url, {
  ...target,
  config,
  files,
  components,
  mode: "development",
});