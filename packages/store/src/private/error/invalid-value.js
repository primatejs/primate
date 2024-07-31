import { error } from "#error";

export default error(import.meta.url, {
  message: "value {0} could not be unpacked to {1}",
  fix: "change type for {2} or correct data in databases",
});
