import warn from "@primate/core/logger/warn";

export default warn({
  name: "InvalidDocument",
  message: "document validation failed for {0}",
  fix: "check and fix errors",
  module: "primate/store",
});
