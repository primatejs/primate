import { error } from "#error";

export default error(import.meta.url, {
  message: "field {0} in store {1} has invalid type",
  fix: "use a valid type",
});
