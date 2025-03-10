import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "double module {0} in {1}",
  fix: "load {0} only once",
});
