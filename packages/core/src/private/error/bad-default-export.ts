import { error } from "#error";

export default error(import.meta.url, {
  message: "bad default export at {0}",
  fix: "use only functions for the default export of the given file",
});
