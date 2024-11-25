import { error } from "#error";

export default error(import.meta.url, {
  message: "empty config file at {0}",
  fix: "add configuration options to the file or remove it",
});
