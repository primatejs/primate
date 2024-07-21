import error from "@primate/core/logger/error";

export default error({
  name: "NoDependencies",
  message: "cannot find {0} (imported from {1})",
  fix: "install dependencies by issuing {2}",
  module: "primate/store",
});
