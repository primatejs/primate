import warn from "@primate/core/logger/warn";

export default warn({
  name: "NoStoreDirectory",
  message: "store directory does not exist",
  fix: "create {0} and populate it",
  module: "primate/store",
});
