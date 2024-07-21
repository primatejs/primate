import { name, default_extension } from "@primate/frontend/handlebars/common";
import serve from "./serve.js";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
