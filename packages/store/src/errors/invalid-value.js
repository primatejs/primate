import error from "@primate/core/logger/error";

export default error({
  name: "InvalidValue",
  message: "value {0} could not be unpacked to {1}",
  fix: "change type for {2} or correct data in databases",
  module: "primate/store",
});
