import { build } from "@primate/core";

// build for production
export default (target = "web") => build("production", target);
