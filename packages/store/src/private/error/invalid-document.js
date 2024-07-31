import { warn } from "#error";

export default warn(import.meta.url, {
  message: "document validation failed for {0}, errors:\n{1}",
  fix: "check and fix errors",
});
