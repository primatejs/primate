import warn from "@primate/core/logger/warn";

export default warn({
  name: "TransactionRollback",
  message: "transaction {0} rolled back due to previous error",
  fix: "address previous {1} error",
  module: "primate/store",
});
