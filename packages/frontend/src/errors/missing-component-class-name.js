import error from "@primate/core/logger/error";

export default error({
  name: "MissingComponentClassName",
  message: "the component at {0} is missing a class name",
  fix: "add a class name to the component",
  module: "primate/frontend/webc",
});
