import build from "@primate/core/build";

// build for production
export default (mode = "production", target = "web") => build(mode, target);
