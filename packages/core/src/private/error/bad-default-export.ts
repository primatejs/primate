import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "bad default export at {0}",
  fix: "use only functions for the default export of the given file",
});
