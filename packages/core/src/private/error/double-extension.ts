import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "double file extension {0}",
  fix: "unload one of the two handlers registering the file extension",
});
