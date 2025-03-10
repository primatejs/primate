import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "{0}: {1}",
  fix: "make sure the request body corresponds to the used content type",
});
