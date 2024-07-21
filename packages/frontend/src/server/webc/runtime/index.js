import { default_extension, name } from "@primate/frontend/webc/common";
import serve from "./serve.js";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});