import error from "@primate/core/logger/error";

export default error({
  name: "NoDriver",
  message: "could not find driver {0}",
  fix: "install driver by issuing {1}",
  module: "primate/store",
});
