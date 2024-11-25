import { error } from "#error";

export default error(import.meta.url, {
  message: "reserved type name {0}",
  fix: "do not use any reserved type names",
});
