import { error } from "#error";

export default error(import.meta.url, {
  message: "bad type export at {0}",
  fix: "export object with a `base` string and a `validate` function",
});
