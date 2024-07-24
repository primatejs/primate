import { default_extension, name } from "@primate/binding/go/common";
import build from "./build.js";

export default ({ extension = default_extension } = {}) => ({
  name: `@primate:${name}`,
  build: build({ extension }),
});
