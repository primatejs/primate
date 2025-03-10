import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "error in config file: {0}",
  fix: "check errors in config file by running {1}",
});
