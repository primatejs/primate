import { warn } from "#error";

export default warn(import.meta.url, {
  message: "empty store directory",
  fix: "populate {0} with stores",
});
