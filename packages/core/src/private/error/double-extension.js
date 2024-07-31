import { error } from "#error";

export default error(import.meta.url, {
  message: "double file extension {0}",
  fix: "unload one of the two handlers registering the file extension",
});
