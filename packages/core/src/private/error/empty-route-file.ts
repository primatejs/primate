import { warn } from "#error";

export default warn(import.meta.url, {
  message: "empty route file at {0}",
  fix: "add routes to the file or remove it",
});
