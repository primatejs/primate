import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "optional route {0} must be a leaf",
  fix: "move route to leaf (last) position in filesystem hierarchy",
});
