import warn from "@primate/core/logger/warn";

export default warn({
  name: "NoDocument",
  message: "no document found with primary key {0}={1}",
  fix: "check first for existence with {2} or use {3}",
  module: "primate/store",
});
