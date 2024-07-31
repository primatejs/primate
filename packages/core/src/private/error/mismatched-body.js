import { error } from "#error";

export default error(import.meta.url, {
  message: "{0}: {1}",
  fix: "make sure the body payload corresponds to the used content type",
});
