import { error } from "#error";

export default error(import.meta.url, {
  message: "cannot find {0} (imported from {1})",
  fix: "install dependencies by issuing {2}",
});
