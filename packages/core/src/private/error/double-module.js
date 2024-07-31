import { error } from "#error";

export default error(import.meta.url, {
  message: "double module {0} in {1}",
  fix: "load {0} only once",
});
