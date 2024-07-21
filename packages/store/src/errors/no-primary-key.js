import error from "@primate/core/logger/error";

export default error({
  name: "NoPrimaryKey",
  message: "primary key {0} does not exist in store {1}",
  fix: "add an {0} field or set {2} to the store",
  module: "primate/store",
});
