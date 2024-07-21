import error from "@primate/core/logger/error";

export default error({
  name: "InvalidType",
  message: "field {0} in store {1} has invalid type",
  fix: "use a valid type",
  module: "primate/store",
});
