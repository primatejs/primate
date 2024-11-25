import { error } from "#error";

export default error(import.meta.url, {
  message: "{0}: {1}",
  fix: "make sure the request body corresponds to the used content type",
});
