import { error } from "#error";

export default error(import.meta.url, {
  message: "bad body returned from route, got {0}",
  fix: "return a proper body from route",
});
