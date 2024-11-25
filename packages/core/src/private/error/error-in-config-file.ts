import { error } from "#error";

export default error(import.meta.url, {
  message: "error in config file: {0}",
  fix: "check errors in config file by running {1}",
});
