import { error } from "#error";

export default error(import.meta.url, {
  message: "bad type name {0}",
  fix: "use lowercase-first latin letters and decimals in type names",
});
