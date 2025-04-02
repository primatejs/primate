import build from "@primate/core/build";
import type Mode from "@primate/core/Mode";

// build for production
export default (target = "web", mode: Mode = "production") =>
  build(mode, target);
