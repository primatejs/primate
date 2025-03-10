import warn from "#log/warn";
import name from "#name";

export default warn(name)(import.meta.url, {
  message: "empty route file at {0}",
  fix: "add routes to the file or remove it",
});
