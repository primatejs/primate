import { warn } from "#error";

export default warn(import.meta.url, {
  message: "transaction {0} rolled back due to previous error",
  fix: "address previous {1} error",
});
