import { error } from "#error";

export default error(import.meta.url, {
  message: "optional route {0} must be a leaf",
  fix: "move route to leaf (last) position in filesystem hierarchy",
});
