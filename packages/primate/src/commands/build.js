import build from "@primate/core/build";

// build for production
export default (target = "web", mode = "production") => build(mode, target);
