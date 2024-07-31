import { error } from "#error";

export default error(import.meta.url, {
  message: "could not find driver {0}",
  fix: "install driver by issuing {1}",
});
