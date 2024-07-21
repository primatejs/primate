import warn from "@primate/core/logger/warn";

export default warn({
  name: "EmptyStoreDirectory",
  message: "empty store directory",
  fix: "populate {0} with stores",
  module: "primate/store",
});
