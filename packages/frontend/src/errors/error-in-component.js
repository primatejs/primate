import error from "@primate/core/logger/error";

export default error({
  name: "ErrorInComponent",
  message: "error in component {0}",
  fix: "fix previous error in {1}",
  module: "primate/frontend",
});
