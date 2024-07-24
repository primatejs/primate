import error from "@primate/core/logger/error";

export default error({
  name: "ErrorInGoRoute",
  message: "the Go route {0} contains the following error\n {1}",
  fix: "fix the Go error",
  module: "primate/binding",
});
